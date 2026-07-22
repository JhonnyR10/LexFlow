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
- **S1.3** CRUD campi configurabili: `scope=general` (compaiono in Nuova pratica) e `scope=transition` (compaiono solo nel form di quella transizione). Tipi: `testo_breve, testo_lungo, numero, importo, data, menu, si_no, note, file, pec`. _AC:_ campo transizione non compare in Nuova pratica; campo generale sì. **Cambio menu (Sprint 3):** cambiare il `menuSetId` di un campo menu è **bloccato** se orfanerebbe valori già salvati o condizioni dipendenti (regola `02-data-model.md` §2-ter); consentito verso un menu che contiene comunque quei valori, o se il campo non ha valori salvati.
- **S1.4** CRUD menu a tendina (MenuSet/Option), riordino, soft delete. _AC:_ opzione usata non eliminabile, solo disattivabile. **Scan JSON rigoroso (Sprint 3):** disattivando un campo o un'opzione, la nota informativa è **basata sull'uso reale** — scan di `custom_values`/`transition_records.values` per contare pratiche/registrazioni che valorizzano il campo, o le scelte già salvate dell'opzione (per i campi anche il n° di controllori condizionali). La disattivazione **resta consentita** (reversibile, non corrompe i dati): lo scan informa, non blocca.
- **S1.5** Regola PEC condizionale (semplice/estesa). _AC:_ selezionando modalità=PEC compaiono i campi PEC multi-destinatario; altrimenti restano nascosti e non obbligatori. **Contesto PEC configurabile (Sprint 3):** il campo `pec` ha un `pecContext` opzionale (`deposito|scp|altro`, default «Automatico») che determina il `contesto` dei `PecRecipient` raccolti; «Automatico» deriva dalla fase di destinazione (comportamento storico). Vedi `03-workflow-engine.md` §PEC.
- **C-002 (post-collaudo) — Eliminazione fisica config.** Oltre alla disattivazione, fasi/transizioni/campi/menu (set e opzioni) sono **eliminabili quando non in uso** (regole per entità in `02-data-model.md` §2-bis): blocco con messaggio (popup) se referenziati; **cascata** menu set→opzioni e transizione→campi, in transazione. Chiude i «delete fisica rinviata» di S1.1–S1.4. _AC:_ eliminare un elemento non usato lo rimuove (cascata sui figli posseduti); un elemento in uso è bloccato; gli standard (seed) riappaiono al riavvio (per nasconderli, disattivare). Nessuna migrazione, nessun `HistoryEvent`.

### E2 — Anagrafiche `MVP` (Must)

