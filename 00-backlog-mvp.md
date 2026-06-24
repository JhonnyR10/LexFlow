# LexFlow — Backlog di prodotto, casi d'uso e MVP

Documento destinato all'AI di sviluppo (Codex). Linguaggio operativo. Ogni claim non ovvio è classificato: [VERIFICATO] dai documenti di progetto, [INFERITO] deduzione, [ASSUNZIONE] da confermare.

---

## 0. Decisioni confermate e assunzioni residue

**Confermato dal committente**
- Greenfield (da zero).
- Desktop locale mono-utente (Electron + SQLite).
- Workflow configurabile già presente nell'MVP.

**Assunzioni residue [ASSUNZIONE] — confermare o correggere**
1. Codice istanza formato `AAAAMMGG` + sigla + progressivo annuale. La sigla `NP` è trattata come **configurabile** (default `NP`), non hard-coded. La data di riferimento è quella di udienza/interrogatorio.
2. Nome istanza generato `AAAAMMGG_NOTA_SPESE`, maiuscolo, underscore, editabile a mano.
3. I file documentali si salvano sul filesystem locale in `<percorsoDati>/documenti/<codiceIstanza>/`, con riferimento (path + metadati) in DB. Nessun blob in SQLite.
4. "Percorso dati condiviso" tra PC: **fuori MVP**. L'MVP usa un percorso dati locale singolo. La condivisione su cartella di rete reintrodurrebbe concorrenza e va trattata separatamente.
5. Mono-utente: niente autenticazione, niente optimistic locking, niente ruoli. Il campo `version` resta in tabella per audit/futura concorrenza ma non genera conflitti nell'MVP.
6. Backup = singolo file archivio (DB SQLite + cartella documenti + export JSON di sicurezza) con timestamp.

---

## 1. Architettura raccomandata (motivata)

[INFERITO] Stack coerente con i documenti, adattato al desktop mono-utente:

- **Renderer (frontend):** React + TypeScript + Vite. Struttura cartelle come da regole: `api` (qui = client del bridge IPC), `components/{layout,ui}`, `features`, `pages`, `routes`, `hooks`, `store` (Zustand per stato UI), `services`, `types`, `utils`, `validations` (zod). Dati server-side via TanStack Query sopra il bridge IPC.
- **Main process (backend):** TypeScript. Layer `config`, `database` (better-sqlite3-multiple-ciphers + Drizzle), `modules/<dominio>/{controller,service,repository,dto,validation,types}`, `middlewares` (validazione/error), `errors`, `utils`. Il controller riceve la chiamata IPC, valida (zod), chiama il service; il service contiene la business logic; il repository parla con Drizzle.
- **Confine renderer↔main:** **bridge IPC tipizzato** (preload + `contextBridge`), NON un server HTTP. Stessa separazione di responsabilità imposta dai documenti, senza porte/CORS/processo extra. Questo è il punto in cui correggo la regola `Frontend → API HTTP → Backend`: su Electron mono-utente l'HTTP è over-engineering.
- **Sottoinsieme utile da ALTRE_DIRETTIVE [INFERITO]:** validazione `.env`/config con zod all'avvio; logging strutturato (level, timestamp, action); dependency injection via costruttore nei service; audit trail = lo Storico pratica (già previsto). **Scartati per mono-utente locale:** OpenAPI contract-first, migrazioni zero-downtime expand-contract, feature flags, caching con invalidazione, optimistic locking. Si reintroducono solo se l'app diventa multi-utente/web.

---

## 2. Modello dati (entità e relazioni)

[VERIFICATO] derivato dalle specifiche. Chiavi tecniche stabili; nomi visibili modificabili.

