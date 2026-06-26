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

`id, scope (general|transition), transitionId (FK transitions, null se general), key, label, type, required, visibleInTable, usableInFilter, includeInExport, order, isActive, menuSetId (null), conditionalOnFieldId (FK field_defs, null), conditionalValue (text, null)`.
Tipi: `testo_breve, testo_lungo, numero, importo, data, menu, si_no, note, file, pec`. Il tipo `pec` rende un blocco multi-destinatario PEC (gli indirizzi sono raccolti a runtime in E5 e salvati come `PecRecipient`).
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

`theme, alertsEnabled (json per tipo), alertThresholds {giallo:30, arancione:60, rosso:90}, assistant {localEnabled, apiEnabled, provider, model, apiKeyRef, instructions}, dataPath _(valore legacy/di visualizzazione: l'**autorità runtime** del percorso dati è il puntatore esterno `config.json` in `userData`, non questa colonna — S11.2)_, appVersion, **siglaCodice** (text, default `NP`, configurabile da E11 — usata per generare il codice istanza nel formato `AAAAMMGG_SIGLA_NNN`), backup {autoEnabled, trigger (onClose|interval|both), intervalHours, retentionCount, backupPath, lastBackupAt _(aggiornato anche dal backup manuale S11.3; l'archivio è un `.zip` con `lexflow.db` + `documenti/` + `data.json` + `manifest.json`)_}, security {lockEnabled, encryptionEnabled} (security post-MVP: nell'MVP entrambi false)`.

### Entità post-MVP (non creare nell'MVP)

- **Deadline** (scadenzario, E15): `id, practiceId, tipo, dataScadenza, descrizione, completata`. Da introdurre solo quando si affronta E15.

## Regole di integrità

1. Pratica = entità unica, mai duplicata.
2. Collaboratore/Professionista collegati per **ID**; non eliminabili se hanno pratiche (solo disattivabili); le pratiche esistenti continuano a mostrarli.
3. Cestino = `isTrashed`; le cestinate sono escluse da Dashboard, Report, filtri ordinari, alert, assistente; ripristino le riporta nei conteggi. Il soft delete (cestino) è il default e resta reversibile. La **cancellazione definitiva** (S10.3, solo su pratiche già cestinate) è una **hard delete** irreversibile: rimuove la riga `practices` e tutti i figli che la referenziano — `documents`, `pec_recipients`, `history_events`, `transition_records` — in un'unica transazione (con `foreign_keys = ON`, i figli prima della pratica), più la cartella documenti `<percorsoDati>/documenti/<codiceIstanza>/`; non lascia traccia in `history_events` (l'entità è distrutta). Il **reset archivio** (S11.4) è una hard delete **in blocco** di tutte le pratiche + figli + anagrafiche (`professionisti`/`collaboratori`) + svuotamento della cartella documenti, in un'unica transazione (ordine FK-safe), **preceduto da un backup automatico preventivo obbligatorio** (`pre-reset-<ts>.zip`); mantiene workflow e impostazioni app; nessun `HistoryEvent`.
4. Importi mancanti → "Non presente"/"Non calcolabile"; mai `NaN`.
5. Coerenza fasi gestita dal motore (vedi workflow-engine), non da stringhe sparse.
6. `version` incrementato a ogni update (predisposizione, non vincolo in mono-utente).

## Calcoli derivati (non persistiti)

Differenze importi calcolate al volo: richiesto−concesso, % riduzione, concesso−fatturato, fatturato−liquidato, concesso−liquidato. Se un operando manca → "Non calcolabile". Nessun calcolo fiscale automatico (IVA/CPA/ritenuta): importi inseriti a mano.
