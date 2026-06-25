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

- **Renderer (frontend):** React + TypeScript + Vite. Struttura cartelle: `api` (client bridge IPC), `components/{layout,ui}`, `features`, `pages`, `routes`, `hooks`, `store` (Zustand), `utils`. Dati server-side via TanStack Query sopra il bridge IPC.
- **Main process (backend):** TypeScript. Layer `config`, `database` (better-sqlite3-multiple-ciphers + Drizzle), `modules/<dominio>/{controller,service,repository}`, `middlewares`, `errors`, `utils`. Validazione zod inline nel controller; service contiene business logic; repository parla con Drizzle. Struttura dettagliata in `docs/01-architecture.md`.
- **Confine renderer↔main:** **bridge IPC tipizzato** (preload + `contextBridge`), NON un server HTTP. Su Electron mono-utente l'HTTP è over-engineering.
- **Pratiche scartate per mono-utente locale:** OpenAPI contract-first, migrazioni expand-contract zero-downtime, feature flags, caching con invalidazione, optimistic locking, DI formale via costruttore. Si reintroducono solo se l'app diventa multi-utente/web.

---

## 2. Modello dati

Il modello dati è definito in `docs/02-data-model.md` (fonte unica). Il workflow canonico — fasi, transizioni e timeline — è in `docs/07-workflow-tree.md`. Questo backlog non riduplica lo schema: leggere quei documenti prima di stimare o implementare storie che toccano il modello.

---

## 3. Casi d'uso

Attore unico: **Amministratore** (mono-utente).

- **UC1 — Configurare il workflow.** Crea/modifica fasi, transizioni, campi generali, campi fase, menu, regola PEC. Esito: la UI delle pratiche genera pulsanti e form leggendo la config, senza modifiche al codice.
- **UC2 — Gestire anagrafiche.** Crea/modifica/disattiva professionisti e collaboratori. Eliminazione bloccata se collegati a pratiche.
- **UC3 — Creare una pratica.** Compila dati generali + campi custom generali; il codice istanza si genera in automatico; PEC deposito se modalità=PEC; numeri procedimento multipli. Pratica nasce nella fase iniziale configurata.
- **UC4 — Avanzare una pratica (registrare transizione).** Dalla fase corrente vede solo le transizioni configurate; clicca il pulsante; compila il form dinamico della transizione; validazione (incluso blocco PEC condizionale); salvataggio aggiorna `currentPhaseId`, crea `TransitionRecord` e `HistoryEvent`. Transizioni ripetibili (sollecito) non cambiano la fase.
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

- **S0.1** Scaffolding Electron + React + TS + Vite + better-sqlite3-multiple-ciphers + Drizzle, struttura cartelle conforme. _AC:_ `npm run desktop` apre finestra vuota; build verde; layer separati.
- **S0.2** Bridge IPC tipizzato (preload + contextBridge) e client renderer. _AC:_ una chiamata ping renderer→main→renderer ritorna tipizzata.
- **S0.3** Config validata con zod all'avvio + logging strutturato. _AC:_ avvio fallisce con messaggio chiaro se config invalida.
- **S0.4** Migrazioni Drizzle + seed iniziale (fasi/stati standard, menu base). _AC:_ DB creato con fasi standard e menu (Interrogatorio/Processo, GIP/GUP…, PEC/A mano, PEC/Raccomandata).

### E1 — Configurazione istanze (workflow configurabile) `MVP` (Must)

- **S1.1** CRUD fasi (key, displayName, category, isInitial, isFinal, isActive, order). _AC:_ esattamente una fase iniziale; impedito disattivare una fase usata da pratiche attive.
- **S1.2** CRUD transizioni (from/to, buttonLabel, order). _AC:_ niente transizione verso fase inattiva; transizioni mostrate solo dalla fase di partenza.
- **S1.3** CRUD campi configurabili: `scope=general` (compaiono in Nuova pratica) e `scope=transition` (compaiono solo nel form di quella transizione). Tipi: `testo_breve, testo_lungo, numero, importo, data, menu, si_no, note, file, pec`. _AC:_ campo transizione non compare in Nuova pratica; campo generale sì.
- **S1.4** CRUD menu a tendina (MenuSet/Option), riordino, soft delete. _AC:_ opzione usata non eliminabile, solo disattivabile.
- **S1.5** Regola PEC condizionale (semplice/estesa). _AC:_ selezionando modalità=PEC compaiono i campi PEC multi-destinatario; altrimenti restano nascosti e non obbligatori.

### E2 — Anagrafiche `MVP` (Must)

- **S2.1** CRUD Professionisti (collegamento per ID, denominazione nei menu). _AC:_ eliminazione bloccata se collegato a pratiche → disattivazione.
- **S2.2** CRUD Collaboratori di giustizia. _AC:_ come sopra.