- **Practice** (pratica): id, codiceIstanza (univoco), nomeIstanza, collaboratoreId→Collaboratore, professionistaId→Professionista, tipologiaAttivita (menu), dataUdienza, competenza (menu), autoritaGiudiziaria (menu), dataDeposito, modalitaDeposito (menu), importoRichiesto, note, currentPhaseId→Phase, isTrashed, trashedAt, trashReason, createdAt, updatedAt, version. Valori dei campi generali configurabili in `customValues` (JSON keyed by fieldKey).
- **Phase** (fase): id, key, displayName, category (enum logica: deposited, awaiting_decree, decree_received, scp_sent, awaiting_liquidation, liquidated, closed, refused, suspended, annulled, custom), isInitial, isFinal, isActive, order, pecEnabled.
- **Transition:** id, fromPhaseId, toPhaseId, buttonLabel, order, isActive.
- **FieldDef:** id, scope (`general` | `phase`), phaseId (null se general), key, label, type (testo_breve, testo_lungo, numero, importo, data, menu, si_no, note, file), required, visibleInTable, usableInFilter, includeInExport, order, isActive, menuSetId (null se non menu).
- **PhaseRecord** (registrazione fase, ripetibile es. solleciti): id, practiceId, phaseId, recordedAt, values (JSON keyed by fieldKey), note.
- **HistoryEvent** (storico): id, practiceId, timestamp, type, title, fromPhaseId, toPhaseId, note, payload, documentId.
- **Professionista:** id, nome, cognome, denominazione (usata nei menu), codiceFiscale, email, pec, telefono, ruolo, note, isActive.
- **Collaboratore:** id, nome, cognome, denominazione, codiceInterno, note, isActive.
- **NumeroProcedimento:** id, practiceId, tipo (menu, es. R.G.N.R.), valore.
- **PecRecipient:** id, practiceId, phaseRecordId, contesto (`deposito` | `scp` | altro), indirizzo. PEC deposito e PEC SCP sono distinte per fase.
- **Document:** id, practiceId, phaseRecordId (null), kind (decreto, fattura, pec, altro), filePath, originalName, metadata (JSON: dataDecreto, numeroDecreto, importo, ecc.), createdAt.
- **MenuSet / MenuOption:** set di opzioni configurabili; opzione: label, value, order, isActive (soft delete). Le opzioni non si cancellano se usate da pratiche: si disattivano.
- **AppSettings:** theme, alertsEnabled (per tipo), alertThresholds {giallo:30, arancione:60, rosso:90}, assistant {localEnabled, apiEnabled, provider, model, apiKeyRef, instructions}, dataPath, appVersion.

**Regole di integrità [VERIFICATO]**
- Collaboratore/Professionista collegati per **ID**, mai per stringa. Non eliminabili se hanno pratiche: solo disattivabili; le pratiche esistenti continuano a mostrarli.
- Cestino = soft delete (`isTrashed`). Le pratiche cestinate sono escluse da Dashboard, Report, filtri ordinari, alert, assistente.
- Importi mancanti → "Non presente"/"Non calcolabile", mai `NaN`/`undefined`.

---

## 3. Casi d'uso

Attore unico: **Amministratore** (mono-utente).

- **UC1 — Configurare il workflow.** Crea/modifica fasi, transizioni, campi generali, campi fase, menu, regola PEC. Esito: la UI delle pratiche genera pulsanti e form leggendo la config, senza modifiche al codice.
- **UC2 — Gestire anagrafiche.** Crea/modifica/disattiva professionisti e collaboratori. Eliminazione bloccata se collegati a pratiche.
- **UC3 — Creare una pratica.** Compila dati generali + campi custom generali; il codice istanza si genera in automatico; PEC deposito se modalità=PEC; numeri procedimento multipli. Pratica nasce nella fase iniziale configurata.
- **UC4 — Avanzare una pratica (registrare fase).** Dalla fase corrente vede solo le transizioni configurate; clicca il pulsante; compila il form dinamico della fase di destinazione; validazione (incluso blocco PEC condizionale); salvataggio aggiorna `currentPhaseId`, crea `PhaseRecord` e `HistoryEvent`. Fasi ripetibili (sollecito) non cambiano necessariamente la fase logica.
- **UC5 — Consultare/filtrare pratiche.** Tabella pratiche attive con colonne rispettose della config; ricerca globale; filtri (fase, collaboratore, professionista, date, importi); ordinamento; codice istanza cliccabile = Apri.
- **UC6 — Gestire documenti.** Carica/sostituisce/elimina decreto e fattura; collegati alla fase; aggiornano i controlli "mancante".
- **UC7 — Monitorare (Dashboard/alert).** Conteggi per fase (card dinamiche), un solo alert aggregato per pratica con severità massima e soglie 30/60/90, anzianità, documenti mancanti, stato vuoto, "Vedi pratiche" → Pratiche filtrate.
- **UC8 — Cestinare/ripristinare.** Sposta nel cestino (con conferma e motivo), ripristina, cancellazione definitiva (esplicita, distruttiva). Mantiene tutti i dati finché cestinata.
- **UC9 — Esportare report.** Riepiloghi per stato/collaboratore/professionista/importi/documenti; export CSV (Excel post-MVP); rispetta i filtri e esclude il cestino.
- **UC10 — Backup/ripristino/reset.** Esporta backup completo; ripristina; reset archivio con backup automatico preventivo e doppia conferma; gestione percorso dati.
- **UC11 — Assistente locale (post-MVP).** Domande in linguaggio naturale su dati attivi; conteggi/riepiloghi; non inventa; API esterna opzionale e spenta di default.

