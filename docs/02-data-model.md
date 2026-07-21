# 02 — Modello dati

SQLite via Drizzle. Chiavi tecniche (`key`) stabili e immutabili; i nomi visibili (`displayName`, `label`) sono modificabili dall'utente senza rompere logica, conteggi o filtri.

## Entità

### Practice (pratica)

Entità centrale. Una pratica è **un'unica entità**: non si duplica mai al cambio di fase, alla modifica o alla cestinazione.

| Campo                 | Tipo                 | Note                                                                      |
| --------------------- | -------------------- | ------------------------------------------------------------------------- |
| id                    | uuid/int PK          |                                                                           |
| codiceIstanza         | text unique          | generato (vedi workflow-engine §codice)                                   |
| nomeIstanza           | text                 | `AAAAMMGG_NOTA_SPESE`, editabile                                          |
| collaboratoreId       | FK → Collaboratore   | per ID                                                                    |
| professionistaId      | FK → Professionista  | per ID                                                                    |
| tipologiaAttivita     | text (menu)          |                                                                           |
| dataUdienza           | date                 | riferimento per codice                                                    |
| competenza            | text (menu)          |                                                                           |
| autoritaGiudiziaria   | text (menu)          |                                                                           |
| dataDeposito          | date                 | usata da alert/anzianità                                                  |
| modalitaDeposito      | text (menu)          | PEC/A mano                                                                |
| importoRichiesto      | decimal              | unico importo "generale", inserito in Nuova/Modifica pratica              |
| importoConcesso       | decimal, nullable    | **denormalizzato** da `TransitionRecord.values` (non editabile a mano)    |
| importoFatturato      | decimal, nullable    | **denormalizzato** da `TransitionRecord.values` (non editabile a mano)    |
| importoLiquidato      | decimal, nullable    | **denormalizzato** da `TransitionRecord.values` (non editabile a mano)    |
| note                  | text                 |                                                                           |
| currentPhaseId        | FK → Phase           | fase corrente                                                             |
| previousPhaseId       | FK → Phase, nullable | fase di provenienza salvata alla sospensione; usata da "Riprendi pratica" |
| customValues          | json                 | valori dei campi generali configurabili, keyed by fieldKey                |
| isTrashed             | bool                 | soft delete                                                               |
| trashedAt             | datetime             |                                                                           |
| trashReason           | text                 |                                                                           |
| createdAt / updatedAt | datetime             |                                                                           |
| version               | int                  | per audit/futura concorrenza (non genera conflitti in mono-utente)        |

### Phase (fase)

| Campo       | Tipo        | Note                                                                                                                                                                                                                |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id          | PK          |                                                                                                                                                                                                                     |
| key         | text unique | tecnica, immutabile                                                                                                                                                                                                 |
| displayName | text        | modificabile                                                                                                                                                                                                        |
| category    | enum        | `deposited, awaiting_decree, awaiting_integration, decree_received, awaiting_correction, awaiting_appeal, awaiting_liquidation, awaiting_integration_scp, liquidated, closed, refused, suspended, annulled, custom` |
| isInitial   | bool        | **una sola** fase iniziale (`depositata`)                                                                                                                                                                           |
| isFinal     | bool        | finali standard: **closed, refused, annulled** (NON liquidated, che ha "Chiudi pratica")                                                                                                                            |
| isActive    | bool        |                                                                                                                                                                                                                     |
| order       | int         |                                                                                                                                                                                                                     |

(La PEC non è più un flag di fase: è guidata dai campi della transizione — vedi `03-workflow-engine.md`.)

La Dashboard e gli alert ragionano sulla **category**, non sul `displayName`: rinominare "Liquidata" in "Pagata" non rompe i conteggi. Elenco completo delle 13 fasi standard, con key e finalità, in `docs/03-workflow-engine.md`; flusso canonico in `docs/07-workflow-tree.md`.

### Transition

`id, fromPhaseId, toPhaseId (nullable), buttonLabel, order, isActive, isRepeatable (bool), isAutomatic (bool), isResume (bool)`. Definisce quali pulsanti compaiono nel dettaglio in base a `currentPhaseId`. Regole:

- `fromPhaseId == toPhaseId` → la transizione resta nella stessa fase (solleciti, proroga termine). Tipicamente `isRepeatable = true`.
- `isAutomatic = true` → eseguita dal motore senza pulsante (es. `depositata → in_attesa_decreto` post creazione).
- `isResume = true` → destinazione dinamica = `practice.previousPhaseId` (solo "Riprendi pratica" da `sospesa`); `toPhaseId` null.
- Vietata transizione verso fase inattiva. Le fasi finali (closed/refused/annulled) non hanno transizioni ordinarie in uscita.

**Nota:** solleciti e integrazioni NON sono fasi. Sono transizioni/eventi. La timeline è data dagli `HistoryEvent` (uno per transizione).

### FieldDef (definizione campo configurabile)

`id, scope (general|transition), transitionId (FK transitions, null se general), key, label, type, required, visibleInTable, usableInFilter, includeInExport, order, isActive, menuSetId (null), pecContext (text, null), conditionalOnFieldId (FK field_defs, null), conditionalValue (text, null)`.
Tipi: `testo_breve, testo_lungo, numero, importo, data, menu, si_no, note, file, pec`. Il tipo `pec` rende un blocco multi-destinatario PEC (gli indirizzi sono raccolti a runtime in E5 e salvati come `PecRecipient`). **`pecContext`** (solo campi `pec`, `deposito|scp|altro`; null = «Automatico») configura il `contesto` assegnato ai `PecRecipient` raccolti da quel campo; se null si ricade sulla **derivazione dalla fase di destinazione** (Sprint 3). Consentito solo con `type='pec'` (altrimenti null).
I campi `general` compaiono nel form Nuova pratica; i campi `transition` compaiono solo nel form di quella transizione. I flag di visibilità (tabella/filtri/export) sono rilevanti soprattutto per i campi `general`.

**Visibilità condizionale (base della regola PEC):** se `conditionalOnFieldId` è valorizzato, il campo è mostrato solo quando il campo controllore (un campo `menu` dello **stesso contenitore**) ha valore uguale a `conditionalValue`. Vincoli: una sola condizione per campo; il controllore deve essere di tipo `menu`, attivo, diverso dal campo stesso; `conditionalValue` deve essere un value di un'opzione attiva di quel menu. `conditionalOnFieldId` e `conditionalValue` sono entrambi null o entrambi valorizzati. La **regola PEC** è un campo `pec` condizionato al campo "modalità" della transizione quando vale l'opzione PEC.

### TransitionRecord (registrazione di una transizione/evento)

`id, practiceId, transitionId, fromPhaseId, toPhaseId, recordedAt, values (json keyed by fieldKey), note`. Ogni esecuzione di transizione (incluse quelle ripetibili come i solleciti, che restano nella stessa fase) crea un record. Gli importi (concesso, fatturato, liquidato) e le date rilevanti compilati nella transizione vivono qui, e i valori chiave vengono denormalizzati sulla pratica per filtri/riepiloghi. Relazione 1:1 con l'`HistoryEvent` corrispondente (da consolidare in E5). _(Sostituisce il precedente concetto "PhaseRecord" basato sulla fase.)_

**Denormalizzazione degli importi (E6/S6.1).** `TransitionRecord.values` è la **fonte di verità** dei tre importi del ciclo di vita; le colonne omonime su `Practice` sono **cache derivata**, riscritta dal service all'esecuzione della transizione (dentro la stessa transazione). La mappatura è **esplicita e minimale**, basata sulla `key` del campo `importo` compilato:

| Transizione (config standard) | Field key | Colonna `Practice` |
| --- | --- | --- |
| In attesa di decreto → «Registra decreto» | `importo_concesso` | `importoConcesso` |
| Decreto ricevuto → «Registra invio a SCP» | `importo_fatturato` | `importoFatturato` |
| In attesa di liquidazione SCP → «Registra liquidazione» | `importo_liquidato` | `importoLiquidato` |

Il contratto è la **chiave del campo** (uniche per contenitore/transizione nella config di default); quando i `values` salvati contengono una di queste chiavi con valore numerico finito, la colonna corrispondente viene aggiornata. I tre campi `importo` sono creati dal seed sulle rispettive transizioni. Non c'è inserimento manuale degli importi denormalizzati: evitare una seconda fonte di verità.

### HistoryEvent (storico/timeline)