- **S2.1** CRUD Professionisti (collegamento per ID, denominazione nei menu). _AC:_ eliminazione bloccata se collegato a pratiche → disattivazione. **C-002:** eliminazione fisica consentita **solo se non referenziato da alcuna pratica (attiva o cestinata)**.
- **S2.2** CRUD Collaboratori di giustizia. _AC:_ come sopra (incl. eliminazione fisica C-002).

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
- **S8.2** Alert aggregato singolo per pratica, severità massima, soglie 30/60/90, colori semantici fissi indipendenti dal tema. La severità deriva dai **giorni dalla data deposito**: `> 90` rosso, `> 60` arancione, `> 30` giallo (strettamente maggiori); sotto 30 o senza data deposito la pratica non genera box (il messaggio "Data deposito non presente" è perimetro S8.3). Le motivazioni sono **aggregate** nello stesso box: sempre "Ferma da N giorni dalla data deposito" più, in modo contestuale per category canonica, "Decreto ricevuto ma non ancora inviato a SCP" (fase `decree_received`); le motivazioni contestuali si aggiungono ma non alzano la severità. Esclude pratiche cestinate e fasi finali. Box ordinati per severità (rosso → arancione → giallo) poi per giorni decrescenti, ciascuno cliccabile verso il dettaglio. _AC:_ una pratica con due problemi → un solo box con più motivazioni; colori alert invariati al cambio tema; avanzamento/creazione aggiornano gli avvisi (invalidazione `['dashboard']`).
- **S8.3** Giorni dalla data deposito mostrati nel **dettaglio pratica** (sezione «Dati generali»): "Giorni dalla data deposito: X"; se la data deposito è assente o non parsabile → "Data deposito non presente". Il conteggio usa lo **stesso calcolo puro** degli alert (S8.2), estratto in un modulo condiviso (una sola fonte di verità). _AC:_ con data deposito valorizzata compare il numero di giorni interi (coerente con il "Ferma da N giorni" dell'alert per la stessa pratica); senza data deposito compare "Data deposito non presente"; mai `NaN`/`undefined`. L'anzianità aggregata sulla Dashboard, lo stato vuoto archivio e "Vedi pratiche" → Pratiche filtrate restano **S8.4**.
- **S8.4** Anzianità pratiche; stato vuoto archivio; "Vedi pratiche" → Pratiche filtrate. **Anzianità:** sezione Dashboard con le **5 pratiche aperte più vecchie** (non cestinate, non finali) ordinate per giorni dalla data deposito decrescenti; ogni riga mostra codice istanza (link al dettaglio), nome, fase e "N giorni"; le pratiche senza data deposito sono escluse (non ordinabili per età). Il conteggio usa lo **stesso calcolo puro** degli alert (S8.2). **Stato vuoto archivio:** quando non esiste alcuna pratica attiva, la Dashboard mostra **un solo** blocco "Archivio vuoto. Puoi iniziare creando una nuova pratica oppure ripristinare un backup." con un'azione "Crea una nuova pratica" (→ Pratiche); le sezioni avvisi/anzianità/fasi non vengono mostrate (niente messaggi vuoti duplicati). **Vedi pratiche:** una card per fase è cliccabile e apre Pratiche con il filtro Fase già impostato (deep-link via query string `?phaseId=`). _AC:_ con pratiche presenti compaiono le 5 più vecchie con giorni coerenti con l'alert della stessa pratica; click su una card per fase apre l'elenco già filtrato per quella fase, con la barra filtri modificabile/azzerabile; archivio vuoto → un solo blocco con azione, nessun NaN.
- **S8.5** Sezione «Documenti mancanti» in Dashboard (Sprint 3). Elenca le pratiche **attive non finali** (`isTrashed=false`, fase non finale) a cui manca un documento **atteso** per la fase raggiunta, così una pratica appena depositata non risulta «manca tutto» (rumore). L'attesa ragiona per **category canonica** (come l'alert S8.2), non per key: **decreto** atteso se la fase corrente ha category ∈ {`decree_received`, `awaiting_correction`, `awaiting_appeal`, `awaiting_liquidation`, `awaiting_integration_scp`, `liquidated`}; **fattura** attesa se category ∈ {`awaiting_liquidation`, `awaiting_integration_scp`, `liquidated`}. Una pratica compare solo se le manca almeno un documento atteso; per ciascuna si mostrano i **kind mancanti** (decreto/fattura) come badge, con codice istanza (link al dettaglio), nome e fase. La presenza dei documenti si legge dalla tabella `documents` (E7). _AC:_ una pratica in «Decreto ricevuto» senza documento decreto compare con badge «Decreto»; caricato il decreto (E7) la pratica sparisce dalla sezione (invalidazione `['dashboard']` su upload/elimina documento); una pratica in fase iniziale non compare; cestino e fasi finali esclusi; stato vuoto dedicato quando non manca nulla; nessuna migrazione. Sola lettura, nessun `HistoryEvent`.

### E9 — Report (Should; export CSV `MVP`)