---

## 4. Product backlog

Priorità MoSCoW. `MVP` = nel primo rilascio usabile end-to-end.

### E0 — Fondazioni tecniche `MVP` (Must)
- **S0.1** Scaffolding Electron + React + TS + Vite + better-sqlite3-multiple-ciphers + Drizzle, struttura cartelle conforme. *AC:* `npm run desktop` apre finestra vuota; build verde; layer separati.
- **S0.2** Bridge IPC tipizzato (preload + contextBridge) e client renderer. *AC:* una chiamata ping renderer→main→renderer ritorna tipizzata.
- **S0.3** Config validata con zod all'avvio + logging strutturato. *AC:* avvio fallisce con messaggio chiaro se config invalida.
- **S0.4** Migrazioni Drizzle + seed iniziale (fasi/stati standard, menu base). *AC:* DB creato con fasi standard e menu (Interrogatorio/Processo, GIP/GUP…, PEC/A mano, PEC/Raccomandata).

### E1 — Configurazione istanze (workflow configurabile) `MVP` (Must)
- **S1.1** CRUD fasi (key, displayName, category, isInitial, isFinal, isActive, order, pecEnabled). *AC:* esattamente una fase iniziale; impedito disattivare una fase usata da pratiche attive.
- **S1.2** CRUD transizioni (from/to, buttonLabel, order). *AC:* niente transizione verso fase inattiva; transizioni mostrate solo dalla fase di partenza.
- **S1.3** CRUD campi generali e campi transizione (tipo, obbligo, visibilità tabella/filtri/export, ordine). *AC:* campo transizione non compare in Nuova pratica; campo generale sì.
- **S1.4** CRUD menu a tendina (MenuSet/Option), riordino, soft delete. *AC:* opzione usata non eliminabile, solo disattivabile.
- **S1.5** Regola PEC condizionale (semplice/estesa). *AC:* selezionando modalità=PEC compaiono i campi PEC multi-destinatario; altrimenti restano nascosti e non obbligatori.

### E2 — Anagrafiche `MVP` (Must)
- **S2.1** CRUD Professionisti (collegamento per ID, denominazione nei menu). *AC:* eliminazione bloccata se collegato a pratiche → disattivazione.
- **S2.2** CRUD Collaboratori di giustizia. *AC:* come sopra.

### E3 — Elenco e ricerca pratiche `MVP` (Must)
- **S3.1** Tabella pratiche attive, colonne da config, colonne operative sempre visibili. *AC:* pratiche cestinate escluse; codice istanza cliccabile = Apri.
- **S3.2** Ricerca globale (codice, nome, soggetti, procedimento, autorità, note). *AC:* risultati coerenti, case-insensitive.
- **S3.3** Filtri base (fase, collaboratore, professionista, date, importi) combinabili + azzera. *(Should: filtri avanzati completi)*.
- **S3.4** Ordinamento colonne. Selezione multipla con checkbox limitata al filtrato.