`id, practiceId, timestamp, type, title, fromPhaseId, toPhaseId, note, payload (json), documentId (null)`. Scritto a ogni operazione rilevante. Non bypassabile.

### Professionista

`id, nome, cognome, denominazione, codiceFiscale, email, pec, telefono, ruolo, note, isActive`. `denominazione` è l'etichetta usata nei menu della pratica.

### Collaboratore (di giustizia)

`id, nome, cognome, denominazione, codiceInterno, note, isActive`.

### NumeroProcedimento _(post-MVP)_

`id, practiceId, tipo (menu, es. R.G.N.R.), valore`. Più righe per pratica.

### PecRecipient

`id, practiceId, phaseRecordId, contesto (deposito|scp|altro), indirizzo`. **PEC deposito e PEC SCP sono distinte per fase.** Multi-destinatario.

### Document

`id, practiceId, transitionRecordId (null), kind (decreto|fattura|pec|altro), filePath, originalName, metadata (json), createdAt`. File su filesystem in `<percorsoDati>/documenti/<codiceIstanza>/`; in DB solo il riferimento. Decreto → fase decreto; fattura → fase SCP.

**Storage (E7/S7.1).** Nell'MVP `kind` esposto in UI è `decreto | fattura` (una sola istanza per tipo: l'upload sostituisce). `filePath` è salvato **relativo** alla radice documenti (`<codiceIstanza>/<filename>`) e risolto in assoluto a runtime contro la radice `<dataPath>/documenti/`: percorso portabile per backup/ripristino (E11.3). La radice `dataPath` è risolta dal **puntatore esterno** `config.json` in `userData` (S11.2, `main/config/dataPath.ts`); default = `app.getPath('userData')`. `transitionRecordId` resta nullable e non popolato in S7.1. Ogni upload/sostituzione/eliminazione scrive un `HistoryEvent` (regola 9). I file **non** vengono toccati alla cestinazione: sopravvivono a cestino + ripristino.

### MenuSet / MenuOption

`MenuSet(id, key, label)`; `MenuOption(id, menuSetId, label, value, order, isActive)`. Opzioni riordinabili e disattivabili. **Un'opzione usata da pratiche non si elimina: si disattiva.**

### AppSettings (riga singola)

`theme, alertsEnabled (json per tipo), alertThresholds {giallo:30, arancione:60, rosso:90}, assistant {localEnabled, apiEnabled, provider, model, apiKeyRef, instructions}, dataPath _(valore legacy/di visualizzazione: l'**autorità runtime** del percorso dati è il puntatore esterno `config.json` in `userData`, non questa colonna — S11.2)_, appVersion, **siglaCodice** (text, default `NP`, configurabile da E11 — usata per generare il codice istanza nel formato `AAAAMMGG_SIGLA_NNN`), backup {autoEnabled, trigger (onClose|interval|both), intervalHours, retentionCount, backupPath, lastBackupAt _(aggiornato anche dal backup manuale S11.3; l'archivio è un `.zip` con `lexflow.db` + `documenti/` + `data.json` + `manifest.json`. Gli **auto-backup** S11.7 sono nominati `lexflow-autobackup-<ts>.zip` sotto `backupPath` e ruotati a `retentionCount` copie; la rotazione tocca solo questo prefisso, non i backup manuali né i `pre-reset-<ts>.zip` di S11.4)_}, security {lockEnabled, encryptionEnabled} (security post-MVP: nell'MVP entrambi false)`.

### Entità post-MVP (non creare nell'MVP)

- **Deadline** (scadenzario, E15): `id, practiceId, tipo, dataScadenza, descrizione, completata`. Da introdurre solo quando si affronta E15.

## Regole di integrità