- **S9.1** Export CSV pratiche filtrate `MVP`. Pulsante «Esporta CSV» in «Pratiche» che salva (via **dialog nativo** del main, nessuna scrittura file dal renderer) un `.csv` con le pratiche **attualmente filtrate e cercate** (riusa `filterPractices`, la stessa logica della tabella) ed **esclude il cestino** (le query elenco filtrano già `isTrashed=false`). Formato **Excel italiano**: separatore `;`, **BOM** UTF-8, importi con virgola decimale, date `gg/mm/aaaa`, escaping CSV corretto (virgolette per campi con `;`/`"`/newline). Colonne: codice istanza, nome, fase corrente, collaboratore, professionista, data udienza, data deposito, autorità giudiziaria, **importo richiesto/concesso/fatturato/liquidato** (4 importi; la query elenco è estesa con le colonne denormalizzate E6), note. Il contenuto CSV è costruito nel renderer (dati già in cache) e scritto nel main. Nessuna migrazione; nessun `HistoryEvent`. _AC:_ il file contiene solo le righe filtrate (cestino escluso) con header e i 4 importi; si apre in Excel IT con colonne separate, decimali con virgola e accenti corretti; con 0 risultati filtrati il pulsante è disabilitato; annullare il dialog non crea file.
- **S9.2** Riepiloghi per stato/collaboratore/professionista/importi/documenti _(Should)_. _FATTO. La pagina Report mostra aggregati delle pratiche **attive** (cestino escluso), via un solo IPC read-only `report:summary` (modulo `report`, aggregazione SQL nel backend — nessuna business logic nel renderer). AC:_
  - **Totali importi**: somma richiesto/concesso/fatturato/liquidato + n° pratiche attive; null → «Non presente» (mai `NaN`).
  - **Per stato (fase)**: conteggio pratiche per fase corrente (riuso `findActivePhaseCounts` di dashboard).
  - **Per collaboratore** e **per professionista**: n° pratiche + somma concesso/liquidato, con bucket «Non assegnato» per le pratiche senza relazione, ordinati per conteggio desc.
  - **Documenti**: copertura decreto/fattura sulle pratiche attive (quante ne hanno / quante ne sono prive).
  - Stati loading/empty (archivio senza pratiche attive)/error; leggibile in ogni tema. Nessuna migrazione, nessun `HistoryEvent`. Selettore di periodo ed export Excel restano fuori (S9.3/post-MVP).
- **S9.3** Export Excel _(Could)_.

### E10 — Cestino `MVP` (Must)