### E3 — Elenco e ricerca pratiche `MVP` (Must)

- **S3.1** Tabella pratiche attive, colonne da config, colonne operative sempre visibili. _AC:_ pratiche cestinate escluse; codice istanza cliccabile = Apri.
- **S3.2** Ricerca globale (codice, nome, soggetti, procedimento, autorità, note). _AC:_ risultati coerenti, case-insensitive.
- **S3.3** Filtri base (fase, collaboratore, professionista, date, importi) combinabili + azzera. _(Should: filtri avanzati completi)_.
- **S3.4** Ordinamento colonne. Selezione multipla con checkbox limitata al filtrato.

### E4 — Creazione/modifica pratica `MVP` (Must)

- **S4.1** Generazione codice istanza automatica (sigla configurabile, progressivo annuale, anti-duplicato). _AC:_ due pratiche stesso giorno → progressivi distinti.
- **S4.2** Form Nuova pratica: dati generali + campi custom generali + PEC deposito + numeri procedimento. _AC:_ validazione obbligatori; pratica nasce in fase iniziale.
- **S4.3** Modifica pratica con registrazione nello storico delle modifiche rilevanti. Editabili dal dettaglio: nome istanza, soggetti (collaboratore/professionista), tipologia/competenza/autorità, date (udienza/deposito), modalità deposito, importo richiesto, note, campi generali configurabili, destinatari PEC deposito. **Non** editabili da qui: `codiceIstanza` (identità della pratica, read-only) e `currentPhaseId`/fase (si muove solo via transizioni — E5). _AC:_ ogni modifica rilevante (qualsiasi variazione dei campi editabili) genera **un solo** `HistoryEvent` type `updated` con riepilogo dei campi cambiati; salvare senza modifiche non genera eventi; `codiceIstanza` e fase corrente invariati dopo il salvataggio.

### E5 — Workflow operativo `MVP` (Must)

- **S5.1** Dettaglio pratica: intestazione, dati generali, soggetti, importi, workflow, storico, documenti, controlli.
- **S5.2** Render dinamico pulsanti = transizioni configurate dalla fase corrente. _AC:_ nessun pulsante hard-coded.
- **S5.3** Form dinamico della transizione + validazione + blocco PEC. _AC:_ salvataggio crea TransitionRecord, aggiorna currentPhaseId (se cambia fase), scrive HistoryEvent.
- **S5.4** Coerenza di stato. _AC:_ impedito raggiungere "Liquidata" senza decreto e invio SCP registrati.
- **S5.5** Storico/timeline consultabile.

### E6 — Importi `MVP` (Must)

- **S6.1** Quattro importi (richiesto/concesso/fatturato/liquidato), niente calcolo fiscale. `importoRichiesto` si inserisce in Nuova/Modifica pratica; concesso/fatturato/liquidato si compilano nei campi `importo` delle rispettive transizioni (Registra decreto, Registra invio a SCP, Registra liquidazione): la fonte di verità è `TransitionRecord.values`, il service li denormalizza su tre colonne della pratica (cache derivata, **non** editabili a mano). Mappatura esplicita field-key→colonna in `02-data-model.md`. _AC:_ dopo «Registra decreto/invio a SCP/liquidazione» con importo compilato, il rispettivo valore compare nella sezione Importi del dettaglio; gli importi denormalizzati non sono modificabili dal modal Modifica pratica.
- **S6.2** Differenze e % riduzione calcolate al volo (non persistite) dai quattro importi: richiesto−concesso, % riduzione = (richiesto−concesso)/richiesto×100, concesso−fatturato, fatturato−liquidato, concesso−liquidato. Operando mancante o richiesto=0 (per la %) → "Non calcolabile". _AC:_ nessun NaN; mostrate nella sezione Importi del dettaglio.

### E7 — Documenti `MVP` (Must)

- **S7.1** Upload/sostituzione/eliminazione decreto e fattura, salvati per codice istanza, collegati alla fase. L'upload avviene tramite **file dialog nativo** del main process (nessun byte sul bridge IPC, nessun accesso filesystem dal renderer): il file scelto è copiato in `<percorsoDati>/documenti/<codiceIstanza>/`; in DB si salva il solo riferimento con `filePath` **relativo** alla radice documenti. Un solo decreto e una sola fattura per pratica: ricaricare un tipo già presente lo **sostituisce** (vecchio file rimosso). Ogni operazione scrive un `HistoryEvent`; su pratica nel cestino upload/eliminazione sono bloccati (lista e apertura restano consentite). _AC:_ dopo upload, il controllo "decreto mancante" sparisce; documenti restano dopo cestino+ripristino; nessun `NaN`/percorso assoluto fragile salvato in DB.

### E8 — Dashboard `MVP` (Must)