1. Pratica = entità unica, mai duplicata.
2. Collaboratore/Professionista collegati per **ID**; **eliminabili solo se non referenziati da alcuna pratica** (attiva **o cestinata**, per non violare la FK) — altrimenti solo disattivabili (C-002); le pratiche esistenti continuano a mostrarli.
2-bis. **Eliminazione fisica delle entità di configurazione e anagrafiche (C-002).** Consentita **solo quando non in uso** (altrimenti blocco con messaggio); con `foreign_keys = ON` come backstop. Regole per entità:
   - **Fase**: eliminabile se non è quella iniziale e non referenziata da transizioni (from/to), pratiche (`currentPhaseId`/`previousPhaseId`, incl. cestinate), `history_events` o `transition_records`.
   - **Transizione**: eliminabile se mai eseguita (nessun `transition_record`); **cascata** → elimina anche i suoi `field_defs` (`scope=transition`).
   - **Campo**: eliminabile se nessun altro campo lo referenzia come `conditionalOnFieldId`. I valori già salvati (JSON in `customValues`/`transition_records.values`) **restano** (non FK, innocui).
   - **Menu set**: eliminabile se non usato da alcun `field_defs.menuSetId`; **cascata** → elimina anche le sue `menu_options`.
   - **Opzione menu**: sempre eliminabile (nessuna FK; i valori salvati restano).
   Le cascate avvengono in **una transazione**. **Nessun `HistoryEvent`** (config/anagrafiche, non la pratica; tracciato via log). **Nota:** gli elementi **standard** (creati dal seed) eliminati **riappaiono al riavvio** (seed idempotente per chiave) → per nasconderli si usa la **disattivazione**.
2-quater. **Disattivazione campo/opzione con nota basata sull'uso reale (Sprint 3).** La disattivazione di un campo o di un'opzione menu **resta sempre consentita** (reversibile, non corrompe i dati salvati) ed è il meccanismo previsto per nascondere un elemento anche se in uso. Alla disattivazione si esegue uno **scan** di `practices.custom_values` (campi `general`) / `transition_records.values` ristretti al `transitionId` (campi `transition`) per costruire una nota **accurata**: per un campo, quante pratiche/registrazioni lo valorizzano (più il n° di campi che lo usano come controllore condizionale); per un'opzione, quante scelte già salvate ne usano il `value` (sommate sui campi del suo menu set). Lo scan **informa**, non blocca. Backend-only, nessuna migrazione.
2-ter. **Cambio di `menuSetId` su un campo menu (Sprint 3).** Consentito **solo se non orfana valori**: il cambio è **bloccato** (`ConflictError`, messaggio inline nel form) quando esistono valori già salvati sotto la `key` del campo — in `practices.custom_values` per i campi `general` (tutte le pratiche, anche cestinate), in `transition_records.values` ristretti al `transitionId` per i campi `transition` — **oppure** `conditionalValue` di campi dipendenti (che referenziano questo campo come `conditionalOnFieldId`) **che non esistono tra le opzioni del nuovo menu** (attive o disattivate). Cambiare verso un menu che contiene comunque quei valori è consentito; un campo senza valori salvati è liberamente rimappabile. Il confronto ragiona sui `value` delle opzioni, non sugli id. Backend-only, nessuna migrazione.
3. Cestino = `isTrashed`; le cestinate sono escluse da Dashboard, Report, filtri ordinari, alert, assistente; ripristino le riporta nei conteggi. Il soft delete (cestino) è il default e resta reversibile. La **cancellazione definitiva** (S10.3, solo su pratiche già cestinate) è una **hard delete** irreversibile: rimuove la riga `practices` e tutti i figli che la referenziano — `documents`, `pec_recipients`, `history_events`, `transition_records` — in un'unica transazione (con `foreign_keys = ON`, i figli prima della pratica), più la cartella documenti `<percorsoDati>/documenti/<codiceIstanza>/`; non lascia traccia in `history_events` (l'entità è distrutta). Il **reset archivio** (S11.4) è una hard delete **in blocco** di tutte le pratiche + figli + anagrafiche (`professionisti`/`collaboratori`) + svuotamento della cartella documenti, in un'unica transazione (ordine FK-safe), **preceduto da un backup automatico preventivo obbligatorio** (`pre-reset-<ts>.zip`); mantiene workflow e impostazioni app; nessun `HistoryEvent`.
4. Importi mancanti → "Non presente"/"Non calcolabile"; mai `NaN`.
5. Coerenza fasi gestita dal motore (vedi workflow-engine), non da stringhe sparse.
6. `version` incrementato a ogni update (predisposizione, non vincolo in mono-utente).

## Calcoli derivati (non persistiti)

Differenze importi calcolate al volo: richiesto−concesso, % riduzione, concesso−fatturato, fatturato−liquidato, concesso−liquidato. Se un operando manca → "Non calcolabile". Nessun calcolo fiscale automatico (IVA/CPA/ritenuta): importi inseriti a mano.