- **S10.1** Sposta nel cestino (soft delete) con conferma e motivo; data cestinazione. L'azione è disponibile dal **dettaglio pratica** (singola) e **in blocco** dalla toolbar di selezione dell'elenco (selezione multipla predisposta in S3.4). Una modale di conferma raccoglie un **motivo obbligatorio** (validato zod su renderer e main); al salvataggio le pratiche selezionate ottengono `isTrashed=true`, `trashedAt` (data cestinazione) e `trashReason`, e ciascuna scrive un `HistoryEvent` `type='trashed'` con il motivo (regola 9). Operazione atomica in un'unica transazione; pratiche già cestinate vengono saltate. I file documentali **non** vengono toccati (sopravvivono a cestino + ripristino, E7). La pagina **Cestino** mostra (sola lettura in S10.1) la tabella delle pratiche cestinate con codice istanza cliccabile (= Apri), nome, fase, **data cestinazione** e **motivo**, con messaggio di avviso in testa. _AC:_ dopo la cestinazione la pratica sparisce da elenco/Dashboard/alert/anzianità (le query filtrano già `isTrashed=false`) e compare nel Cestino con data e motivo; conferma senza motivo bloccata; storico con l'evento «Pratica spostata nel cestino». Ripristino → S10.2; cancellazione definitiva → S10.3.
- **S10.2** Ripristino (singolo e multiplo) con ritorno nei conteggi. Il ripristino riporta `isTrashed=false` e azzera `trashedAt`/`trashReason`; la pratica torna in elenco, Dashboard, alert, anzianità e conteggi (le query filtrano già `isTrashed=false`). L'azione è disponibile dalla **pagina Cestino** — singola (pulsante per riga) e in blocco (selezione multipla + toolbar) — e dal **dettaglio** di una pratica cestinata (singola, dal banner). Una **conferma leggera** (modale **senza** motivo, a differenza della cestinazione) precede l'operazione; il ripristino non è distruttivo (nessun colore destructive). Operazione atomica in un'unica transazione: le pratiche non cestinate vengono saltate (idempotenza), `restoredCount` conta solo quelle effettivamente ripristinate ora. Ogni pratica ripristinata scrive un `HistoryEvent` `type='restored'` (regola 9). I file documentali non vengono toccati. _AC:_ dopo il ripristino la pratica sparisce dal Cestino e ricompare in elenco/Dashboard con i conteggi aggiornati; lo storico riporta «Pratica ripristinata dal cestino»; ripristinare una pratica già attiva non genera errori né eventi (`restoredCount=0`). Cancellazione definitiva → S10.3.
- **S10.3** Cancellazione definitiva esplicita e irreversibile, con avviso forte. È una **hard delete**: rimuove fisicamente la riga `practices` e **tutti i suoi figli** dal DB — `documents`, `pec_recipients`, `history_events`, `transition_records` — e rimuove dal filesystem la cartella documenti `<percorsoDati>/documenti/<codiceIstanza>/`. Con `PRAGMA foreign_keys = ON` i figli sono cancellati **prima** della pratica, nell'ordine `documents → pec_recipients → history_events → transition_records → practices`, tutto in **un'unica transazione** (coerenza o rollback); la rimozione della cartella avviene **dopo** il commit (best-effort, errori loggati, non propagati). L'azione è disponibile **solo dalla pagina Cestino** — singola (pulsante per riga) e in blocco (selezione multipla + toolbar); il banner del dettaglio di una cestinata mantiene solo «Ripristina». Si possono eliminare **solo pratiche cestinate** (`isTrashed=true`): le assenti o non cestinate vengono saltate (idempotenza), `deletedCount` conta solo quelle effettivamente rimosse. Una **conferma forte** (modale distruttiva con avviso d'irreversibilità, pulsante `--color-destructive`; **senza** digitazione di una parola) precede l'operazione. **Nessun `HistoryEvent`**: la pratica e i suoi eventi vengono distrutti, non esiste un contenitore dove conservarlo (eccezione motivata alla regola 9); la cancellazione è tracciata via log diagnostico. _AC:_ dopo la cancellazione la pratica sparisce dal Cestino e non ricompare in elenco/Dashboard; le righe figlie e la cartella documenti non esistono più; cancellare una pratica non cestinata o assente non genera errori (`deletedCount=0`); operazione bulk atomica.

### E11 — Impostazioni app `MVP` parziale (Must per tema/backup/percorso; resto Should)