### E4 — Creazione/modifica pratica `MVP` (Must)
- **S4.1** Generazione codice istanza automatica (sigla configurabile, progressivo annuale, anti-duplicato). *AC:* due pratiche stesso giorno → progressivi distinti.
- **S4.2** Form Nuova pratica: dati generali + campi custom generali + PEC deposito + numeri procedimento. *AC:* validazione obbligatori; pratica nasce in fase iniziale.
- **S4.3** Modifica pratica con registrazione nello storico delle modifiche rilevanti.

### E5 — Workflow operativo `MVP` (Must)
- **S5.1** Dettaglio pratica: intestazione, dati generali, soggetti, importi, workflow, storico, documenti, controlli.
- **S5.2** Render dinamico pulsanti = transizioni configurate dalla fase corrente. *AC:* nessun pulsante hard-coded.
- **S5.3** Form dinamico della fase + validazione + blocco PEC. *AC:* salvataggio crea PhaseRecord, aggiorna currentPhaseId, scrive HistoryEvent.
- **S5.4** Coerenza di stato. *AC:* impedito raggiungere "Liquidata" senza decreto e invio SCP registrati.
- **S5.5** Storico/timeline consultabile.

### E6 — Importi `MVP` (Must)
- **S6.1** Quattro importi (richiesto/concesso/fatturato/liquidato) inseriti a mano, niente calcolo fiscale.
- **S6.2** Differenze e % riduzione calcolate; mancanti → "Non calcolabile". *AC:* nessun NaN.

### E7 — Documenti `MVP` (Must)
- **S7.1** Upload/sostituzione/eliminazione decreto e fattura, salvati per codice istanza, collegati alla fase. *AC:* dopo upload, il controllo "decreto mancante" sparisce; documenti restano dopo cestino+ripristino.

### E8 — Dashboard `MVP` (Must)
- **S8.1** Card per fase dinamiche (solo fasi con pratiche attive). *AC:* avanzamento aggiorna i conteggi; cestino escluso.
- **S8.2** Alert aggregato singolo per pratica, severità massima, soglie 30/60/90, colori semantici fissi indipendenti dal tema. *AC:* una pratica con due problemi → un solo box con più motivazioni.
- **S8.3** Giorni dalla data deposito; assente → "Data deposito non presente".
- **S8.4** Anzianità pratiche; stato vuoto archivio; "Vedi pratiche" → Pratiche filtrate.

### E9 — Report (Should; export CSV `MVP`)
- **S9.1** Export CSV pratiche filtrate `MVP`. *AC:* esclude cestino, rispetta filtri.
- **S9.2** Riepiloghi per stato/collaboratore/professionista/importi/documenti *(Should)*.
- **S9.3** Export Excel *(Could)*.

### E10 — Cestino `MVP` (Must)
- **S10.1** Sposta nel cestino con conferma e motivo; data cestinazione. *AC:* escluso da Dashboard/Report/alert/assistente.
- **S10.2** Ripristino (singolo e multiplo) con ritorno nei conteggi.
- **S10.3** Cancellazione definitiva esplicita e irreversibile, con avviso forte.

### E11 — Impostazioni app `MVP` parziale (Must per tema/backup/percorso; resto Should)
- **S11.1** Tema interfaccia con colori alert/errori/azioni distruttive **non sovrascrivibili**. `MVP`.
- **S11.2** Percorso dati: visualizza, copia, cambia. `MVP`.
- **S11.3** Backup completo (DB + documenti) e ripristino. `MVP`.
- **S11.4** Reset archivio con backup automatico preventivo + doppia conferma. `MVP`.
- **S11.5** Card Alert (attiva/disattiva, soglie). *(Should)*.
- **S11.6** Info app/stato sistema/versione. *(Should)*.
- **S11.7** **Backup automatico periodico** (alla chiusura e/o a intervallo configurabile) con rotazione delle ultime N copie. `MVP`. *AC:* alla chiusura dell'app viene creato un archivio; superato N, la copia più vecchia viene rimossa; il percorso dei backup è visibile in Impostazioni; il backup automatico preventivo pre-reset resta indipendente.