- **S8.1** Card per fase dinamiche (solo fasi con pratiche attive). _AC:_ avanzamento aggiorna i conteggi; cestino escluso.
- **S8.2** Alert aggregato singolo per pratica, severità massima, soglie 30/60/90, colori semantici fissi indipendenti dal tema. _AC:_ una pratica con due problemi → un solo box con più motivazioni.
- **S8.3** Giorni dalla data deposito; assente → "Data deposito non presente".
- **S8.4** Anzianità pratiche; stato vuoto archivio; "Vedi pratiche" → Pratiche filtrate.

### E9 — Report (Should; export CSV `MVP`)

- **S9.1** Export CSV pratiche filtrate `MVP`. _AC:_ esclude cestino, rispetta filtri.
- **S9.2** Riepiloghi per stato/collaboratore/professionista/importi/documenti _(Should)_.
- **S9.3** Export Excel _(Could)_.

### E10 — Cestino `MVP` (Must)

- **S10.1** Sposta nel cestino con conferma e motivo; data cestinazione. _AC:_ escluso da Dashboard/Report/alert/assistente.
- **S10.2** Ripristino (singolo e multiplo) con ritorno nei conteggi.
- **S10.3** Cancellazione definitiva esplicita e irreversibile, con avviso forte.

### E11 — Impostazioni app `MVP` parziale (Must per tema/backup/percorso; resto Should)

- **S11.1** Tema interfaccia con colori alert/errori/azioni distruttive **non sovrascrivibili**. `MVP`.
- **S11.2** Percorso dati: visualizza, copia, cambia. `MVP`.
- **S11.3** Backup completo (DB + documenti) e ripristino. `MVP`.
- **S11.4** Reset archivio con backup automatico preventivo + doppia conferma. `MVP`.
- **S11.5** Card Alert (attiva/disattiva, soglie). _(Should)_.
- **S11.6** Info app/stato sistema/versione. _(Should)_.
- **S11.7** **Backup automatico periodico** (alla chiusura e/o a intervallo configurabile) con rotazione delle ultime N copie. `MVP`. _AC:_ alla chiusura dell'app viene creato un archivio; superato N, la copia più vecchia viene rimossa; il percorso dei backup è visibile in Impostazioni; il backup automatico preventivo pre-reset resta indipendente.

### E12 — Assistente (post-MVP)

- **S12.1** Assistente locale rule-based su dati attivi (conteggi, riepiloghi, pratiche ferme, documenti mancanti); non inventa. _(Should, v1.1)_.
- **S12.2** Modalità API opzionale, spenta di default, nessuna chiamata esterna non richiesta. _(Could)_.
- **S12.3** Pulsante flottante in basso a sinistra, si ritrae su modali critiche. _(Could)_.

### E13 — Qualità trasversale `MVP` (Must)

- **S13.1** Gestione errori + loading state + empty state su ogni vista.
- **S13.2** Validazioni input (zod) lato renderer e main.
- **S13.3** Audit = HistoryEvent su ogni operazione rilevante.
- **S13.4** Numeri procedimento multipli e PEC multi-destinatario per fase. _(PEC `MVP` perché legata a deposito/SCP; numeri procedimento post-MVP)_.

### E14 — Protezione dati sensibili (post-MVP)

- **S14.1** Lock dell'app con password all'avvio. _(Should, v1.1)_.
- **S14.2** Cifratura a riposo del DB (SQLCipher via better-sqlite3-multiple-ciphers), abilitabile da impostazioni con migrazione del DB esistente. _(Should, v1.1)_. _Nota:_ il driver cifrabile è già adottato in E0 con cifratura spenta, quindi nessun cambio di driver.

### E15 — Scadenzario / termini (post-MVP)

- **S15.1** Entità scadenza/termine per pratica (es. termine risposta integrazione) con data e descrizione. _(Could)_.
- **S15.2** Alert dedicati per scadenze imminenti/superate in Dashboard, distinti dagli alert giorni-da-deposito. _(Could)_.

### E16 — Export PDF scheda pratica (post-MVP)

- **S16.1** Generazione PDF della scheda di una singola pratica (dati, importi, storico, documenti elencati), stampabile/archiviabile. _(Could)_.

---

## 5. Definizione MVP

**Dentro l'MVP:** E0, E1, E2, E3 (con filtri base), E4, E5, E6, E7, E8, E9.1 (export CSV), E10, E11.1–E11.4 + **E11.7 (backup automatico periodico)**, E13 (con PEC).

**Fuori dall'MVP:** report strutturati avanzati (E9.2–9.3), assistente (E12), **protezione dati / cifratura (E14)**, **scadenzario (E15)**, **export PDF scheda pratica (E16)**, viste salvate, filtri avanzati completi, numeri procedimento multipli, card alert configurabili, percorso dati condiviso multi-PC, API esterna. _(Nota: il driver DB cifrabile è comunque adottato già in E0, cifratura spenta.)_

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