- **S11.1** Tema interfaccia con colori alert/errori/azioni distruttive **non sovrascrivibili**. `MVP`. L'utente sceglie il tema dell'interfaccia in «Impostazioni app» tra cinque palette (Chiaro, Scuro, Pastello, Deep dark, Grigio senape). Il tema è persistito in `app_settings.theme` (nessuna migrazione: colonna già presente) e applicato impostando `data-theme` su `<html>`; le palette ridefiniscono **solo** i token di base/sidebar (sfondo, superfici, bordi, testo, accenti, sidebar). I **token semantici** (alert giallo/arancione/rosso, errori, azioni distruttive/`--color-destructive`, successo) vivono in `:root` e non sono **mai** ridichiarati nei blocchi tema: impossibile sovrascriverli (regola 8) per costruzione. La selezione è una operazione di configurazione app (nessun `HistoryEvent`). _AC:_ cambiando tema sfondo/card/bordi/testo/accenti/sidebar cambiano; alert, errori e pulsanti distruttivi restano identici in ogni tema; il tema scelto sopravvive al riavvio dell'app; stati loading/error della pagina gestiti.
- **S11.2** Percorso dati: visualizza, copia, apri cartella. `MVP`. La sezione «Percorso dati» di «Impostazioni app» **mostra** il percorso dati corrente, lo **copia negli appunti** (la stringa, non i file) e **apre la cartella** nel file manager di sistema (`shell.openPath`). Si introduce l'**infrastruttura del puntatore di bootstrap**: all'avvio l'app risolve `dataPath` da `<userData>/config.json` (creato col default `app.getPath('userData')` se assente/invalido), letto **prima** dell'apertura del DB; DB (`<dataPath>/lexflow.db`) e documenti (`<dataPath>/documenti/`) usano il `dataPath` risolto, non più `app.getPath('userData')` hardcoded. Lo spostamento effettivo è la storia **S11.2b** (sotto). Nessuna migrazione (la colonna `app_settings.dataPath` esiste già e resta come valore legacy/visualizzazione, non autoritativo). _AC:_ all'avvio `config.json` esiste/viene creato col default; eliminandolo viene ricreato e l'app parte; la sezione mostra il percorso corretto; «Copia» mette la stringa negli appunti; «Apri cartella» apre la cartella nel file manager; loading/error gestiti.
- **S11.2b** Spostamento effettivo del percorso dati. _(post-MVP, FATTO)_. Dalla sezione «Percorso dati» un pulsante «Cambia cartella…» sceglie una nuova cartella; l'app **sposta** i dati (DB + `documenti/`) e vi si riavvia. Lo spostamento avviene **a freddo al boot**, **prima** di `validateStartupConfig` (che risolve/cacha il percorso): un marker `pending-move.json` in `userData` innesca la copia vecchio→nuovo, l'aggiornamento del puntatore `config.json` e la rimozione del vecchio archivio (solo i file dati; `config.json`/`security.json` restano ancorati a `userData`). _AC:_ target validato (≠ corrente, non annidato, scrivibile, senza `lexflow.db` preesistente); dopo il riavvio DB e documenti sono nel nuovo percorso, «Percorso dati» e «Info app» lo riflettono; il vecchio archivio è rimosso; con DB cifrato (E14) lo sblocco continua a funzionare (chiave da `security.json` in `userData`). Percorso condiviso multi-PC resta fuori. Nessuna migrazione, nessun `HistoryEvent`.
- **S11.3** Backup completo (DB + documenti) e ripristino. `MVP`. **Export manuale:** dialog nativo di salvataggio → **singolo file `.zip`** `lexflow-backup-AAAAMMGG-HHMMSS.zip` (via `adm-zip`) contenente `lexflow.db` (copia consistente: `wal_checkpoint(TRUNCATE)` + copia file), l'intera cartella `documenti/`, un `data.json` (dump di tutte le tabelle, copia di sicurezza) e un `manifest.json` (`format`, `formatVersion`, `appVersion`, `createdAt`, tabelle); aggiorna `app_settings.backup.lastBackupAt`. **Ripristino:** dialog di apertura → validazione `manifest.json` (formato + presenza `lexflow.db`, altrimenti errore senza sovrascrivere) → estrazione in staging (`userData/restore-staging/`) + marker `pending-restore.json` → **conferma forte** (avviso d'irreversibilità, colore distruttivo, nessuna digitazione) → `app.relaunch()`. **A freddo al boot, prima di aprire il DB:** copia di sicurezza automatica dei dati correnti (`pre-restore-<ts>/`), poi **swap** di `lexflow.db` (rimossi `-wal`/`-shm`) e `documenti/`; le migrazioni a boot allineano un DB più vecchio. Nessuna migrazione introdotta; nessun `HistoryEvent` (operazione di sistema, tracciata via log). **Fuori storia:** backup automatico periodico + rotazione → S11.7; backup preventivo pre-reset → S11.4. _AC:_ l'export crea uno `.zip` col contenuto atteso; il ripristino sostituisce i dati e l'app riparte sui dati del backup, con `pre-restore-<ts>/` presente; uno zip non valido dà errore senza toccare i dati; annullare i dialog non fa nulla; loading/error gestiti.
- **S11.4** Reset archivio con backup automatico preventivo + doppia conferma. `MVP`. Azione distruttiva da «Impostazioni app» (zona pericolo) che **svuota l'archivio**: cancella `documents`, `pec_recipients`, `history_events`, `transition_records`, `practices`, `professionisti`, `collaboratori` (ordine FK-safe, `foreign_keys = ON`, **una transazione**) e svuota la cartella `documenti/`. **Mantiene** la configurazione workflow (`phases`/`transitions`/`field_defs`/`menu_sets`/`menu_options`) e le impostazioni app (`app_settings`). **Prima** del reset crea **automaticamente** un backup preventivo **obbligatorio** `pre-reset-<ts>.zip` sotto `app_settings.backup.backupPath` (riusa `writeBackupZip` di S11.3): se il backup fallisce, il reset **non** viene eseguito. **Doppia conferma** (modale a due passi, colore distruttivo, nessuna digitazione). Operazione **live**: nessun riavvio (delete DB + svuotamento cartella + invalidazione query). **Nessun `HistoryEvent`** (entità distrutte; tracciato via log). _AC:_ dopo il reset elenco/Dashboard/Cestino/Anagrafiche sono vuoti, workflow e impostazioni intatti, esiste `pre-reset-<ts>.zip`, cartella documenti svuotata; reset su archivio già vuoto non dà errore (conteggi 0); annullare la modale non fa nulla. Backup automatico periodico + rotazione → S11.7.
- **S11.5** Card Alert (attiva/disattiva, soglie). _(Should)_. _FATTO. Sezione «Avvisi Dashboard» in Impostazioni app: per ciascun livello (giallo/arancione/rosso) un toggle abilita/disabilita e una soglia in giorni. Config in `app_settings.alertsEnabled`/`alertThresholds` (già a schema); gli alert S8.2 leggono la config invece di 30/60/90 hardcoded. AC:_
  - **Soglie configurabili**: interi positivi e **strettamente crescenti** (`giallo < arancione < rosso`); zod renderer+main; violazioni → messaggio, nessun salvataggio.
  - **Attiva/disattiva per livello**: l'alert compare al livello più alto **tra quelli abilitati** la cui soglia è superata (confronto stretto). Disabilitare un livello **non nasconde** una pratica più vecchia: la mostra al livello inferiore abilitato (nessuna pratica sparisce dagli avvisi); disabilitare i livelli bassi riduce il rumore sulle pratiche giovani.
  - Cambio config → gli avvisi Dashboard si aggiornano (invalidazione `['dashboard']`). I colori dei livelli restano semantici fissi (regola 8). Nessuna migrazione, nessun `HistoryEvent`.
  - _Confine:_ perimetro = i 3 livelli dell'alert anzianità (S8.2). Le card «Documenti mancanti» (S8.5) e «Pratiche più vecchie» (S8.4) non hanno toggle in questa storia.