### E12 — Assistente (post-MVP)
- **S12.1** Assistente locale rule-based su dati attivi (conteggi, riepiloghi, pratiche ferme, documenti mancanti); non inventa. *(Should, v1.1)*.
- **S12.2** Modalità API opzionale, spenta di default, nessuna chiamata esterna non richiesta. *(Could)*.
- **S12.3** Pulsante flottante in basso a sinistra, si ritrae su modali critiche. *(Could)*.

### E13 — Qualità trasversale `MVP` (Must)
- **S13.1** Gestione errori + loading state + empty state su ogni vista.
- **S13.2** Validazioni input (zod) lato renderer e main.
- **S13.3** Audit = HistoryEvent su ogni operazione rilevante.
- **S13.4** Numeri procedimento multipli e PEC multi-destinatario per fase. *(PEC `MVP` perché legata a deposito/SCP; numeri procedimento post-MVP)*.

### E14 — Protezione dati sensibili (post-MVP)
- **S14.1** Lock dell'app con password all'avvio. *(Should, v1.1)*.
- **S14.2** Cifratura a riposo del DB (SQLCipher via better-sqlite3-multiple-ciphers), abilitabile da impostazioni con migrazione del DB esistente. *(Should, v1.1)*. *Nota:* il driver cifrabile è già adottato in E0 con cifratura spenta, quindi nessun cambio di driver.

### E15 — Scadenzario / termini (post-MVP)
- **S15.1** Entità scadenza/termine per pratica (es. termine risposta integrazione) con data e descrizione. *(Could)*.
- **S15.2** Alert dedicati per scadenze imminenti/superate in Dashboard, distinti dagli alert giorni-da-deposito. *(Could)*.

### E16 — Export PDF scheda pratica (post-MVP)
- **S16.1** Generazione PDF della scheda di una singola pratica (dati, importi, storico, documenti elencati), stampabile/archiviabile. *(Could)*.

---

## 5. Definizione MVP

**Dentro l'MVP:** E0, E1, E2, E3 (con filtri base), E4, E5, E6, E7, E8, E9.1 (export CSV), E10, E11.1–E11.4 + **E11.7 (backup automatico periodico)**, E13 (con PEC).

**Fuori dall'MVP:** report strutturati avanzati (E9.2–9.3), assistente (E12), **protezione dati / cifratura (E14)**, **scadenzario (E15)**, **export PDF scheda pratica (E16)**, viste salvate, filtri avanzati completi, numeri procedimento multipli, card alert configurabili, percorso dati condiviso multi-PC, API esterna. *(Nota: il driver DB cifrabile è comunque adottato già in E0, cifratura spenta.)*

**Definition of Done (per ogni storia):** build/typecheck/lint/desktop verdi; funzionalità preesistenti non rotte; layer rispettati; tipi senza `any`; loading/empty/error gestiti; HistoryEvent dove pertinente; doc in `docs/` aggiornato se il requisito è cambiato; `docs/PROGRESS.md` aggiornato; commit Git con messaggio chiaro; conferma utente prima della storia successiva.

---

## 6. Rischi e decisioni aperte minori

- [INFERITO] Il motore di workflow configurabile è la parte a rischio: va costruito presto (E1+E5) perché tutto il resto vi si appoggia. Sequenza consigliata: E0 → E1 → E2 → E4 → E5 → E3 → E6/E7 → E8 → E10 → E11 → E9.1 → E13.
- [ASSUNZIONE] Sigla codice (`NP`) configurabile: se deve restare fissa, segnalalo.
- [ASSUNZIONE] Storage documenti su filesystem: se preferisci blob in DB (backup più semplice ma DB pesante), segnalalo.
- [UNCERTAIN] Volumi attesi di pratiche non documentati. Su SQLite mono-utente nessun problema fino a decine di migliaia di righe; oltre, da rivalutare indicizzazione.

---

## 7. Prossimo passo

Il primo intervento di sviluppo è **PASSO 1 — Scaffolding (E0)**. Su tuo OK preparo: istruzioni VS Code/terminale, comandi esatti, prompt per Codex, verifiche e comandi Git, secondo il metodo passo-dopo-passo. Non procedo finché non confermi questo documento (o indichi le correzioni alle assunzioni).