- **S11.6** Info app/stato sistema/versione. _(Should)_. _FATTO. Criteri:_
  - Sezione **«Info app»** in *Impostazioni app* (sola lettura), con stati loading/error.
  - Mostra: **versione app** (`app.getVersion`); **runtime** Electron/Chromium/Node/V8 (`process.versions`); **sistema** piattaforma+architettura; **percorsi** dati e backup (`getDataPath`/`getBackupPath`); **sicurezza** stato lock e cifratura (riuso `security:getConfig`, E14); **archivio** n° pratiche attive e nel cestino (riuso hook renderer esistenti).
  - Un solo nuovo IPC read-only `app:getInfo` (nessun DB, nessun service/repository dedicato: handler «di sistema» come `app:getVersion`). Nessuna migrazione, nessun `HistoryEvent`.
- **S11.7** **Backup automatico periodico** (alla chiusura e/o a intervallo configurabile) con rotazione delle ultime N copie. `MVP`. Scheduler nel main process: trigger `onClose` (via `before-quit`, sincrono, DB ancora aperto) e/o `interval` (timer ogni `intervalHours` ore mentre l'app è aperta), secondo `app_settings.backup` (`autoEnabled`, `trigger` `onClose|interval|both`, `intervalHours`, `retentionCount`, `backupPath`, `lastBackupAt`). Ogni auto-backup riusa `writeBackupZip` e scrive `lexflow-autobackup-<ts>.zip` sotto `backupPath`, poi **rotazione**: elimina gli auto-backup oltre `retentionCount` (ordine cronologico dal nome). La rotazione tocca **solo** i file `lexflow-autobackup-*.zip`: i backup manuali (`lexflow-backup-*`) e quelli pre-reset (`pre-reset-*`, S11.4) non vengono mai rimossi. Configurabile da «Impostazioni app» (on/off, trigger, ore, N copie, percorso modificabile via folder picker, ultimo backup). Ogni errore di auto-backup è loggato e non blocca/azzera l'app. _AC:_ alla chiusura (se abilitato) viene creato un archivio; superato N, la copia più vecchia viene rimossa; il percorso dei backup è visibile/modificabile in Impostazioni; il backup automatico preventivo pre-reset (S11.4) resta indipendente; nessuna migrazione; nessun `HistoryEvent`.

### E12 — Assistente (post-MVP)

- **S12.1** Assistente locale rule-based su dati attivi (conteggi, riepiloghi, pratiche ferme, documenti mancanti); non inventa. _(Should, v1.1)_.
- **S12.2** Modalità API opzionale, spenta di default, nessuna chiamata esterna non richiesta. _(Could)_.
- **S12.3** Pulsante flottante in basso a sinistra, si ritrae su modali critiche. _(Could)_.

### E13 — Qualità trasversale `MVP` (Must)

Requisiti soddisfatti **storia-per-storia**; S13.* è stato un **audit di chiusura MVP** (verifica doc↔codice + rifiniture mirate: Report informativo, rimozione pagina demo IPC e file morti). Vedi log in `PROGRESS.md`.

- **S13.1** Gestione errori + loading state + empty state su ogni vista. _FATTO: tutte le viste dati gestiscono loading/empty/error; importi/date mancanti → «Non presente»/«Non calcolabile»/«—», mai `NaN`._
- **S13.2** Validazioni input (zod) lato renderer e main. _FATTO: tutti i form renderer + controller main con zod._
- **S13.3** Audit = HistoryEvent su ogni operazione rilevante. _FATTO: created/updated/transizioni/cestino/ripristino/documenti. Eccezioni motivate: hard delete (S10.3) e reset (S11.4) distruggono l'entità → log; operazioni di configurazione (tema/percorso/backup) non sono sulla pratica._
- **S13.4** Numeri procedimento multipli e PEC multi-destinatario per fase. _PEC multi-destinatario FATTO (`pec_recipients` + campo `pec`); numeri procedimento multipli **post-MVP**._

### E14 — Protezione dati sensibili (post-MVP)

- **S14.1** Lock dell'app con password all'avvio. _(Should, v1.1)_. _Criteri:_
  - Dalle Impostazioni app si può **impostare**, **cambiare** e **rimuovere** una password di sblocco.
  - Con lock attivo, all'avvio l'app mostra una **schermata di sblocco** e apre il DB **solo** dopo password corretta; password errata → messaggio, nessun accesso ai dati.
  - Lo stato lock e i parametri di verifica vivono in un **marker esterno** `security.json` in `userData` (fuori dal DB, come il puntatore `config.json` del percorso dati), perché servono **prima** di aprire il DB. La colonna `app_settings.security` resta legacy/visualizzazione.
  - **Nessuna password in chiaro**: si salva solo `salt` + un `verifier` derivato (PBKDF2, stdlib Node).
  - Con lock **disattivo** (default) l'avvio è identico a oggi: nessuna regressione.
  - _Confine:_ S14.1 **non cifra** il file DB (chi ha accesso al filesystem può ancora leggerlo con altri strumenti): la cifratura a riposo è **S14.2**, che riusa la stessa password come chiave. Nessun `HistoryEvent` (operazione di sistema, come tema/backup).
- **S14.2** Cifratura a riposo del DB (via better-sqlite3-multiple-ciphers), abilitabile da impostazioni con migrazione del DB esistente. _(Should, v1.1)_. _Nota:_ il driver cifrabile è già adottato in E0 con cifratura spenta, quindi nessun cambio di driver. Riusa l'infrastruttura chiave e il cancello di boot di S14.1 (la password di sblocco deriva la chiave). _Criteri:_
  - **Prerequisito password:** la cifratura è attivabile solo con lock attivo (serve una password da cui derivare la chiave). I controlli di cifratura compaiono solo dopo aver impostato una password.
  - **Attiva cifratura** (Impostazioni): richiede la **re-immissione della password** (non è conservata in chiaro), esegue un **backup di sicurezza obbligatorio** (`pre-encrypt-<ts>.zip`), poi cifra il DB esistente in place (rekey della connessione viva) e segna `encrypted` nel marker. Se il backup fallisce, la cifratura **non** parte.
  - **Boot cifrato:** all'avvio l'app è bloccata; lo sblocco deriva la **chiave** dalla password (PBKDF2, contesto `'key'`, distinto dal verifier) e apre il DB cifrato (pragma `key` prima di ogni altra operazione).
  - **Cambio password:** se il DB è cifrato, cambiare password **ri-cifra** (rekey) il DB con la nuova chiave nella stessa operazione, così il DB resta apribile.
  - **Disattiva cifratura:** re-immissione password + backup di sicurezza (`pre-decrypt-<ts>.zip`) + rekey a testo in chiaro + marker `encrypted=false`. La **rimozione password** è bloccata finché la cifratura è attiva (prima disattivare la cifratura).
  - **Backup/ripristino:** l'archivio contiene il file DB **così com'è** (cifrato se la cifratura è attiva). Il ripristino è coerente **con la stessa password** (il marker in `userData` non è nell'archivio): documentato come vincolo. Nessuna migrazione DB, nessun `HistoryEvent` (operazione di sistema).

### E15 — Scadenzario / termini (post-MVP)

- **S15.1** Entità scadenza/termine per pratica (es. termine risposta integrazione) con data e descrizione. _(Could, FATTO)_. Nuova tabella `scadenze` (migrazione 0009). CRUD dal dettaglio pratica (aggiungi/modifica/completa/elimina); modulo `scadenze` (IPC `scadenze:*`). _AC:_ una pratica può avere più scadenze (descrizione + data); si segna «completata»; le scadute (data passata e non completate) sono evidenziate con colore semantico fisso; guard cestino (no aggiunta/modifica su pratica cestinata); ogni aggiunta/completamento/eliminazione scrive un `HistoryEvent` (categoria «Scadenze» nel filtro storico); `scadenze` incluse nelle cascate hard delete (S10.3) e reset (S11.4); loading/empty/error; validazione (descrizione non vuota, data valida) su renderer e main.
- **S15.2** Alert dedicati per scadenze imminenti/superate in Dashboard, distinti dagli alert giorni-da-deposito. _(Could)_.

### E16 — Export PDF scheda pratica (post-MVP)

- **S16.1** Generazione PDF della scheda di una singola pratica (dati, importi, storico, documenti elencati), stampabile/archiviabile. _(Could, FATTO)_. Dal dettaglio pratica un pulsante «Esporta PDF» genera il dossier e lo salva via dialog. Implementazione **dependency-free**: HTML composto nel main dai dati del dettaglio (`getPracticeDetail` + documenti + label campi generali), reso in PDF da una **BrowserWindow offscreen** via `webContents.printToPDF`. Colori da documento (il PDF è un file, non l'UI: non theme-aware). _AC:_ il PDF contiene intestazione, dati generali (con giorni dalla data deposito), soggetti, i 4 importi + differenze (null → «Non presente/Non calcolabile», nessun `NaN`), campi personalizzati con label, fase corrente, documenti elencati, storico; annullare il dialog non crea file; export di una sola pratica (no batch). Nessuna migrazione, nessun `HistoryEvent`.

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
