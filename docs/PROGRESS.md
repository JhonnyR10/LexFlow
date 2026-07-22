# PROGRESS — Stato del progetto LexFlow

File **vivo**: traccia avanzamento, decisioni e modifiche. Distinto dalla specifica (`CLAUDE.md` + `docs/*` di riferimento). Claude Code lo legge a inizio sessione e lo aggiorna a fine di ogni storia.

Legenda stato: `TODO` · `IN CORSO` · `FATTO` · `BLOCCATO`

---

## Stato avanzamento (per storia del backlog)

| Storia | Descrizione                                                  | Stato    | Note                                                                                                                                                                                                                     |
| ------ | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S0.1   | Scaffolding Electron+React+TS+Vite (struttura e placeholder) | FATTO    | Senza DB (aggiunto in S0.4). Bridge IPC app:getVersion incluso.                                                                                                                                                          |
| S0.2   | Bridge IPC tipizzato                                         | FATTO    | Bridge IPC tipizzato (preload+contextBridge, `shared/ipc.ts`) implementato e usato da tutti i moduli (app/config/anagrafiche/practices/documents/dashboard); client renderer in `src/api/*`. Stato riallineato (era erroneamente TODO).                                                                                                                                                                          |
| S0.3   | Config zod + logging strutturato                             | FATTO    | config/startup.ts (validazione zod + check scrittura) e utils/logger.ts. `ErrorBoundary` renderer (`components/ui/ErrorBoundary.tsx`) che avvolge le pagine in AppLayout (fallback leggibile, colori d'errore fissi). Gestione errori IPC (AppError serializzato da Electron + parsing in `utils/ipcError.ts`) documentata come scelta deliberata mono-utente in `04-conventions.md`: nessun middleware IPC formale.                                                                           |
| S0.4   | Migrazioni Drizzle + seed (fasi/menu standard)               | FATTO    | DB aperto in userData, migrazioni auto, seed idempotente verificato. Riallineato al modello canonico (13 fasi, 40 transizioni) il 2026-06-24.                                                                            |
| S1.1   | CRUD fasi + guscio applicativo                               | FATTO    | Routing HashRouter, sidebar, 6 pagine, QueryClientProvider. CRUD fasi completo. Guard disattivazione unica fase iniziale attivo; guard «fase in uso da pratiche attive» chiuso in S-FIX-guards (BLOCCO, include `previousPhaseId`). Delete fisica rinviata (FK constraints).             |
| S1.2   | CRUD transizioni                                             | FATTO    | Backend: createTransition/updateTransition/setTransitionActive/reorderTransitions con invarianti; UI: elenco raggruppato per fase, modale create/edit, riordino scoped, attiva/disattiva. Delete fisica rinviata (TODO). |
| S1.3   | CRUD campi configurabili (generali e per transizione)        | FATTO    | Schema migrato: scope general\|transition, transitionId (FK transitions) sostituisce phaseId. Migrazioni rigenerate, DB dev resettato. Guard d'uso chiuso in S-FIX-guards (AVVISO non bloccante: disattivazione consentita, nota informativa). Delete fisica rinviata (TODO).                |
| S1.4   | CRUD menu a tendina                                          | FATTO    | Backend: 7 canali IPC con invarianti (key immutabile, value univoco/immutabile). UI: layout due livelli, 5 set standard visibili. Guard d'uso chiuso in S-FIX-guards (AVVISO non bloccante: disattivazione consentita, nota informativa). Delete fisica rinviata (TODO).                                           |
| S1.5   | Regola PEC condizionale                                      | FATTO    | Schema migrato: tipo pec + conditionalOnFieldId/conditionalValue. Visibilità condizionale nel form campo, badge nella tabella, pulsante convenience PEC.                                                                  |
| S2.1   | CRUD Professionisti                                          | FATTO    | Nuovo modulo anagrafiche (IPC namespace `anagrafiche:`), schema Drizzle + migrazione incrementale 0001_*.sql, CRUD completo, denominazione auto-derivata da cognome+nome, validazione CF/email morbida. Guard «non disattivare se collegato a pratiche attive» chiuso in S-FIX-guards (BLOCCO).                  |
| S2.2   | CRUD Collaboratori                                           | FATTO    | Modulo anagrafiche esteso: schema Drizzle + migrazione incrementale 0002_*.sql, CRUD completo, denominazione auto-derivata da cognome+nome, codiceInterno opzionale. Guard «non disattivare se collegato a pratiche attive» chiuso in S-FIX-guards (BLOCCO).                                                     |
| S3.1   | Tabella pratiche attive                                      | FATTO    | IPC practices:listPractices, LEFT JOIN phases/professionisti/collaboratori, PraticheTable con 7 colonne, route /pratiche/:id con DettaglioPraticaPage placeholder.                                                        |
| S3.2   | Ricerca globale                                              | FATTO    | Barra di ricerca in `PratichePage`, filtro client-side in `PraticheTable` (case/accent-insensitive) su codice, nome, soggetti, autorità, note. `note` esposto in `PracticeListItem`. Stato filtrato-vuoto distinto. Procedimenti multipli fuori MVP. |
| S3.3   | Filtri base                                                  | FATTO    | Filtri client-side combinabili (fase, collaboratore, professionista, data deposito da/a, importo richiesto min/max) + Azzera. Opzioni menu derivate dalle pratiche presenti. `practiceFilters.ts` (logica pura) + `PraticheFilters.tsx`. Importi concesso/fatturato/liquidato → E6. |
| S3.4   | Ordinamento + selezione multipla                             | FATTO    | **E3 (Elenco e ricerca) COMPLETATA.** Ordinamento per colonna (toggle asc/desc, nulli in fondo, collation it+numeric); selezione multipla con checkbox limitata al filtrato, "seleziona tutto" solo sul filtrato; toolbar conteggio + deseleziona. Azioni bulk effettive rinviate (E10 cestino). |
| S4.1   | Generazione codice istanza                                   | FATTO    | Schema practices (22 col, FK a phases/professionisti/collaboratori), siglaCodice in AppSettings, migrazione 0003_*.sql, IPC practices:generateCodiceIstanza, formato AAAAMMGG_SIGLA_NNN.                                 |
| S4.2   | Form Nuova pratica                                           | FATTO    | Modal Nuova pratica: 6 sezioni, campi fissi + campi custom generali + PEC deposito. Backend: createPractice con transazione, auto-transizione depositata→in_attesa_decreto, HistoryEvent. Nuove tabelle: history_events, pec_recipients. Migrazione 0004_*.sql. |                                                                                                                                                                                                                          |
| S4.3   | Modifica pratica + storico                                   | FATTO    | **E4 (Creazione/modifica pratica) COMPLETATA.** IPC `practices:updatePractice`; `updatePractice` con diff campo-per-campo in transazione → un solo `HistoryEvent` type `updated` se cambia qualcosa. `codiceIstanza` e fase NON editabili. `ModificaPraticaModal` dal dettaglio; stili form estratti in `practiceFormStyles.ts`. PEC deposito sostituita integralmente. Nessuna migrazione. |
| S5.1   | Dettaglio pratica                                            | FATTO    | IPC `practices:getPractice` (detail con join fasi/anagrafiche, history, PEC deposito). DettaglioPraticaPage read-only: intestazione, dati generali, soggetti, importi, campi personalizzati risolti, workflow, storico/timeline, documenti (stub E7). Pulsanti transizione = S5.2.                                                                          |
| S5.2   | Pulsanti dinamici = transizioni                              | FATTO    | IPC `practices:listAvailableTransitions` (attive, non automatiche, dalla fase corrente; fase finale → nessuna azione). Componente `WorkflowActions` nel dettaglio: pulsanti generati dalla config, loading/empty/error. Form+salvataggio = S5.3.                                                                                              |
| S5.3   | Form dinamico fase + salvataggio                             | FATTO    | Nuova tabella `transition_records` (migrazione 0005, incrementale). IPC `practices:executeTransition`: validazione campi lato main (required+condizionale+menu+pec), calcolo destinazione dentro transazione (self/sospensione/resume), TransitionRecord+HistoryEvent+PEC, version++. `TransitionFormModal` + `DynamicField`/`PecBlock` estratti in modulo condiviso. Guard liquidata = S5.4. |
| S5.4   | Guard coerenza stati                                         | FATTO    | Backend-only, nessuna migrazione. Guard di liquidazione in `executeTransition` (dentro la transazione): destinazione `category='liquidated'` richiede categorie raggiunte `decree_received` + `awaiting_liquidation` (via HistoryEvent.toPhaseId). Ragiona per category canonica, non per key; difesa in profondità. |
| S5.5   | Storico/timeline                                             | FATTO    | Timeline consultabile + **filtri/ricerca** (Sprint 3): `TimelineSection` con ricerca testuale (title+note+fasi, accent-insensitive), filtro per categoria evento (created→Creazione; auto_transition/phase_changed/event→Fase-transizione; updated→Modifica; document_*→Documenti; trashed/restored→Cestino — opzioni derivate dagli eventi presenti) e intervallo date da/a; stato vuoto-filtrato distinto. Logica pura in `timelineFilters.ts`. Renderer-only, nessuna migrazione, nessun IPC.                                                                                                                              |
| S6.1   | Quattro importi                                              | FATTO    | concesso/fatturato/liquidato denormalizzati da `TransitionRecord.values` su 3 colonne pratica (cache derivata, non editabili a mano). Mappatura esplicita field-key→colonna (3 voci) in `executeTransition`. Seed di 3 campi `importo` su Registra decreto/invio a SCP/liquidazione. Migrazione incrementale 0006. Differenze calcolate = S6.2. |
| S6.2   | Differenze calcolate                                         | FATTO    | **E6 (Importi) COMPLETATA.** Helper puro `importoCalc.ts` (richiesto−concesso, % riduzione con guard div/0, concesso−fatturato, fatturato−liquidato, concesso−liquidato; null se operando mancante). Sottosezione «Differenze» nel dettaglio; «Non calcolabile» per i null, nessun NaN. Renderer-only, nessuna migrazione. |
| S7.1   | Documenti decreto+fattura                                    | FATTO    | **E7 (Documenti) COMPLETATA.** Nuovo modulo `documents` (4 canali IPC), tabella `documents` (migrazione 0007). Upload via file dialog nativo nel main; file in `<userData>/documenti/<codiceIstanza>/`, `filePath` relativo in DB; sostituzione per kind (decreto/fattura); apri via shell; HistoryEvent su add/replace/remove; guard cestino su upload/elimina. `DocumentsSection` nel dettaglio (sostituisce stub). |
| S8.1   | Card per fase dinamiche                                      | FATTO    | **Apre E8 (Dashboard).** Nuovo modulo `dashboard` (controller/service/repository), canale IPC `dashboard:phaseCounts`. Conteggio pratiche attive per fase (innerJoin practices→phases, GROUP BY, `isTrashed=false`, ordine `phases.order`): solo fasi con pratiche. `PhaseCountCards` con loading/empty/error; stato vuoto «Archivio vuoto…». Invalidazione `['dashboard']` su create/executeTransition. Nessuna migrazione. |
| S8.2   | Alert aggregato per pratica                                  | FATTO    | Sezione «Avvisi» in Dashboard. Un box per pratica attiva (cestino + fasi finali esclusi) con anzianità da deposito > 30g; severità 30/60/90 → giallo/arancione/rosso (token semantici fissi); motivazioni aggregate (anzianità + «decreto ricevuto non inviato a SCP» per category `decree_received`). IPC `dashboard:alerts`, logica pura nel service. Nessuna migrazione. |
| S8.3   | Giorni da deposito                                           | FATTO    | Campo «Giorni dalla data deposito» nel dettaglio pratica (Dati generali); assente/non parsabile → «Data deposito non presente» (muted). Calcolo `daysSinceDeposit` estratto in `shared/giorniDeposito.ts`, riusato dal service alert (S8.2). Renderer-only, nessuna migrazione. |
| S8.5   | Card «Documenti mancanti» (Sprint 3)                         | FATTO    | Sezione Dashboard: pratiche attive non finali cui manca un documento **atteso per la fase raggiunta** (ragiona per category canonica come S8.2: decreto da `decree_received` in poi; fattura da `awaiting_liquidation` in poi). IPC `dashboard:missingDocuments`, query con flag documenti (LEFT JOIN + `max(case…)`), logica soglie nel service. Badge dei kind mancanti, link al dettaglio; invalidazione `['dashboard']` aggiunta su upload/elimina documento. Nessuna migrazione, nessun `HistoryEvent`. |
| S8.4   | Anzianità + stato vuoto + Vedi pratiche                      | FATTO    | **E8 (Dashboard) COMPLETATA.** Sezione «Pratiche più vecchie» (top-5 pratiche aperte per giorni da deposito desc, riusa query alert + `daysSinceDeposit` condiviso); stato vuoto archivio unico a livello Dashboard con azione «Crea una nuova pratica»; card per fase cliccabili → `/pratiche?phaseId=` con filtro Fase preimpostato (`filtersFromSearchParams` + `useSearchParams`). Nuovo IPC `dashboard:aging`, nessuna migrazione. |
| S9.1   | Export CSV                                                   | FATTO    | **E9.1 COMPLETATA.** Pulsante «Esporta CSV» in Pratiche → CSV Excel-IT (`;`+BOM, decimali virgola, date gg/mm/aaaa) delle pratiche filtrate/cercate (riusa `filterPractices`, estratta da PraticheTable), cestino escluso. 4 importi (query elenco + `PracticeListItem` estesi con concesso/fatturato/liquidato). CSV puro in `practicesCsv.ts`; scrittura via dialog nel main (`modules/export`). Nessuna migrazione, nessun HistoryEvent. |
| S10.1  | Sposta nel cestino                                           | FATTO    | **Apre E10 (Cestino).** Soft delete con conferma + motivo obbligatorio; azione dal dettaglio (singola) e in blocco dalla toolbar di selezione (S3.4). IPC `practices:moveToTrash` (N id + motivo, transazione atomica, idempotente, `HistoryEvent` `trashed`) e `practices:listTrashed`. Pagina Cestino di sola lettura (data + motivo). Nessuna migrazione (colonne già presenti). Ripristino→S10.2, cancellazione→S10.3. |
| S10.2  | Ripristino                                                   | FATTO    | Ripristino dal cestino (singolo + multiplo) speculare a S10.1. IPC `practices:restore` (N id, transazione atomica, idempotente, azzera `trashedAt`/`trashReason`, `HistoryEvent` `restored`). Pagina Cestino interattiva (selezione + per-riga/bulk); pulsante «Ripristina» nel banner del dettaglio cestinata; modale di conferma leggera senza motivo (non distruttiva). Nessuna migrazione. Cancellazione→S10.3. |
| S10.3  | Cancellazione definitiva                                     | FATTO    | **E10 (Cestino) COMPLETATA.** Hard delete irreversibile, solo da Cestino (per riga + bulk), solo pratiche cestinate. IPC `practices:permanentDelete` (N id, una transazione: cancella figli `documents→pec_recipients→history_events→transition_records→practices` con FK ON, idempotente, `deletedCount`); cartella documenti rimossa post-commit (best-effort, helper `removePracticeDocumentsDir` esportato da documents/service). Nessun HistoryEvent (entità distrutta), tracciato via log. Modale forte senza digitazione. `PracticeCore` esteso con `codiceIstanza`. Nessuna migrazione. |
| S11.1  | Tema + colori semantici fissi                                | FATTO    | **Apre E11 (Impostazioni app).** Nuovo modulo `settings` (controller/service/repository), canali IPC `settings:get`/`settings:updateTheme`. 5 temi in `shared/themes.ts` (chiaro/scuro/pastello/deep-dark/grigio-senape), persistiti in `app_settings.theme` (no migrazione), applicati via `data-theme` su `<html>` (`ThemeApplier` in `App.tsx`). Palette CSS ridefiniscono solo token base/sidebar; token semantici restano in `:root` (regola 8 garantita per costruzione). Pagina Impostazioni app reale con anteprime. Nessun HistoryEvent (config app). |
| S11.2  | Percorso dati                                                | FATTO    | Visualizza + copia stringa + apri cartella in «Impostazioni app». Introdotto il **puntatore di bootstrap** `config.json` in userData (`main/config/dataPath.ts`): `dataPath` risolto a boot prima del DB; `connection.ts` e documents `getDocumentsRoot` usano `getDataPath()` invece di `app.getPath('userData')`. Default = userData; nessuno spostamento dati. **Cambio/spostamento percorso = post-MVP.** Nessuna migrazione (colonna `app_settings.dataPath` resta legacy/visualizzazione). |
| S11.3  | Backup completo + ripristino                                 | FATTO    | Nuovo modulo `backup` (controller/service/repository) + `restoreBootstrap`. Export manuale → singolo `.zip` (adm-zip) con `lexflow.db` (checkpoint+copia) + `documenti/` + `data.json` (dump tabelle) + `manifest.json`; aggiorna `backup.lastBackupAt`. Ripristino → validazione manifest, estrazione in staging + marker `pending-restore.json`, conferma forte, `app.relaunch()`; swap a freddo al boot (`applyPendingRestore` in `app.ts`, prima del DB) con safety backup automatico `pre-restore-<ts>/`. Dep `adm-zip`. Nessuna migrazione, nessun HistoryEvent. |
| S11.4  | Reset con backup automatico                                  | FATTO    | Nuovo modulo `reset`. Svuota pratiche+figli+anagrafiche (transazione FK-safe) + cartella documenti; mantiene workflow e impostazioni. Backup preventivo **obbligatorio** `pre-reset-<ts>.zip` sotto `backup.backupPath` (riusa `writeBackupZip` estratto da S11.3) — se fallisce, reset annullato. Doppia conferma (`ResetArchiveModal` a 2 passi). Nessun riavvio (delete live + `invalidateQueries()`). Nessuna migrazione, nessun HistoryEvent. |
| S11.7  | Backup automatico periodico + rotazione                      | FATTO    | **E11-MVP COMPLETATA.** Scheduler nel main (`scheduler.ts`): onClose via `before-quit` (sync, guard anti-rientro) + interval via timer riavviabile. Auto-backup `lexflow-autobackup-<ts>.zip` sotto `backup.backupPath` (riusa `writeBackupZip`), poi rotazione che tocca **solo** quel prefisso (manuali e `pre-reset-*` salvi). Config completa editabile in «Impostazioni app» (`AutoBackupSection`): on/off, trigger, ore, N copie, percorso modificabile (folder picker) + apri cartella + ultimo backup. IPC `backup:getConfig/updateConfig/changeFolder/openFolder`. Nessuna migrazione, nessun HistoryEvent. |
| S13.\* | Qualità trasversale (errori/loading/empty/PEC)               | FATTO    | **MVP COMPLETO.** Audit di chiusura: S13.1–13.4 verificati conformi (loading/empty/error su tutte le viste, zod renderer+main, HistoryEvent con eccezioni motivate, PEC multi-destinatario). Rifiniture: Report → pagina informativa (rimanda a «Pratiche → Esporta CSV»); rimossa pagina demo IPC (`/dev/ipc`) + link dev sidebar + file morti (IpcDemoPage/PlaceholderPage/PlaceholderSection). Numeri procedimento multipli post-MVP. |

(Storie post-MVP non elencate finché non promosse: report avanzati, assistente, numeri procedimento multipli, ecc.)

---

## Log decisioni

Ogni riga: data — decisione — motivo.

- 2026-06-23 — Desktop locale mono-utente (Electron + SQLite). — Uso su singolo PC, un solo amministratore.
- 2026-06-23 — Workflow configurabile già in MVP. — Richiesta esplicita del committente.
- 2026-06-23 — DB: better-sqlite3-multiple-ciphers + Drizzle (no Prisma). — Packaging Prisma in Electron fragile; driver cifrabile fin da subito per evitare migrazione quando si abiliterà la cifratura (post-MVP).
- 2026-06-23 — Confine renderer↔main via bridge IPC tipizzato (no server HTTP). — Over-engineering per mono-utente locale.
- 2026-06-23 — Sigla codice istanza configurabile (default NP); documenti su filesystem; numeri procedimento e percorso condiviso fuori MVP. — Assunzioni ratificate dal committente.
- 2026-06-23 — Backup automatico periodico **in MVP** (E11.7). — Rischio perdita dati su app locale senza cloud.
- 2026-06-23 — Protezione dati (lock + cifratura DB) **post-MVP** (E14); driver cifrabile già in E0, cifratura spenta. — Dati sensibili (collaboratori di giustizia), ma non bloccante per MVP.
- 2026-06-23 — Scadenzario (E15) ed export PDF scheda pratica (E16) **post-MVP**. — Utili, non urgenti.
- 2026-06-24 — **Workflow riallineato al file canonico** `docs/07-workflow-tree.md`. — Il seed iniziale modellava come fasi alcune transizioni (solleciti, integrazioni, invio SCP). Modello corretto: 13 fasi, solleciti/integrazioni come transizioni/eventi, transizioni con flag isRepeatable/isAutomatic/isResume, `previousPhaseId` per sospensione/ripresa, finali solo Chiusa/Rifiutata/Annullata (Liquidata non finale).
- 2026-06-24 — **Impugnazione solo da Decreto ricevuto; Rifiutata terminale** (opzione A). — Definito dal file canonico. PASSO 5b superato/annullato.
- 2026-06-24 — **Campi configurabili legati alle transizioni, non alle fasi** (FieldDef.scope general|transition, transitionId). — Più transizioni entrano nella stessa fase con dati diversi; lo scoping per fase era insufficiente. PhaseRecord sostituito da TransitionRecord (consolidamento in E5).
- 2026-06-24 — **Regola PEC come visibilità condizionale generica** (FieldDef.conditionalOnFieldId/conditionalValue + tipo campo `pec`). — Nessun hardcoding: PEC = campo `pec` condizionato al campo modalità=PEC. Vincolato a una sola condizione su campo menu dello stesso contenitore.
- 2026-06-24 — **Validazione zod inline nel controller; service importa repository direttamente (no DI formale).** — Scelta deliberata di semplicità per app desktop mono-utente. Non esistono file `dto.ts`/`validation.ts`/`types.ts` per modulo. La DI formale si introduce solo se serviranno test unitari estesi dei service.

## Decisioni aperte / da confermare

- Sigla codice fissa o configurabile (assunta configurabile).
- Documenti su filesystem vs blob in DB (assunto filesystem).
- TransitionRecord vs HistoryEvent: la relazione è 1:1 (da consolidare in E5). La timeline usa HistoryEvent; i valori chiave compilati nella transizione vivono in TransitionRecord e vengono denormalizzati sulla pratica per filtri/riepiloghi.

---

## Log modifiche

Registro cronologico degli interventi rilevanti di Claude Code (cosa è cambiato, dove). Aggiungere una voce a fine storia.

### 2026-07-22 — Sprint 4 / S11.5: Card Alert configurabili

Storia media (Should). Nuova sezione **«Avvisi Dashboard»** in *Impostazioni app*: per ciascun livello
(giallo/arancione/rosso) toggle di attivazione + soglia in giorni. Gli alert S8.2 leggono la config
invece delle 30/60/90 hardcoded. **Nessuna migrazione** (colonne `alertsEnabled`/`alertThresholds` già
a schema), **nessun `HistoryEvent`**.

**Semantica (documentata):** l'alert compare al livello più alto **tra quelli abilitati** la cui soglia
è superata (confronto stretto). Disabilitare un livello non nasconde una pratica più vecchia: la mostra
al livello inferiore abilitato. Soglie validate: interi positivi e **strettamente crescenti**
(giallo < arancione < rosso), zod renderer+main.

**File nuovi:** `src/features/settings/AlertConfigSection.tsx`.
**File modificati:**
- `shared/ipc.ts`: canali `SETTINGS_GET_ALERT_CONFIG`/`SETTINGS_UPDATE_ALERT_CONFIG`, tipi
  `AlertLevelConfig`/`AlertConfig` (chiavi EN come `AlertSeverity`) + `LexFlowApi.settings`.
- `main/modules/settings/repository.ts`: `getAlertConfig()` (parse robusto, mappa IT del DB → EN,
  default 30/60/90) e `updateAlertConfig()` (scrive le due colonne).
- `main/modules/settings/service.ts`: `readAlertConfig`/`saveAlertConfig` (+ `assertAlertConfig`
  ordine/positività).
- `main/modules/settings/controller.ts`: 2 handler con zod.
- `main/modules/dashboard/service.ts`: `severityForDays(days, cfg)` usa soglie/abilitazioni;
  `getDashboardAlerts` legge `getAlertConfig()` (import da settings/repository, config app-wide).
- `main/preload.ts`, `src/api/settings.ts`, `src/features/settings/useSettings.ts`: wiring +
  `useAlertConfig`/`useUpdateAlertConfig` (invalida `['dashboard']` on success).
- `src/pages/AppSettingsPage.tsx`: monta `<AlertConfigSection/>` (dopo Tema).
- `docs/00-backlog-mvp.md` (AC S11.5), `docs/06-ui-ux.md` (Avvisi Dashboard configurabili).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · smoke-test boot ✓.
**Logica validata sull'ABI Electron reale** (harness su copia del DB dev, 6 asserzioni): default→giallo
a 50g; giallo off + arancione 40 → arancione (fallback verso il basso); soglie oltre 50 → nessun alert;
round-trip config IT↔EN; validazione rifiuta soglie non crescenti / non positive. **Verifica GUI
(sezione avvisi, aggiornamento dashboard, temi scuri, colori livelli invariati) da completare con
l'utente.**

### 2026-07-22 — Sprint 4 / S9.2: Report aggregati

Storia media (Should). La pagina **Report** passa da informativa ad **aggregati** delle pratiche
**attive** (cestino escluso). Aggregazione **nel backend** (nuovo modulo `report`, layer
controller→service→repository con `GROUP BY`/`sum()`): nessuna business logic nel renderer (regola 2).
Un solo IPC read-only `report:summary`. **Nessuna migrazione, nessun `HistoryEvent`**.

**Contenuti:** totali importi (richiesto/concesso/fatturato/liquidato + n° pratiche; null → «Non
presente»); conteggi per fase (riuso `findActivePhaseCounts` di dashboard); per collaboratore e per
professionista (n° + somma concesso/liquidato, bucket «Non assegnato» per le relazioni nulle, ordinati
per conteggio desc); copertura documenti (con/senza decreto e fattura sulle pratiche attive).

**File nuovi:** `main/modules/report/{repository,service,controller}.ts`, `src/api/report.ts`,
`src/features/report/useReport.ts`.
**File modificati:**
- `shared/ipc.ts`: canale `REPORT_SUMMARY` + tipi (`ReportSummaryResponse`, `ReportTotals`,
  `ReportByPhaseItem`, `ReportByEntityItem`, `ReportDocumentsCoverage`) + `LexFlowApi.report`.
- `main/server.ts`, `main/preload.ts`: registrazione + namespace `report`.
- `src/pages/ReportPage.tsx`: riscrittura con sezioni (totali/fasi/collaboratori/professionisti/
  documenti), loading/empty(archivio senza pratiche attive)/error, colori via token; mantiene il
  rimando a «Pratiche → Esporta CSV».
- `src/features/practices/usePractices.ts`, `src/features/documents/useDocuments.ts`: invalidazione
  `['report']` accanto a `['dashboard']` (create/transizione/cestino/ripristino/cancellazione/documenti).
- `docs/00-backlog-mvp.md` (AC S9.2), `docs/06-ui-ux.md` (Report).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · smoke-test boot ✓.
**Aggregati validati sull'ABI Electron reale** contro una **copia** del DB di sviluppo (2 pratiche):
`getReportSummary` reale → totali (concesso=777, altri null→«Non presente»), per-fase, bucket «Non
assegnato», copertura documenti — tutti coerenti; DB reale non toccato. **Verifica GUI (pagina Report,
temi scuri, stato vuoto) da completare con l'utente.**

### 2026-07-22 — Sprint 4 / S11.6: Info app / stato sistema / versione

Storia piccola (Should). Nuova sezione **«Info app»** in *Impostazioni app*: versione, runtime,
sistema, percorsi, stato sicurezza, conteggi archivio. **Sola lettura**, un solo nuovo IPC read-only,
**nessuna migrazione**, **nessun `HistoryEvent`**.

**Contenuti:** versione app; runtime Electron/Chromium/Node/V8 (`process.versions`); sistema
piattaforma+arch; percorsi dati e backup; sicurezza lock/cifratura (**riuso** `security:getConfig`, E14);
pratiche attive e nel cestino (**riuso** hook `useActivePractices`/`useTrashedPractices` — nessun IPC
dedicato ai conteggi).

**File nuovi:** `src/features/settings/useAppInfo.ts`, `src/features/settings/InfoSection.tsx`.
**File modificati:**
- `shared/ipc.ts`: canale `APP_GET_INFO`, tipo `AppInfoResponse`, `LexFlowApi.app.getInfo`.
- `main/modules/app/controller.ts`: handler `app:getInfo` (system API + `getDataPath`/`getBackupPath`;
  handler «di sistema» come `getVersion`. `getBackupPath` legge `app_settings` → ok perché la sezione
  è raggiungibile solo ad app sbloccata).
- `main/preload.ts`, `src/api/app.ts`: wiring `getInfo`.
- `src/pages/AppSettingsPage.tsx`: monta `<InfoSection/>` come ultima sezione.
- `docs/00-backlog-mvp.md` (AC S11.6), `docs/06-ui-ux.md` (elenco sezioni Impostazioni app).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · smoke-test boot ✓.
**Verifica GUI (sezione Info app: valori corretti, temi scuri) da completare con l'utente.**

### 2026-07-22 — Sprint 4 / S14.2: Cifratura a riposo del DB — **E14 COMPLETA**

Chiude **E14 Protezione dati** riusando l'infrastruttura di S14.1. Il file `lexflow.db` può ora
essere **cifrato a riposo** (better-sqlite3-multiple-ciphers, raw key derivata dalla password). **Nessuna
migrazione** (stato in `security.json`), **nessun `HistoryEvent`** (operazione di sistema), **nessuna
dipendenza nuova** (driver già cifrabile da E0).

**Design (sopra S14.1):**
- **Chiave** = `PBKDF2(password, salt, 'key')` (32 byte), passata al driver come raw key
  `PRAGMA key = "x'<hex>'"` **prima** di ogni altra pragma. Separazione di dominio dal verifier
  (contesto `'verify'` vs `'key'`): il verifier non rivela la chiave.
- **Attiva/disattiva** sulla **connessione viva** (`connection.ts:applyRekey`): checkpoint WAL →
  `journal_mode=DELETE` → `PRAGMA rekey` (a chiave / a `''` per decifrare) → WAL. Precedute da un
  **backup di sicurezza obbligatorio** (`pre-encrypt-<ts>.zip` / `pre-decrypt-<ts>.zip`); se fallisce,
  l'operazione non parte. Richiedono la **re-immissione della password** (non è conservata in chiaro).
- **Boot cifrato:** `security:unlock` deriva la chiave dalla password e apre il DB cifrato
  (`openAndInitDatabase(keyHex)`). Il cancello di boot è quello di S14.1.
- **Cambio password su DB cifrato:** rekey alla nuova chiave nella stessa operazione (rekey **prima**
  della scrittura del marker, per non lasciare un marker che non apre il DB).
- **Guard:** cifratura attivabile solo con lock attivo; **rimozione password bloccata** se cifrato
  (prima disattivare la cifratura → `ConflictError`).
- **Backup/ripristino:** l'archivio contiene il DB così com'è (cifrato se attivo); poiché il marker
  vive fuori dall'archivio, il ripristino è coerente solo con la **stessa password** (vincolo documentato).

**File modificati:**
- `main/database/connection.ts`: `initDatabase(keyHex?)` (pragma key), `applyRekey(keyHex|null)`.
- `main/database/bootstrapDb.ts`: `openAndInitDatabase(keyHex?)`.
- `main/config/securityMarker.ts`: campo `encrypted`; `isEncrypted`, `computeKeyHex`,
  `deriveCurrentKeyHex`, `currentSalt`, `generateSalt`, `computeVerifier`, `buildLockMarker`,
  `setEncryptedFlag`, `persistMarker` (esposte per il flusso coordinato con il rekey).
- `main/modules/security/service.ts`: `unlock` con chiave; `enableEncryption`/`disableEncryption`
  (backup di sicurezza + rekey); `changeLockPassword` con rekey se cifrato; `disableLockPassword`
  bloccata se cifrato.
- `main/modules/security/controller.ts`, `main/preload.ts`, `shared/ipc.ts`: 2 canali
  `security:enableEncryption`/`disableEncryption` + tipi; `SecurityConfigResponse.encrypted`.
- `src/api/security.ts`, `src/features/security/useSecurity.ts`: client + hook cifratura.
- `src/features/settings/SecuritySection.tsx`: controlli attiva/disattiva cifratura (solo con lock
  attivo), nota dinamica, esito con percorso backup di sicurezza.
- `docs/00-backlog-mvp.md` (AC S14.2), `docs/01-architecture.md`, `docs/02-data-model.md`.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · boot default (senza
cifratura) senza regressioni ✓. **Round-trip cifratura validato sull'ABI Electron reale**
(`ELECTRON_RUN_AS_NODE`): chiaro→rekey→riapri con chiave OK, apertura senza chiave / con chiave
sbagliata rifiutata, decrypt→riapri in chiaro OK — conferma la sintassi pragma `key`/`rekey` e la
sequenza WAL→DELETE→WAL usate in `connection.ts`. **Verifica GUI interattiva del flusso completo
(attiva cifratura → riavvio → sblocco apre il DB cifrato → cambio password → disattiva) da completare
con l'utente.**

### 2026-07-22 — Sprint 4 / S14.1: Lock dell'app con password all'avvio — **apre E14**

Prima storia post-MVP (Sprint 4, **E14 Protezione dati**). Introduce un **cancello password
all'avvio**: se attivo, l'app mostra una schermata di sblocco e apre il DB **solo** dopo password
corretta. Costruisce l'infrastruttura chiave (KDF, verifier, boot condizionale) che **S14.2
(cifratura a riposo) riuserà**. **Nessuna migrazione** (stato lock in un marker file esterno, non nel
DB), **nessun `HistoryEvent`** (operazione di sistema, come tema/backup — eccezione già in S13.3),
**nessuna dipendenza nuova** (KDF con `crypto` stdlib).

**Confine onesto:** S14.1 **non cifra** il file `lexflow.db`: chi ha accesso al filesystem può ancora
leggerlo con altri strumenti finché non arriva **S14.2**. L'avviso è mostrato in chiaro nella UI.

**Design:**
- **Fonte di verità fuori dal DB:** marker `security.json` in `userData` (`{ lockEnabled, kdf {salt,
  iterations, keylen, digest}, verifier }`), come il puntatore `config.json` del percorso dati —
  necessario **prima** di aprire il DB. Colonna `app_settings.security` → legacy/visualizzazione.
- **Nessuna password in chiaro:** solo `salt` + `verifier` = PBKDF2-HMAC-SHA512 (210k iter, stdlib).
  Verifica al boot con `timingSafeEqual`. `derive(pw, salt, context)` separa i domini (`'verify'` ora;
  `'key'` sarà per S14.2, così il verifier non rivela la chiave).
- **Boot condizionale (`app.ts`):** `bootstrap()` (handler IPC, incluso `security:*`) registrato
  **sempre e per primo**, senza DB. Lock **off** (default) → `openAndInitDatabase()` + scheduler subito
  (identico all'MVP). Lock **on** → DB **non** aperto; il renderer mostra `LockScreen`; apertura DB +
  scheduler differiti all'handler `security:unlock`. Apertura DB centralizzata in
  `database/bootstrapDb.ts:openAndInitDatabase()` (idempotente). `before-quit` no-op se DB non aperto.

**File nuovi:**
- `main/config/securityMarker.ts` — marker + KDF/verifier (read robusta, set/disable, verify, policy).
- `main/database/bootstrapDb.ts` — `openAndInitDatabase()` (init+migrazioni+seed, idempotente).
- `main/modules/security/{service,controller}.ts` — 6 canali IPC (`getState`, `getConfig`, `unlock`,
  `setPassword`, `changePassword`, `disableLock`); zod nel controller; `unlock` apre il DB dopo verifica.
- `src/api/security.ts`, `src/features/security/useSecurity.ts` — client + hook.
- `src/features/security/LockScreen.tsx` — schermata di sblocco (token base :root, DB chiuso; loading/error).
- `src/features/settings/SecuritySection.tsx` — imposta/cambia/rimuovi password (zod renderer, avviso S14.2).

**File modificati:**
- `main/database/connection.ts` — `isDbOpen()`.
- `main/app.ts` — boot condizionale + guardia `before-quit`.
- `main/server.ts`, `main/preload.ts` — registrazione handler + namespace `security`.
- `shared/ipc.ts` — 6 canali, tipi `Security*`, `LexFlowApi.security`.
- `src/App.tsx` — cancello: `useSecurityState` → `LockScreen` se bloccato, altrimenti Router (+invalida query allo sblocco).
- `src/pages/AppSettingsPage.tsx` — monta `<SecuritySection/>`.
- `docs/02-data-model.md` (marker security), `docs/01-architecture.md` (boot condizionale),
  `docs/00-backlog-mvp.md` (AC S14.1).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · smoke-test boot
default ✓ (log: `APP_START → DB_OPEN → migrazioni → seed → DONE`, nessun `APP_LOCKED`/`APP_INIT_FAILED`).
**Verifica GUI interattiva del flusso lock da completare con l'utente** (imposta password → riavvio →
LockScreen → password errata bloccata / corretta apre → cambia → rimuovi → riavvio senza lock; temi
scuri sulla LockScreen).

### 2026-07-22 — Sprint 3 / Bonifica colori hardcoded — **SPRINT 3 COMPLETO**

Settima e ultima voce dello **Sprint 3** (qualità/tema). Riduce i colori hardcoded nel renderer da **84 → residui
intenzionali** (swatch letterali dei temi in `AppSettingsPage` + un bottone distruttivo già commentato «fisso
regola 8» in `DocumentsSection`). Renderer-only, nessun cambiamento visivo (valori preservati). **Regola 8
rispettata:** i colori semantici fissi restano in `:root`, non diventano theme-aware.

**Nuovi token fissi in `src/styles/global.css` (`:root`, sezione semantica):**
- `--color-on-accent: #ffffff` (testo su bottoni accent/destructive), `--color-overlay: rgba(0,0,0,0.45)` (scrim
  modali), `--color-shadow: rgba(0,0,0,0.18)` (ombra modali).
- `--color-success-border: #86efac`, `--color-warning: #b45309` (completano set esistenti; stessi valori dei
  fallback che ora sostituiscono).

**Conversioni:**
- `#fff` (28×) → `var(--color-on-accent)`; overlay `rgba(0,0,0,0.45)` (16×) → `var(--color-overlay)`; ombra
  `rgba(0,0,0,0.18)` (14×) → `var(--color-shadow)` (tutti valori identici).
- Rimossi i fallback ridondanti `var(--token, #hex)` su token definiti (bg-subtle, text-muted, accent-light,
  success-bg) e su token appena creati (warning, success-border).
- Titolo sidebar `#f8fafc` → `var(--sidebar-text-active)`; box errore `PraticheTable` → `--color-error*`; badge
  `FieldsSection` (PEC/condizione) → `--badge-initial-*`/`--badge-custom-*` (token già esistenti).

**Lasciati invariati (motivati):** swatch di anteprima temi (colori letterali dei temi), bottone distruttivo
`DocumentsSection` (fisso intenzionale, border senza token esatto).

**Pulizia repo:** `.eslintcache` rimosso dall'indice git (era tracciato pur essendo già in `.gitignore`).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (verifica GUI
confermata dall'utente: bottoni/modali/badge/box-errore/sidebar invariati; giro sui 5 temi coerente; anteprime temi
corrette).

**Stato Sprint 3: COMPLETO** — timeline filtri (S5.5), card documenti mancanti (S8.5), icona app/installer, cambio
`menuSetId`, scan JSON rigoroso, contesto PEC configurabile, bonifica colori.

### 2026-07-21 — Sprint 3 / Contesto PEC configurabile sul campo `pec`

Sesta voce dello **Sprint 3**. Il `contesto` dei `PecRecipient` non è più solo **derivato dalla fase di
destinazione**, ma **configurabile per campo** via `FieldDef.pecContext` (nullable = «Automatico» → fallback alla
derivazione storica). Retrocompatibile: nessun campo `pec` nel seed, righe esistenti restano NULL. Chiude il TODO
in `practices/service.ts:derivePecContesto`.

**Nota:** oggi il `contesto` è consumato solo per isolare la PEC di **deposito** (`findPecDepositoAddresses`,
`contesto='deposito'`); `scp`/`altro` sono metadato salvato per uso futuro (report), non mostrato. La storia
migliora la correttezza del metadato salvato.

**Migrazione:** `drizzle/0008_rare_mother_askani.sql` — `ALTER TABLE field_defs ADD pec_context text` (additiva,
nullable, applicata a boot).

**File modificati:**
- `main/database/schema/fieldDefs.ts`: colonna `pecContext` (text, nullable).
- `shared/ipc.ts`: `type PecContext` + `PEC_CONTEXTS`; `pecContext` in `FieldDefListItem`/`CreateFieldInput`/
  `UpdateFieldInput`.
- `main/modules/config/repository.ts`: select/map + `updateFieldFields` includono `pecContext` (insert via
  `NewFieldDef`).
- `main/modules/config/service.ts`: `resolvePecContext(type, pecContext)` (ammesso solo se `type='pec'`, valida
  contro `PEC_CONTEXTS`) in `createField`/`updateField`.
- `main/modules/config/controller.ts`: `pecContextEnum` nei zod create/update field.
- `main/modules/practices/repository.ts`: `TransitionFieldRow.pecContext` + select in `findActiveTransitionFields`.
- `main/modules/practices/service.ts`: in `executeTransition` inserimento PEC **per campo** con
  `normalizePecContext(field.pecContext) ?? derivePecContesto(toPhase)` (prima: unico contesto per tutti i pec).
- `src/features/config/fields/FieldFormModal.tsx`: selettore «Contesto PEC» (Automatico/Deposito/SCP/Altro) quando
  `type='pec'`, zod + reset al cambio tipo; `FieldsSection.tsx` (pulsante PEC di convenienza) passa `pecContext: null`.
- `docs/02-data-model.md` (FieldDef), `docs/03-workflow-engine.md` (§PEC contesto), `docs/00-backlog-mvp.md` (S1.5).

**Confine:** PEC di deposito resta `deposito` fisso; i campi `pec` `general` non generano recipient (come oggi).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (migrazione
applicata a boot; verifica GUI config confermata dall'utente: selettore «Contesto PEC» compare per i campi pec,
persiste al salvataggio/riapertura, sparisce e si azzera cambiando tipo. Verifica runtime del contesto salvato non
richiesta dall'utente).

### 2026-07-21 — Sprint 3 / Scan JSON rigoroso alla disattivazione (campo / opzione)

Quinta voce dello **Sprint 3**. Chiude i TODO in `setFieldActive`/`setMenuOptionActive`: la nota di
disattivazione passa da **generica** a **basata sull'uso reale**, scandendo i JSON dei valori salvati. La
disattivazione **resta non bloccante** (è il meccanismo previsto per nascondere un elemento anche se in uso;
reversibile, non corrompe i dati). **Backend-only, nessuna migrazione, nessun IPC, nessun frontend** (il renderer
mostra già `res.warning` in modo generico), **nessun `HistoryEvent`**.

**Note accurate:**
- **Campo**: conteggio scope-aware delle pratiche (`custom_values`) / registrazioni di transizione
  (`transition_records.values` ristretti al `transitionId`) che valorizzano la `key`, più il n° di campi che lo
  usano come controllore condizionale. Usato → «…valorizzato in N pratiche/registrazioni…»; non usato → «Non
  risulta valorizzato…».
- **Opzione menu**: somma dei valori salvati uguali al `value` dell'opzione sui campi del suo menu set. Usata →
  «È già scelta in N valori salvati…»; non usata → «Non risulta scelta in alcun dato salvato…».
- Riattivazione: nessuna nota.

**File modificati:**
- `main/modules/config/repository.ts`: `countSavedValuesForFieldKey`, `countSavedValueForFieldKeyEquals` (helper
  interno `countFieldValueRows` con `json_extract` + `count()`, path bindato), `findFieldsUsingMenuSet`.
- `main/modules/config/service.ts`: `fieldDeactivationNote`/`optionDeactivationNote` (riusano
  `countFieldsConditionalOn`); rimossa la costante generica `DEACTIVATION_JSON_NOTE`; wiring in
  `setFieldActive`/`setMenuOptionActive`.
- `docs/02-data-model.md` §2-quater, `docs/00-backlog-mvp.md` S1.4.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (verifica
interattiva GUI confermata dall'utente: campo/opzione usati → conteggio reale nella nota; non usati → «non
risulta usato»; controllore condizionale segnalato; riattivazione senza nota; disattivazione comunque eseguita).

### 2026-07-21 — Sprint 3 / Cambio menuSetId su campo con valori salvati (guard)

Quarta voce dello **Sprint 3**. Chiude il TODO in `config/service.ts:updateField`: cambiare il menu collegato a
un campo menu non deve **orfanare silenziosamente** valori già salvati. Policy scelta: **blocca** (coerente con la
filosofia guard di C-002). **Backend-only, nessuna migrazione, nessun IPC nuovo, nessun `HistoryEvent`.**

**Comportamento:** al salvataggio di un campo, se il campo è già di tipo `menu` e il `menuSetId` cambia, calcolo
gli **orfani** = valori che il **nuovo** menu non contiene (confronto sui `value` delle opzioni, attive o
disattivate). Fonti degli orfani:
- **valori salvati** sotto la `key` del campo — `practices.custom_values` per i campi `general` (tutte le
  pratiche, anche cestinate), `transition_records.values` ristretti al `transitionId` per i `transition`;
- **conditionalValue** dei campi dipendenti (`conditionalOnFieldId = questo campo`) — evita condizioni di
  visibilità/PEC insoddisfacibili.

Se resta almeno un orfano → `ConflictError` con conteggio (mostrato **inline nel `FieldFormModal`**, che già
instrada gli errori IPC via `ipcErrorMessage`). Cambio verso un menu che contiene comunque quei valori, o su un
campo senza valori salvati → **consentito**. Cambi di tipo (text→menu, menu→text) restano fuori perimetro.

**File modificati:**
- `main/modules/config/repository.ts`: `menuOptionValuesForSet(setId)` (Set dei value), `savedValuesForFieldKey(field)`
  (scan scope-aware via `json_extract` con path bindato), `conditionalValuesDependingOn(fieldId)`. Solo lettura.
- `main/modules/config/service.ts`: `assertMenuChangeDoesNotOrphan(field, newSetId)` + chiamata nel ramo `menu`
  di `updateField` (sostituisce il TODO).
- `docs/02-data-model.md` §2-ter (regola d'integrità), `docs/00-backlog-mvp.md` S1.3 (nota cambio menu).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (verifica
interattiva GUI confermata dall'utente: A→B con valore `alfa` non presente → bloccato inline; aggiunto `alfa` a B →
consentito; campo senza valori salvati → cambio libero; condizioni dipendenti coperte).

### 2026-07-21 — Sprint 3 / Icona app + installer

Terza voce dello **Sprint 3**. Storia di **packaging/asset**: nessun codice app, nessuna migrazione, nessun IPC.
Dà a LexFlow un'icona (placeholder «LF» bianco su navy #1e3a5f) al posto di quella Electron di default.

**Approccio:** unica sorgente **`resources/icon.png` 1024²**; `resources/` è la `buildResources`, quindi
electron-builder 26 la rileva **automaticamente** e genera `.icns` (dmg macOS) e `.ico` (NSIS Windows) al build,
ciascuno sulla propria piattaforma. Generazione dell'icona senza dipendenze esterne (niente ImageMagick/rsvg sul
Mac): script **Python stdlib** (`zlib`, supersampling ×2 per l'anti-aliasing). `.icns` prodotto con `iconutil`.

**File nuovi:**
- `resources/make-icon.py` — generatore riproducibile del PNG (solo stdlib).
- `resources/icon.png` — icona 1024² (sorgente unica).
- `resources/icon.icns` — icona macOS (da `iconutil`).

**File modificati:**
- `electron-builder.yml` — commento che documenta la convenzione `resources/icon.*` (nessuna modifica
  funzionale: l'auto-detect di `buildResources` era già attivo; le righe `win.icon`/`mac.icon` che il vecchio doc
  citava non esistevano — divergenza sanata).
- `docs/BUILD-WINDOWS.md` §8 — da «icona futura» a procedura reale: sorgente, rigenerazione, **come sostituire
  con il logo definitivo** (istruzioni `sips`+`iconutil`).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓. **Verifica end-to-end packaging
macOS:** `npx electron-builder --mac dir` → il bundle `LexFlow.app/Contents/Resources/icon.icns` è **identico**
alla sorgente (1024²) e l'`Info.plist` lo referenzia (`CFBundleIconFile = icon.icns`) → auto-detect confermato.
L'`.ico` di Windows viene generato dallo stesso `icon.png` sulla CI `build-win.yml` (non producibile su macOS). Il
dev (`npm run desktop`) non mostra l'icona pacchettizzata. Artefatto `release/` rimosso (già in `.gitignore`).

### 2026-07-21 — Sprint 3 / S8.5: Card «Documenti mancanti» in Dashboard

Seconda voce dello **Sprint 3**. Nuova sezione Dashboard che elenca le pratiche **attive non finali**
(`isTrashed=false`, fase non finale) a cui manca un documento **atteso per la fase raggiunta**. **Nessuna
migrazione** (usa `documents` di E7), **nessun `HistoryEvent`** (aggregato in sola lettura, come le altre
sezioni dashboard).

**Definizione «atteso» (per category canonica, come l'alert S8.2 — non per key):**
- **Decreto** atteso se category ∈ {`decree_received`, `awaiting_correction`, `awaiting_appeal`,
  `awaiting_liquidation`, `awaiting_integration_scp`, `liquidated`}.
- **Fattura** attesa se category ∈ {`awaiting_liquidation`, `awaiting_integration_scp`, `liquidated`}.
- Fasi iniziali (`deposited`/`awaiting_decree`/`awaiting_integration`) e `suspended`: documento non ancora
  atteso → la pratica non compare (evita rumore). Set di category esplicite e commentate nel service.

**File nuovi:** `src/features/dashboard/MissingDocumentsSection.tsx` (sezione con loading/empty/error, link al
dettaglio, badge dei kind mancanti; colori via token, regola 8).
**File modificati:**
- `shared/ipc.ts`: canale `DASHBOARD_MISSING_DOCUMENTS`, tipi `DashboardMissingDocItem`/
  `DashboardMissingDocumentsResponse`, `LexFlowApi.dashboard.missingDocuments`.
- `main/modules/dashboard/repository.ts`: `findActiveOpenPracticesWithDocFlags()` — pratiche aperte + flag
  `hasDecreto`/`hasFattura` via LEFT JOIN `documents` + aggregazione condizionale `max(case…)`; solo lettura.
- `main/modules/dashboard/service.ts`: `getDashboardMissingDocuments()` — applica le soglie per category,
  costruisce `missing[]`, scarta chi non manca nulla, ordina per n° mancanti poi codice istanza.
- `main/modules/dashboard/controller.ts`, `main/preload.ts`, `src/api/dashboard.ts`,
  `src/features/dashboard/useDashboard.ts`: wiring del canale (handler senza input → nessun zod, come gli altri
  dashboard).
- `src/pages/DashboardPage.tsx`: monta `<MissingDocumentsSection/>` dopo «Avvisi».
- `src/features/documents/useDocuments.ts`: invalida anche `['dashboard']` su upload/elimina documento (prima
  mancava) → la card si aggiorna subito.

**Docs prima del codice:** `00-backlog-mvp.md` (nuova storia S8.5 con AC), `06-ui-ux.md` (sezione Dashboard).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (verifica
interattiva GUI confermata dall'utente: pratica in «Decreto ricevuto» senza decreto → badge «Manca Decreto»;
caricato il decreto → sparisce; pratica in fase iniziale non compare; fattura attesa da fase SCP; empty state;
temi scuri leggibili).

### 2026-07-21 — Sprint 3 / S5.5: Filtri e ricerca sulla timeline del dettaglio pratica

Prima voce dello **Sprint 3** (residui MVP). Aggiunge **filtri/ricerca** allo storico del dettaglio pratica
(prima solo consultabile), chiudendo l'unica storia MVP ancora `IN CORSO`. **Renderer-only**: nessuna migrazione,
nessun IPC nuovo, nessun `HistoryEvent`, nessun cambio schema (si filtra `practice.history` già caricato).

**Filtri (client-side, combinabili):**
- **Ricerca testuale** case/accent-insensitive su `title` + `note` + nomi fase (riusa `normalizeForSearch` di
  `practiceFilters.ts`).
- **Categoria evento**: i 10 `type` grezzi raggruppati in categorie leggibili — `created`→Creazione;
  `auto_transition`/`phase_changed`/`event`→Fase-transizione; `updated`→Modifica; `document_*`→Documenti;
  `trashed`/`restored`→Cestino; fallback `altro`. Il menu mostra **solo le categorie presenti** nella pratica
  (stesso pattern dei filtri elenco).
- **Intervallo date** (da/a inclusivi) sulla porzione `YYYY-MM-DD` del timestamp.
- **Azzera** (visibile solo con filtro attivo).

**Stati:** vuoto totale invariato («Nessun evento registrato», senza barra); **vuoto filtrato** distinto
(«Nessun evento corrisponde ai filtri»).

**File nuovi:** `src/features/practices/timelineFilters.ts` (puro: `categoryForType`, `availableTimelineCategories`,
`filterTimeline`, `hasActiveTimelineFilter`, `TIMELINE_CATEGORIES`; nessun `any`).
**File modificati:** `src/pages/DettaglioPraticaPage.tsx` (`TimelineSection` con stato filtri `useState`, barra
controlli, render filtrato, stato vuoto-filtrato). Colori solo via token CSS (regola 8).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (verifica
interattiva GUI confermata dall'utente: ricerca testo, filtro per categoria — opzioni derivate, periodo da/a,
combinati, azzera, vuoto-filtrato, nessuna regressione su pratica senza eventi e nei temi scuri).

### 2026-07-21 — Post-collaudo Sprint 2 / C-002: eliminazione fisica (config + anagrafiche)

Consente di **eliminare** (non solo disattivare) fasi, transizioni, campi, menu (set/opzioni), professionisti e
collaboratori, **solo quando non in uso**. Chiude i «delete fisica rinviata» di S1.1–S1.4. Nessuna migrazione,
nessun `HistoryEvent` (config/anagrafiche, non pratica; tracciato via log/DB). `foreign_keys = ON` come backstop.

**Regole «in uso» (blocco `ConflictError` con messaggio; cascata dove indicato):**
- **Fase**: non iniziale e non referenziata da transizioni (from/to), pratiche (current/previous, **incl. cestinate**),
  `history_events` o `transition_records`.
- **Transizione**: mai eseguita (nessun `transition_record`) → **cascata** sui suoi `field_defs`.
- **Campo**: nessun campo lo referenzia come `conditionalOnFieldId` (valori JSON salvati restano).
- **Menu set**: non usato da alcun `field_defs.menuSetId` → **cascata** sulle sue `menu_options`.
- **Opzione menu**: sempre eliminabile.
- **Professionista/Collaboratore**: nessuna pratica (attiva **o cestinata**) lo referenzia.

**Nota UX documentata:** gli elementi **standard** (seed) eliminati **riappaiono al riavvio** (seed idempotente);
per nasconderli si usa la disattivazione.

**File nuovi:** `src/components/ui/ConfirmModal.tsx` (conferma generica riusabile, tono distruttivo).
**Backend:** `shared/ipc.ts` (7 canali `*_DELETE_*` + `DeleteByIdInput`/`DeleteResponse`);
`main/modules/config/{repository,service,controller}.ts` (conteggi-riferimenti + delete/cascata in transazione,
guard nei service); `main/modules/anagrafiche/{repository,service,controller}.ts` (`countAnyPractices…` incl.
cestinate + delete); `main/preload.ts`.
**Frontend:** `src/api/{config,anagrafiche}.ts` + i 6 `use*` (mutation delete con invalidazione); pulsante
«Elimina» + `ConfirmModal` (con conteggio figli per la cascata) nelle 6 sezioni; blocco «in uso» mostrato via
`AlertModal` (riuso Sprint 1).
**Docs:** `02-data-model.md` §2/§2-bis, `00-backlog-mvp.md` (E1/E2), COLLAUDO (C-002→risolto), ROADMAP (Sprint 2→fatto).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓
(verifica interattiva GUI confermata dall'utente il 2026-07-21: blocco su entità in uso → **popup** `AlertModal`
— fase iniziale, fase usata da transizioni, professionista collegato a pratica **anche cestinata**; cascata
set→opzioni e transizione→campi con **conteggio figli** nel `ConfirmModal`; eliminazione di elementi non usati OK;
elementi **standard** eliminati **riapparsi al riavvio** — seed idempotente ri-creato 13 fasi/40 transizioni/5 menu
set). **Sprint 2 chiuso.**

### 2026-07-21 — Post-collaudo Sprint 1: fix rapidi (C-001, C-003, C-004) + organizzazione ROADMAP

Dopo il collaudo dell'MVP (tutti i casi OK in `TEST-PLAN-MVP.md`), registrate 4 osservazioni lievi in
`COLLAUDO.md` (C-001…C-004). Organizzato il da-farsi in `ROADMAP.md` (Sprint 1 fix rapidi; Sprint 2 = C-002
eliminazione fisica; Sprint 3 residui MVP; Sprint 4+ post-MVP). Implementato **Sprint 1** (3 fix lievi).
Nessuna migrazione, nessun nuovo IPC, nessun `HistoryEvent`.

**C-004 — messaggi d'errore IPC puliti:** gli errori delle mutation IPC in `AppSettingsPage.tsx` e
`AutoBackupSection.tsx` ora passano da `ipcErrorMessage` (rimuove il prefisso «Error invoking remote method…»).
`main/modules/backup/service.ts`: testi `ValidationError` del restore unificati in «Archivio di backup non
valido.» (motivo tecnico spostato in `logger.warn`).

**C-003 — banner informativi leggibili in ogni tema:** il banner del Cestino (`CestinoPage.tsx`) passa da
sfondo semantico giallo fisso + `--color-text` a **neutro tema-aware** (`--color-bg-subtle`/`--color-border`/
`--color-text-secondary`); il banner «pratica creata» (`PratichePage.tsx`) usa testo `--color-success` (fisso
leggibile) sul suo sfondo success fisso. Regola 8 rispettata (i banner sono informativi, non alert semantici).
Nota aggiunta in `docs/06-ui-ux.md`.

**C-001 — errore guard in popup:** nuovo componente riusabile `src/components/ui/AlertModal.tsx` (notifica
titolo+messaggio+OK). I messaggi di blocco dei guard (disattivazione: unica fase iniziale / fase o anagrafica in
uso) in `PhasesSection.tsx`, `ProfessionistiSection.tsx`, `CollaboratoriSection.tsx` ora escono in **popup**
invece che inline in fondo alla card (`inlineError`→`AlertModal`; rimossi gli `inlineErrorStyle` inutilizzati).
Le note non bloccanti (disattivazione campo/opzione menu) e le validazioni dei form restano inline.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓
(verifica interattiva GUI confermata dall'utente: restore zip invalido → messaggio breve; temi Scuro/Deep dark →
banner leggibili; guard → popup). C-001/C-003/C-004 marcati «risolto» in `COLLAUDO.md`; Sprint 1 chiuso in
`ROADMAP.md`. **Prossimo: Sprint 2 — C-002 eliminazione fisica.**

### 2026-07-04 — Release-prep: packaging Windows + piano di collaudo + roadmap

Storia di **rilascio/collaudo**, solo config + documentazione (nessuna migrazione, IPC, HistoryEvent o logica di
dominio). Prepara la produzione dell'installer Windows e il collaudo dell'MVP.

**Packaging Windows:**
- `electron-builder.yml`: aggiunti i due blocchi mancanti e critici — **`asarUnpack: ['**/*.node']`** (binario
  nativo caricabile) e **`extraResources: [{from: drizzle, to: drizzle}]`** (migrazioni impacchettate →
  `process.resourcesPath/drizzle`, come già previsto da `migrations.ts`). Config preesistente (appId, target
  NSIS/DMG, output `release/<versione>/`) invariata.
- `main/database/migrations.ts`: aggiornato solo il commento (TODO packaging risolto).
- `docs/BUILD-WINDOWS.md` (nuovo): guida passo-passo (⚠️ mai copiare `node_modules` dal Mac; prerequisiti VS
  Build Tools C++/Python; `npm install`→rebuild; `npm run build:win`; output; verifiche primo avvio;
  troubleshooting; icona futura).
- `.github/workflows/build-win.yml` (nuovo): CI `windows-latest` (workflow_dispatch + tag `v*`) → artifact `.exe`.
- `SETUP.md`, `docs/01-architecture.md`: rimando alla guida e nota su electron-builder configurato.

**Collaudo:**
- `docs/TEST-PLAN-MVP.md` (nuovo): checklist eseguibile per epica (A–M), con passi/atteso/esito.

**Correzioni & roadmap:**
- `docs/COLLAUDO.md` (nuovo): registro difetti (ID/gravità/stato) + processo (segnalazione → registrazione →
  stima in ROADMAP → implementazione per DoD).
- `docs/ROADMAP.md` (nuovo): piano stimato S/M/L — §1 correzioni collaudo, §2 rifiniture, §3 post-MVP (E14
  cifratura, S9.2/9.3, E15, E16, E12, S11.5/11.6, numeri procedimento, code signing, spostamento percorso dati).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ (electron-vite, su Mac). La
produzione dell'`.exe` (`build:win`) **non è verificabile su macOS** (modulo nativo): va eseguita su Windows /
via CI (poi collaudo con `TEST-PLAN-MVP.md`).

### 2026-06-27 — S13.*: Qualità trasversale (audit di chiusura) — **MVP COMPLETO**

Storia di **audit**, non di nuova feature: i criteri E13 erano già implementati storia-per-storia. Verifica
sistematica doc↔codice + rifiniture mirate concordate con l'utente.

**Esito audit (conforme):**
- **S13.1** loading/empty/error su tutte le viste dati (config/anagrafiche/documenti/dashboard/dettaglio/cestino/
  pratiche/impostazioni); `importoCalc.ts`/`giorniDeposito.ts` evitano `NaN` («Non presente»/«Non calcolabile»/«—»).
- **S13.2** zod su tutti i form renderer (config ×5, anagrafiche ×2, pratiche ×3) e sui controller main.
- **S13.3** HistoryEvent: created/updated/transizioni(+fase)/trashed/restored/documenti(add·replace·remove).
  Eccezioni motivate: S10.3 hard delete e S11.4 reset (entità distrutte → log); config/tema/percorso/backup
  (operazioni di sistema). 
- **S13.4** PEC multi-destinatario (`pec_recipients` + campo `pec`); numeri procedimento multipli **post-MVP**.

**Rifiniture applicate:**
- `src/pages/ReportPage.tsx`: da placeholder «in costruzione» a **pagina informativa** (rimanda a
  «Pratiche → Esporta CSV»; riepiloghi aggregati = versione successiva; link a `/pratiche`).
- Rimossa la **pagina demo IPC**: `src/routes/Router.tsx` (rotta `/dev/ipc`), `src/components/layout/Sidebar.tsx`
  (link dev + stile `bottomStyle` inutilizzato). **Eliminati** file morti: `src/pages/IpcDemoPage.tsx`,
  `src/pages/PlaceholderPage.tsx`, `src/pages/PlaceholderSection.tsx`.
- Docs: `docs/00-backlog-mvp.md` §E13 annotato (criteri soddisfatti + eccezioni); questo log.

**Nessuna migrazione, nessun nuovo IPC, nessun `HistoryEvent`.** Il canale `app:getVersion` resta (riuso futuro
S11.6 «Info app», Should/post-MVP).

**Stato MVP:** tutte le epiche MVP completate — E0–E8, E9.1, E10, E11 (S11.1/2/3/4/7), E13. Restano fuori MVP:
report aggregati (S9.2/9.3), assistente (E12), protezione dati/cifratura (E14), scadenzario (E15), export PDF
(E16), card alert configurabili (S11.5), info app (S11.6), numeri procedimento multipli.

**Verifiche:** `grep` riferimenti residui → nessuno; `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓.
Verifica interattiva GUI (`npm run desktop`: sidebar senza link dev, `/dev/ipc` non raggiungibile, Report
informativo con link, giro di regressione viste) **da completare manualmente**.

### 2026-06-27 — S9.1: Export CSV delle pratiche filtrate — **E9.1 COMPLETATA**

**Nessuna migrazione** (colonne importi già su `practices`). **Nessun `HistoryEvent`** (export, sola lettura).
Formato Excel-IT (`;`+BOM, decimali con virgola, date gg/mm/aaaa) + 4 importi (scelte utente).

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/modules/export/service.ts` | `exportCsv(win, input)`: dialog salvataggio → `writeFileSync(BOM+content)`. Contenuto già pronto dal renderer (niente ricalcolo nel main). |
| `main/modules/export/controller.ts` | `registerExportHandlers()`: `EXPORT_CSV` (zod `{content, suggestedName}`, window da `event.sender`). |
| `src/features/practices/practicesCsv.ts` | Puro: `practicesToCsv(rows)` (sep `;`, EOL `\r\n`, header IT, escaping RFC4180, date gg/mm/aaaa, importi con virgola) + `buildCsvFileName()` (`pratiche-<ts>.csv`). |
| `src/api/export.ts`, `src/features/practices/useExportCsv.ts` | Client + hook mutation. |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | `PracticeListItem` esteso (importoConcesso/Fatturato/Liquidato); canale `EXPORT_CSV`; tipi `ExportCsvInput`/`ExportCsvResponse`; `LexFlowApi.export`. |
| `main/modules/practices/repository.ts` | `findAllActivePractices`: select+map dei 3 importi denormalizzati (E6). |
| `main/server.ts`, `main/preload.ts` | `registerExportHandlers()`; `export.csv` nel contextBridge. |
| `src/features/practices/practiceFilters.ts` | Estratte `normalizeForSearch`/`searchableBlob` + nuova `filterPractices(list, term, filters)` (fonte unica filtro+ricerca). |
| `src/features/practices/PraticheTable.tsx` | Usa `filterPractices` (rimosse le copie locali); comportamento invariato. |
| `src/pages/PratichePage.tsx` | `useActivePractices` (cache) → `exportable = filterPractices(...)`; pulsante «Esporta CSV (N)» (disabilitato a 0) + feedback percorso/errore. |
| `docs/00-backlog-mvp.md` | AC S9.1 esplicitati. |

**Invarianti / decisioni:**
1. **Rispetta filtri+ricerca per costruzione**: export e tabella usano la stessa `filterPractices`; cestino già
   escluso a monte (`isTrashed=false`).
2. **Excel-IT**: `;`+BOM+decimali virgola+date gg/mm/aaaa, escaping corretto.
3. **Niente fs nel renderer**: CSV costruito nel renderer (dati in cache), scritto nel main via dialog.
4. **4 importi**: query elenco estesa (additivo). Layer rispettati; zod nel controller; nessun `any`.

**Confine di storia:** riepiloghi/aggregati (S9.2 Should), export Excel (S9.3 Could) fuori MVP. Resta per l'MVP la
qualità trasversale **S13.\*** (errori/loading/empty/validazioni/audit).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓
(verifica interattiva GUI confermata dall'utente: export rispetta ricerca/filtri, cestino escluso, apertura in
Excel IT con colonne/decimali/accenti corretti, 4 importi, pulsante disabilitato a 0, annulla dialog → nessun file).

### 2026-06-27 — S11.7: Backup automatico periodico + rotazione — **E11-MVP COMPLETATA**

**Nessuna migrazione** (config già in `app_settings.backup`). Scheduler nel main; riusa `writeBackupZip` (S11.3)
e `getBackupPath` (S11.4). Pre-reset (S11.4) resta indipendente dalla rotazione. Livello **configurabile completo**
+ percorso modificabile (scelte utente).

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/modules/backup/scheduler.ts` | `startAutoBackupScheduler()`/`restartAutoBackupScheduler()` (timer `setInterval` se `autoEnabled && trigger∈{interval,both}`, ogni `intervalHours`); `runOnCloseBackup()` per il trigger di chiusura. Handle a modulo, clear prima di ricreare. |
| `src/features/settings/AutoBackupSection.tsx` | Form config: toggle on/off, checkbox alla chiusura / a intervallo, ore, N copie, percorso (Cambia cartella…/Apri cartella), ultimo backup, «Salva». Sync render-time guardato dal ref della query (no setState-in-effect). |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/modules/backup/repository.ts` | `readBackupObject`/`writeBackupObject` (helper JSON centralizzati); `getBackupConfig` (default robusti), `updateBackupConfig`, `updateBackupPath`; `getBackupPath`/`updateBackupLastBackupAt` rifattorizzati sugli helper. |
| `main/modules/backup/service.ts` | `AUTO_BACKUP_PREFIX`/regex; `runAutoBackup(reason)` (no-op se disabilitato/trigger non corrisponde; try/catch totale); `rotateAutoBackups(dir,keep)` (solo prefisso auto); `readBackupConfig`/`saveBackupConfig`/`changeBackupFolder`(dialog openDirectory)/`openBackupFolder`. |
| `main/modules/backup/controller.ts` | Handler `BACKUP_GET_CONFIG`/`UPDATE_CONFIG` (zod, poi `restartAutoBackupScheduler`)/`CHANGE_FOLDER`/`OPEN_FOLDER`. |
| `main/app.ts` | `startAutoBackupScheduler()` dopo bootstrap; `before-quit` → `runOnCloseBackup()` (sync, guard `onCloseBackupDone`). |
| `main/preload.ts` | `backup.getConfig/updateConfig/changeFolder/openFolder`. |
| `shared/ipc.ts` | 4 canali; tipi `BackupTrigger`/`BackupConfig`/`UpdateBackupConfigInput`/`BackupChangeFolderResponse`/`BackupOpenFolderResponse`; `LexFlowApi.backup` esteso. |
| `src/api/backup.ts`, `src/features/settings/useBackup.ts` | Client + hook `useBackupConfig`/`useUpdateBackupConfig`/`useChangeBackupFolder`/`useOpenBackupFolder`. |
| `src/pages/AppSettingsPage.tsx` | Monta `<AutoBackupSection/>` tra «Backup e ripristino» e «Reset archivio». |
| `docs/00-backlog-mvp.md`, `docs/01-architecture.md`, `docs/02-data-model.md` | AC S11.7; scheduler + rotazione per prefisso; naming auto-backup. |

**Invarianti / decisioni:**
1. **Rotazione sicura**: solo `lexflow-autobackup-*.zip`; manuali e `pre-reset-*` mai toccati.
2. **Auto-backup best-effort**: ogni errore loggato, mai crash/blocco chiusura.
3. **Trigger**: `onClose` (before-quit sync, DB aperto) + `interval` (timer riavviato al cambio config).
4. **Pre-reset (S11.4) indipendente** da naming/rotazione.
5. Layer rispettati; zod nel controller; nessun `any`; `path.join`. Nessun `HistoryEvent` (operazione di sistema).

**Confine di storia:** E11-MVP completa (S11.1/2/3/4/7). Restano S11.5 (card alert configurabili) e S11.6 (info app)
come _Should_, fuori MVP. Prossima per ordine di costruzione: **E9.1 Export CSV** (S9.1).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓
(verifica interattiva GUI confermata dall'utente: config persistita; auto-backup alla chiusura; rotazione a N;
cambio/apri cartella; off → niente backup; pre-reset/manuali non ruotati).

### 2026-06-27 — S11.4: Reset archivio con backup automatico preventivo + doppia conferma — **E11**

**Nessuna migrazione.** Azione distruttiva che svuota l'archivio dopo un **backup preventivo obbligatorio**.
Scope (deciso con l'utente): **pratiche + dati collegati + anagrafiche**; mantiene workflow e impostazioni app.
Riusa le primitive di S11.3.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/modules/reset/repository.ts` | `resetArchive()`: in una transazione bulk-delete FK-safe `documents → pec_recipients → history_events → transition_records → practices → professionisti → collaboratori`; ritorna i conteggi (`changes`). Query solo qui. |
| `main/modules/reset/service.ts` | `resetArchive()`: 1) backup preventivo **obbligatorio** `pre-reset-<ts>.zip` sotto `getBackupPath()` via `writeBackupZip` (se fallisce, propaga errore → niente reset); 2) `resetArchive()` repository; 3) svuota la cartella documenti (`getDocumentsRoot`, rmSync+mkdirSync, best-effort); ritorna `{ backupPath, ...counts }`. |
| `main/modules/reset/controller.ts` | `registerResetHandlers()`: handler `RESET_ARCHIVE` (nessun input). |
| `src/api/reset.ts` | Client `archive()`. |
| `src/features/settings/useReset.ts` | `useResetArchive()` (mutation; `onSuccess` → `invalidateQueries()`). |
| `src/features/settings/ResetArchiveModal.tsx` | Conferma forte a **2 passi** (state step 1|2): passo 1 = cosa si cancella + backup automatico; passo 2 = avviso irreversibilità + pulsante `--color-destructive` «Esegui reset». Nessuna digitazione. |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/modules/backup/service.ts` | Estratto **`writeBackupZip(destPath)`** (build zip senza dialog) riusato da `exportBackup` (S11.3) e dal reset (S11.4). |
| `main/modules/backup/repository.ts` | Aggiunto `getBackupPath()` (parse di `app_settings.backup.backupPath`, fallback userData). |
| `main/server.ts` | `registerResetHandlers()`. |
| `main/preload.ts` | namespace `reset: { archive }`. |
| `shared/ipc.ts` | Canale `RESET_ARCHIVE`; tipo `ResetArchiveResponse`; `LexFlowApi.reset`. |
| `src/pages/AppSettingsPage.tsx` | Sezione «Reset archivio» (zona pericolo): pulsante distruttivo + modale a 2 passi; esito con conteggi + percorso backup. |
| `docs/00-backlog-mvp.md`, `docs/02-data-model.md`, `docs/01-architecture.md` | AC S11.4; reset come hard delete in blocco con backup preventivo; nota su `writeBackupZip`/`backupPath`. |

**Invarianti / decisioni:**
1. **Backup preventivo obbligatorio**: se `writeBackupZip` fallisce, il reset **non** procede.
2. **Scope = pratiche + anagrafiche**; workflow (fasi/transizioni/campi/menu) e `app_settings` intatti. Ordine
   FK-safe in una transazione (`practices` prima di `professionisti`/`collaboratori`).
3. **Doppia conferma** a 2 passi, colore distruttivo fisso (regola 8), nessuna digitazione.
4. **Live, nessun riavvio**: delete DB + svuotamento cartella + `invalidateQueries()`. Archivio già vuoto →
   conteggi 0, nessun errore.
5. Layer rispettati (query solo nel repository; fs/zip/orchestrazione nel service); nessun `any`; `path.join`.
   **Nessun `HistoryEvent`** (entità distrutte; tracciato via log, come S10.3).

**Confine di storia:** backup automatico periodico + rotazione → S11.7.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓
(verifica interattiva GUI confermata dall'utente: reset a 2 passi → elenco/Dashboard/Cestino/Anagrafiche vuoti,
workflow+impostazioni intatti, `pre-reset-<ts>.zip` presente, cartella documenti svuotata; reset su archivio vuoto
→ conteggi 0; annullo modale → nessuna azione; nessuna regressione backup/tema/percorso).

### 2026-06-27 — S11.3: Backup completo (DB + documenti) e ripristino — **E11**

**Nessuna migrazione.** Backup **manuale** (export) + **ripristino** (import). L'automatico periodico + rotazione
è S11.7; il pre-reset è S11.4 (entrambi fuori storia; S11.3 espone le primitive). Nuova dipendenza pura-JS
**`adm-zip`** (+ `@types/adm-zip`). Scelte utente: archivio **singolo `.zip`**, incluso **`data.json`** (dump
tabelle), ripristino con **safety backup automatico** + **swap a freddo al boot** + relaunch.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/modules/backup/repository.ts` | `dumpAllTables()` (select * sulle 13 tabelle, nomi stabili), `tableNames()`, `updateBackupLastBackupAt(iso)` (parse/scrive il JSON `app_settings.backup`). Query solo qui. |
| `main/modules/backup/service.ts` | `exportBackup(win)`: dialog salvataggio → `.zip` con `lexflow.db` (`checkpointDb()`+addLocalFile), `documenti/`, `data.json`, `manifest.json`; `updateBackupLastBackupAt`. `restoreBackup(win)`: dialog apertura → valida `manifest.json` (formato + `lexflow.db`) → estrae in `userData/restore-staging/` → scrive marker → `app.relaunch()`+`app.exit(0)`. |
| `main/modules/backup/restoreBootstrap.ts` | `applyPendingRestore()`: a boot, prima del DB, se c'è il marker fa safety backup `pre-restore-<ts>/` dei dati correnti, poi swap `lexflow.db` (rimuove `-wal`/`-shm`) + `documenti/`, pulisce staging+marker. Robusto (try/catch, marker rimosso per evitare boot-loop). Esporta i nomi `RESTORE_STAGING_DIR`/`PENDING_RESTORE_MARKER`. |
| `main/modules/backup/controller.ts` | `registerBackupHandlers()`: `BACKUP_EXPORT`/`BACKUP_RESTORE`, ricavano la `BrowserWindow` da `event.sender` (pattern documents). |
| `main/modules/backup/naming.ts` | `backupTimestamp()` `AAAAMMGG-HHMMSS` (fonte unica per nome archivio + cartella safety). |
| `src/api/backup.ts` | Client `export()`/`restore()`. |
| `src/features/settings/useBackup.ts` | `useExportBackup()` / `useRestoreBackup()` (mutation). |
| `src/features/settings/RestoreBackupModal.tsx` | Conferma **forte** (avviso d'irreversibilità, `--color-destructive`, regola 8): sovrascrive + safety backup + riavvio; nessuna digitazione. |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/database/connection.ts` | Riferimento a modulo `sqliteHandle`; `getDbFilePath()` e `checkpointDb()` (`wal_checkpoint(TRUNCATE)`) per la copia DB consistente. |
| `main/modules/documents/service.ts` | `getDocumentsRoot()` esportata (riuso dal modulo backup; unica fonte del path documenti). |
| `main/app.ts` | `applyPendingRestore()` tra `validateStartupConfig()` e `initDatabase()`. |
| `main/server.ts` | `registerBackupHandlers()`. |
| `main/preload.ts` | namespace `backup: { export, restore }`. |
| `shared/ipc.ts` | Canali `BACKUP_EXPORT`/`BACKUP_RESTORE`; tipi `BackupExportResponse`/`BackupRestoreResponse`; `LexFlowApi.backup`. |
| `src/pages/AppSettingsPage.tsx` | Sezione «Backup e ripristino»: «Esporta backup…» (esito/percorso) e «Ripristina da backup…» (modale forte). |
| `docs/01-architecture.md`, `docs/02-data-model.md`, `docs/00-backlog-mvp.md` | Backup `.zip` (adm-zip), restore a freddo + safety backup, confine vs S11.4/S11.7. |
| `package.json` | dep `adm-zip`, devDep `@types/adm-zip`. |

**Invarianti / decisioni:**
1. **Copia DB consistente**: `wal_checkpoint(TRUNCATE)` + file aggiunto allo zip (mono-utente, handler sincrono,
   nessuna scrittura concorrente). Al restore i `-wal`/`-shm` correnti sono rimossi prima di sovrascrivere il DB.
2. **Restore a freddo**: swap a boot **prima** dell'apertura del DB → nessun lock file su Windows; poi relaunch;
   le migrazioni a boot allineano un DB ripristinato più vecchio.
3. **Rete di sicurezza**: copia automatica dei dati correnti in `pre-restore-<ts>/` prima dello swap.
4. **Validazione archivio**: `manifest.json` (`format` + presenza `lexflow.db`) → altrimenti errore senza toccare i dati.
5. **Regola 8** (colore distruttivo) nella conferma; layer rispettati (query solo nel repository; fs/zip/relaunch
   nel service/bootstrap); nessun `any`; `path.join` (regola 11). **Nessun `HistoryEvent`** (operazione di sistema, log).

**Confine di storia:** backup automatico periodico + rotazione → S11.7; backup preventivo pre-reset → S11.4.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓
(verifica interattiva GUI confermata dall'utente: export `.zip` col contenuto atteso; restore con conferma forte
→ riavvio → dati del backup + `pre-restore-<ts>/` presente; zip non valido → errore senza sovrascrivere; annullo
dialog → nessuna azione; nessuna regressione tema/percorso/documenti).

### 2026-06-26 — S11.2: Percorso dati (visualizza / copia / apri) + puntatore di bootstrap — **E11**

**Nessuna migrazione.** Scope MVP (deciso con l'utente): la sezione «Percorso dati» fa solo
**visualizza + copia stringa + apri cartella**; lo **spostamento/cambio effettivo del percorso è post-MVP**
(storia dedicata). La portabilità dei dati nell'MVP è coperta da backup/ripristino (S11.3). Si introduce però
ora l'infrastruttura di lettura: un **puntatore di bootstrap** esterno al DB.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/config/dataPath.ts` | Unica fonte di verità del percorso dati a runtime. `resolveDataPath()` legge/crea `<userData>/config.json` (default `dataPath = app.getPath('userData')`), valida con zod, **cacha** il risultato; robusto (errori IO/parse → log + fallback al default, mai crash). `getDataPath()` ritorna il valore cachato. Risolto **prima** dell'apertura del DB perché il DB sta dentro la cartella dati e non può indicare dove aprirsi. |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/config/startup.ts` | `validateStartupConfig` risolve (`resolveDataPath`) e valida il **percorso dati effettivo** (mkdir + W_OK), non più `userData` direttamente. |
| `main/database/connection.ts` | `dbPath = join(getDataPath(), 'lexflow.db')` (era `app.getPath('userData')`). |
| `main/modules/documents/service.ts` | `getDocumentsRoot()` usa `join(getDataPath(), 'documenti')`; rimosso `app` dall'import electron; commento «quando E11.2…» risolto. |
| `main/modules/settings/service.ts` | `getAppSettings`/`updateTheme` ritornano anche `dataPath` (= `getDataPath()`, **non** la colonna DB). Nuova `openDataFolder()` → `shell.openPath(getDataPath())`, ritorna `{ success }`, errore loggato. |
| `main/modules/settings/controller.ts` | Handler `SETTINGS_OPEN_DATA_FOLDER` (nessun input). |
| `main/preload.ts` | `settings.openDataFolder` nel contextBridge. |
| `shared/ipc.ts` | Canale `SETTINGS_OPEN_DATA_FOLDER`; `AppSettingsView` esteso con `dataPath`; tipo `SettingsOpenDataFolderResponse`; `LexFlowApi.settings.openDataFolder`. |
| `src/api/settings.ts` | Client `openDataFolder()`. |
| `src/features/settings/useSettings.ts` | `useOpenDataFolder()` (mutation); `useAppSettings` invariato (response ora include `dataPath`). |
| `src/pages/AppSettingsPage.tsx` | Nuova sezione «Percorso dati»: percorso in monospace, «Copia percorso» (`navigator.clipboard`, feedback «Copiato»), «Apri cartella» (`openDataFolder`); loading/error coerenti con la sezione tema. |
| `docs/01-architecture.md` | Sezione «Percorsi»: `dataPath` risolto dal puntatore esterno; spostamento = post-MVP. |
| `docs/02-data-model.md` | Radice documenti = `<dataPath>/documenti/` risolto dal puntatore; colonna `dataPath` = legacy/visualizzazione, non autoritativa. |
| `docs/00-backlog-mvp.md` | S11.2 AC esplicitati (visualizza/copia/apri + puntatore; spostamento post-MVP). |

**Invarianti / decisioni:**
1. **Puntatore = autorità runtime** del percorso dati (`config.json` in userData), risolto a boot prima del DB;
   default = userData. La colonna `app_settings.dataPath` resta legacy/visualizzazione (non rimossa, no migrazione).
2. **Nessuno spostamento dati nell'MVP**: default invariato → percorso identico a oggi, nessuna regressione.
3. **Robustezza boot**: errori del puntatore → log + fallback al default.
4. **Copia = stringa** (renderer, `navigator.clipboard`); **Apri cartella** via `shell.openPath` (main).
5. Layer rispettati (`getDataPath` è util di config, non query DB); nessun `any`; `path.join` (regola 11).
   Nessun `HistoryEvent` (config app, coerente con S11.1).

**Confine di storia:** spostamento/cambio percorso (post-MVP), backup/ripristino (S11.3), reset (S11.4),
backup automatico (S11.7).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓
(verifica interattiva GUI confermata dall'utente: `config.json` creato/ricreato al boot, sezione mostra il
percorso, Copia/Apri cartella, nessuna regressione tema+documenti).

### 2026-06-26 — S11.1: Tema interfaccia + colori semantici fissi — **apre E11 (Impostazioni app)**

**Nessuna migrazione.** La colonna `app_settings.theme` (default `light`) esisteva già ed era seeded;
questa storia la rende **selezionabile e applicata**. Prima storia di E11; il nuovo modulo `settings`
è la casa delle storie successive (percorso dati, backup, reset).

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `shared/themes.ts` | Fonte di verità unica dei temi: `THEME_KEYS` (`light`/`dark`/`pastel`/`deep-dark`/`mustard-grey`), `ThemeKey`, `DEFAULT_THEME`, `THEMES` (key+label IT), guard `isThemeKey`. Usato da main (validazione/normalizzazione), renderer (selettore/applicazione) e `shared/ipc` (tipi). |
| `main/modules/settings/repository.ts` | `getAppSettingsRow()` (riga unica `id=1`) e `updateThemeRow(theme)` (UPDATE singola colonna, ritorna `changes`). Query solo qui. |
| `main/modules/settings/service.ts` | `getAppSettings()` (normalizza al `DEFAULT_THEME` se il valore DB fosse fuori dominio) e `updateTheme(input)` (valida via `isThemeKey`→`ValidationError`; `NotFoundError` se la riga manca). |
| `main/modules/settings/controller.ts` | `registerSettingsHandlers()`: `SETTINGS_GET`/`SETTINGS_UPDATE_THEME` con zod (`z.enum(THEME_KEYS)`) via `parseOrThrow` (stile config). |
| `src/api/settings.ts` | Client `settingsApi.get()`/`updateTheme(input)`. |
| `src/features/settings/useSettings.ts` | `useAppSettings()` (queryKey `['settings']`) e `useUpdateTheme()` (mutation; `onSuccess` → `setQueryData(['settings'])` così ThemeApplier riflette subito il tema). |
| `src/components/theme/ThemeApplier.tsx` | Componente senza UI: legge la query e in un `useEffect` imposta `document.documentElement.dataset.theme`. Default `light` finché carica. |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | Import `ThemeKey`; canali `SETTINGS_GET`/`SETTINGS_UPDATE_THEME`; tipi `AppSettingsView`/`UpdateThemeInput`/risposte; namespace `settings` in `LexFlowApi`. |
| `main/preload.ts` | `settings: { get, updateTheme }` nel contextBridge. |
| `main/server.ts` | `registerSettingsHandlers()` nel bootstrap. |
| `src/App.tsx` | Monta `<ThemeApplier/>` accanto a `<Router/>` (sotto il `QueryClientProvider` esistente). |
| `src/pages/AppSettingsPage.tsx` | Da placeholder a pagina reale: sezione «Tema» con 5 card (anteprima sidebar/sfondo/superficie/accento + label + badge «Attivo»), click → `updateTheme`; loading/error gestiti. |
| `src/styles/global.css` | Aggiunto `--color-bg-subtle` in `:root` e in ogni tema (era solo fallback hardcoded); 4 blocchi `html[data-theme='…']` (dark/pastel/deep-dark/mustard-grey) che ridefiniscono **solo** i token base/sidebar. I token semantici restano in `:root`. |
| `docs/00-backlog-mvp.md` | AC di S11.1 esplicitati. |

**Invarianti / decisioni:**
1. **Colori semantici intoccabili per costruzione** (regola 8): alert/errori/distruttive/successo vivono in
   `:root` e non sono mai ridichiarati nei blocchi `data-theme` → nessun tema può sovrascriverli.
2. **Sorgente di verità = DB** (`app_settings.theme`), letta/scritta con TanStack Query come il resto del
   codebase. **Niente Zustand**: sarebbe un secondo store da sincronizzare (no astrazione prematura).
3. **Applicazione via `data-theme`** su `<html>`; il cambio non è ottimistico sul DOM (lint
   `react-hooks/immutability`): la mutation aggiorna la cache `['settings']` → ThemeApplier applica.
   L'IPC è locale/sincrono lato DB, il cambio è praticamente istantaneo.
4. **Persistenza a riavvio gratuita**: al boot ThemeApplier legge la query e applica il tema salvato.
5. **Nessun `HistoryEvent`**: operazione di configurazione dell'app, non sulla pratica.
6. Layer rispettati: query solo nel repository; validazione zod nel controller + guard nel service;
   nessun `any`.

**Confine di storia:** percorso dati (S11.2), backup/ripristino (S11.3), reset (S11.4), backup automatico
(S11.7), soglie alert configurabili (S11.5), info app (S11.6). La bonifica dei ~51 colori hardcoded residui
(badge, `#fff` su pulsanti accent, hex semantici) **non** è in S11.1 (gli hex semantici e il bianco su
accent sono volutamente fissi) → TODO futuro non bloccante.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓. Verifica interattiva GUI
(`npm run desktop`: selezione dei 5 temi → cambia sfondo/card/bordi/testo/accenti/sidebar; alert Dashboard,
box d'errore e pulsanti distruttivi invariati in ogni tema; persistenza dopo riavvio) da completare
manualmente.

### 2026-06-26 — Chiusura pendenze pre-E11: ErrorBoundary (S0.3) + allineamento stati S0.2/S5.5

Intervento di chiusura pendenze emerse dall'audit di metà-MVP, su tre punti.

**S0.3 — chiusura.** Aggiunto `ErrorBoundary` nel renderer (`src/components/ui/ErrorBoundary.tsx`):
componente di classe con `getDerivedStateFromError` + `componentDidCatch`, che avvolge le pagine in
`AppLayout` tramite `<ErrorBoundary key={location.key}>` (la navigazione lo rimonta e azzera l'errore).
Un errore di rendering ora mostra un **fallback leggibile** (card con i token semantici d'errore fissi
di `06-ui-ux.md` — non ridefiniti dal tema — titolo chiaro, dettaglio muted, pulsanti «Riprova» e
«Ricarica l'app») invece dello schermo bianco. La gestione errori IPC esistente (AppError sollevati dai
controller → serializzati da Electron nel reject di `invoke()` → messaggio estratto da
`src/utils/ipcError.ts`) è stata **documentata come scelta deliberata di semplicità mono-utente** nella
sezione «Errori» di `docs/04-conventions.md`: nessun middleware IPC formale né envelope d'errore
strutturato (si introdurrà solo se servirà). Con ciò S0.3 è completa.

**S0.2 — allineamento stato.** Il bridge IPC tipizzato (preload+contextBridge, `shared/ipc.ts`) è
pienamente implementato e usato da tutti i moduli; client renderer in `src/api/*`. Stato in PROGRESS
corretto da `TODO` a `FATTO` (era un disallineamento, non lavoro mancante).

**S5.5 — residuo esplicitato.** La timeline consultabile è implementata (`TimelineSection` nel dettaglio
pratica, storico `HistoryEvent` read-only). Riga PROGRESS aggiornata a `IN CORSO` con nota «timeline
consultabile FATTA; filtri/ricerca = residuo post-MVP» (non marcata FATTO, per riflettere la realtà).

File: `src/components/ui/ErrorBoundary.tsx` (nuovo), `src/components/layout/AppLayout.tsx` (wiring),
`docs/04-conventions.md` (sezione Errori riscritta), `docs/PROGRESS.md` (stati + questa voce).
Verifica fallback: throw temporaneo in una vista → fallback mostrato, non schermo bianco; throw rimosso.
Nessuna migrazione. Gate: `typecheck` ✓ · `lint` ✓ · `build` ✓ · `desktop` ✓. Commit a cura dell'utente.

### 2026-06-26 — S-FIX-guards: chiusura dei 5 guard «non disattivare se in uso da pratiche»

Storia di rimedio. Chiusi i 5 punti di disattivazione lasciati come TODO in E0–E2
(in attesa della tabella `practices`, ora esistente e popolata). Regole comuni: «in uso»
considera **solo pratiche non cestinate** (`isTrashed = false`); il guard riguarda solo la
**disattivazione** (`setActive=false`), la riattivazione è sempre permessa; messaggi con conteggio.

Due comportamenti distinti, per natura della referenza:

- **BLOCCO vero** (`ConflictError`, disattivazione impedita) per entità referenziate da **colonne**,
  dove la verifica è economica e disattivarle romperebbe pratiche vive:
  - **Professionista** (`anagrafiche/service.ts setProfessionistaActive`) — in uso se ∃ pratica non
    cestinata con `professionistaId = id`.
  - **Collaboratore** (`anagrafiche/service.ts setCollaboratoreActive`) — `collaboratoreId = id`.
  - **Fase** (`config/service.ts assertCanDeactivate`) — in uso se è `currentPhaseId` **oppure**
    `previousPhaseId` di una pratica non cestinata (`previousPhaseId` incluso esplicitamente: una
    pratica sospesa lo ricorda per «Riprendi pratica»). Il vincolo preesistente «unica fase iniziale»
    resta e precede il nuovo controllo.
- **AVVISO non bloccante** (la disattivazione procede; il service ritorna `{ success: true, warning? }`)
  per entità il cui valore vive dentro JSON, dove lo scan sarebbe costoso e disattivarle **non corrompe**
  i dati esistenti (li nasconde solo dai nuovi form):
  - **Opzione menu** (`config/service.ts setMenuOptionActive`) e **Campo / FieldDef**
    (`config/service.ts setFieldActive`) — nota: «Disattivato. I valori già salvati nelle pratiche
    restano invariati; l'elemento non comparirà nei nuovi inserimenti.» **Scelta deliberata MVP**:
    nessuno scan di `customValues` / `transition_records.values`; lasciato un TODO mirato per un
    controllo rigoroso futuro.

Nuove query nei repository (nessuna query fuori dai repository): `countActivePracticesByProfessionista`,
`countActivePracticesByCollaboratore` (`anagrafiche/repository.ts`), `countActivePracticesUsingPhase`
(`config/repository.ts`). Tipi IPC `ConfigSetMenuOptionActiveResponse` e `ConfigSetFieldActiveResponse`
estesi con `warning?: string` (i controller restano pass-through). Renderer: nota informativa mostrata
in `MenusSection.tsx` (nuovo stato `inlineNote` + `inlineNoteStyle`) e `FieldsSection.tsx` (riusa
`pecNote`); i guard di blocco usano il flusso d'errore esistente (`inlineError`/`setFormError`).

AC del guard ora soddisfatti: **S1.1** (fase, BLOCCO con `previousPhaseId`), **S1.3** (campo, AVVISO),
**S1.4** (opzione menu, AVVISO), **S2.1** (professionista, BLOCCO), **S2.2** (collaboratore, BLOCCO).
TODO scaduti rimossi nei due service (resta solo il nuovo TODO mirato sullo scan JSON; il TODO
`menuSetId` controllore in `setFieldActive`/`updateField` è altro tema, lasciato invariato).
Nessuna migrazione. Gate: `typecheck` ✓ · `lint` ✓ · `build` ✓. Commit a cura dell'utente.

### 2026-06-26 — Audit di metà-MVP (sola verifica, nessuna modifica al codice)

Eseguito audit di coerenza doc↔codice su E0–E10, **a schermo**, su richiesta
dell'utente. **Nessuno stato di storia alterato, nessuna correzione applicata**:
solo report. Gate verdi: `typecheck` ✓ · `lint` ✓ · `build` ✓. Esiti principali
(dettaglio completo nel report a schermo della sessione):

- **Nessun bloccante.** FK attive, soft delete coerente (cestino escluso da elenco
  `repository.ts:694`, card `dashboard/repository.ts:27`, alert+anzianità `:57`),
  hard delete S10.3 FK-safe sui 4 figli.
- **Storia IN CORSO = S0.3**: manca l'**ErrorBoundary nel renderer** (assente in
  `src/`) e la formalizzazione della gestione errori IPC (oggi stringa + regex
  `ipcError.ts`). zod/logger/AppError già presenti.
- **Status PROGRESS da riallineare** (debito, non toccati ora): S0.2 «Bridge IPC»
  marcata TODO ma di fatto FATTO; S5.5 «Storico/timeline» marcata TODO ma
  `TimelineSection` è renderizzata nel dettaglio.
- **5 TODO-guard scaduti** (presupposto «practices non esiste» caduto da S4.1, ora
  implementabili; le FK NON coprono la *disattivazione*): `config/service.ts:103`
  (fase), `:405` (opzione menu), `:597` (campo); `anagrafiche/service.ts:105`
  (professionista), `:158` (collaboratore). Violano gli AC di S1.1/S1.3/S1.4/S2.1/S2.2.
- **Divergenze documentali** (da correggere prima del codice relativo, non ora):
  M1 `02-data-model.md` §PecRecipient cita `phaseRecordId` ma il codice usa
  `transitionRecordId`; M2 `03-workflow-engine.md` §Sospensione dice «qualsiasi fase
  aperta» mentre Liquidata (per `07-workflow-tree.md`) non ha «Sospendi».
- **TODO ancora validi** (nessuna azione): `practices/service.ts:525` (PEC contesto,
  post-MVP), `config/service.ts:560` (cambio menuSetId controllore),
  `migrations.ts:11` (packaging `drizzle/` in extraResources, rilevante a release).

### 2026-06-26 — S10.3: Cancellazione definitiva — **E10 (Cestino) COMPLETATA**

**Nessuna migrazione.** A differenza di S10.1/S10.2 (soft delete reversibile su
colonne), questa è una **hard delete** irreversibile: rimuove la riga `practices`
e tutti i suoi figli dal DB + la cartella documenti dal filesystem. Chiude il
ciclo di vita della pratica (sposta → ripristina → **cancella**) e l'epica E10.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `src/features/practices/PermanentDeleteModal.tsx` | Modale di conferma **forte** riusabile (riga singola + bulk): box d'avviso d'irreversibilità (`--color-error-*`), pulsante distruttivo `--color-destructive` (regola 8), **nessuna** digitazione richiesta (decisione utente). Props `count`/`pending`/`onConfirm()`/`onClose` |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | Canale `PRACTICES_PERMANENT_DELETE`; tipi `PermanentDeleteInput { ids }`/`PermanentDeleteResponse { deletedCount }`; esteso `LexFlowApi.practices.permanentDelete` |
| `main/modules/documents/service.ts` | Esportata `removePracticeDocumentsDir(codiceIstanza)` (best-effort `rmSync` ricorsivo della cartella `<codiceIstanza>`, errori loggati). Riusa `resolveDocumentPath` (unica fonte del path documenti) |
| `main/modules/practices/repository.ts` | `PracticeCore` esteso con `codiceIstanza` (letto da `findPracticeCoreById`); `deleteDocumentsByPractice`/`deletePecRecipientsByPractice`/`deleteHistoryEventsByPractice`/`deleteTransitionRecordsByPractice`; `deletePracticeRow(id)` con guard `isTrashed=true` (idempotente, ritorna `changes`); import schema `documents` |
| `main/modules/practices/service.ts` | `permanentDelete(input)`: una sola transazione; per ogni id `findPracticeCoreById` → salta se assente/non cestinata; cancella i figli nell'ordine FK `documents→pec_recipients→history_events→transition_records→practices`, poi `deletePracticeRow`; raccoglie i `codiceIstanza` rimossi; **dopo** il commit `removePracticeDocumentsDir` per ciascuno; `logger.info` riepilogativo; ritorna `deletedCount` |
| `main/modules/practices/controller.ts` | `permanentDeleteSchema` (ids≥1) + handler `PRACTICES_PERMANENT_DELETE` |
| `main/preload.ts` | `practices.permanentDelete` nel contextBridge |
| `src/api/practices.ts` | Client `permanentDelete` |
| `src/features/practices/usePractices.ts` | `usePermanentDelete` (invalida `['practices']`,`['trash']`,`['dashboard']`,`['practice',id]`) |
| `src/pages/CestinoPage.tsx` | Pulsante «Elimina» per riga (distruttivo) accanto a «Ripristina»; toolbar bulk «Elimina definitivamente le N pratiche»; stato `deleteTargets`/`deleteError`; montaggio `PermanentDeleteModal`; svuota selezione al successo |
| `docs/00-backlog-mvp.md` | S10.3 AC esplicitati (hard delete, ordine figli, cartella documenti, solo cestinate, idempotenza, nessun HistoryEvent, conferma forte) |
| `docs/02-data-model.md` | Regola 3 estesa: distinzione soft delete (default reversibile) vs cancellazione definitiva (hard delete + figli + cartella) |

**Invarianti / decisioni:**
1. **Hard delete con FK ON**: `PRAGMA foreign_keys = ON` impone di cancellare i
   figli prima della pratica. Ordine `documents → pec_recipients → history_events
   → transition_records → practices`, tutto in **un'unica transazione** (coerenza
   o rollback).
2. **Solo pratiche cestinate** (`isTrashed=true`): la cancellazione è raggiungibile
   solo via flusso Cestino. Assenti/non cestinate saltate (idempotenza),
   `deletedCount` conta solo le rimosse ora (`deletedCount=0` senza errore).
3. **Filesystem fuori transazione**: la cartella `<codiceIstanza>` è rimossa
   **dopo** il commit, best-effort (log su errore), come gli `unlink` dei documenti
   (E7). Un fallimento fs non annulla una cancellazione DB già avvenuta.
4. **Nessun HistoryEvent** (eccezione motivata alla regola 9): la pratica e i suoi
   `history_events` vengono distrutti; non esiste un contenitore dove conservarlo.
   La cancellazione è tracciata via `logger.info`.
5. **Conferma forte senza digitazione** (decisione utente) + colore distruttivo
   fisso (regola 8).
6. **Solo dalla pagina Cestino** (decisione utente): il banner del dettaglio di una
   cestinata mantiene solo «Ripristina».
7. Layer rispettati: query solo nel repository; logica/transazione nel service;
   zod nel controller; nessun `any`. Riuso fs via helper esportato (no duplicazione
   del path, no salto di layer).

**Confine di storia:** E10 completa. Prossima epica per ordine di costruzione: E11
(Impostazioni — tema/percorso dati/backup).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓.
Verifica interattiva GUI (`npm run desktop`: cancellazione per riga e bulk dal
Cestino, modale forte, sparizione definitiva, rimozione righe figlie + cartella
documenti dal DB/fs dev, idempotenza) da completare manualmente.

---

### 2026-06-26 — S10.2: Ripristino dal cestino (singolo e multiplo)

**Nessuna modifica schema, nessuna migrazione.** Inverso speculare di S10.1: le
colonne `isTrashed`/`trashedAt`/`trashReason` esistono già. Questa storia rende
**reversibile** lo stato cestinato, chiudendo il round-trip del Cestino.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `src/features/practices/RestoreFromTrashModal.tsx` | Modale di conferma **leggera** riusabile (dettaglio + Cestino, singolo/bulk): **nessun motivo** (a differenza di `MoveToTrashModal`), pulsante di conferma con colore **accent neutro** — azione non distruttiva (regola 8); props `count`/`pending`/`onConfirm()`/`onClose` |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | Canale `PRACTICES_RESTORE`; tipi `RestoreFromTrashInput`/`RestoreFromTrashResponse`; esteso `LexFlowApi.practices.restore` |
| `main/modules/practices/repository.ts` | `restoreFromTrash(id, restoredAt)` (update `isTrashed=false`, azzera `trashedAt`/`trashReason`, `version+1`, guard `isTrashed=true` → idempotente, ritorna `changes`) |
| `main/modules/practices/service.ts` | `restoreFromTrash(input)`: una sola transazione, per ogni id salta assenti/non cestinate, `restoreFromTrashRow`+`HistoryEvent` `restored`, ritorna `restoredCount` |
| `main/modules/practices/controller.ts` | `restoreFromTrashSchema` (ids≥1) + handler `PRACTICES_RESTORE` |
| `main/preload.ts` | `practices.restore` nel contextBridge |
| `src/api/practices.ts` | Client `restore` |
| `src/features/practices/usePractices.ts` | `useRestoreFromTrash` (invalida `['practices']`,`['trash']`,`['dashboard']`,`['practice',id]`) |
| `src/pages/CestinoPage.tsx` | Sola lettura → interattiva: colonna checkbox + «seleziona tutto» (indeterminate), pulsante «Ripristina» per riga, toolbar bulk (conteggio + ripristina + deseleziona), modale di conferma, riga errore; selezione effettiva derivata in render (intersezione con righe presenti) |
| `src/pages/DettaglioPraticaPage.tsx` | Pulsante «Ripristina» (accent) nel banner «Questa pratica è nel cestino»; al successo resta sul dettaglio (l'invalidazione ricarica la vista, banner via, Modifica/azioni di nuovo attive); stato `restoring`/`restoreError` |
| `docs/00-backlog-mvp.md` | S10.2 AC esplicitati (singolo+bulk, conferma senza motivo, idempotenza, evento `restored`, ritorno nei conteggi) |

**Invarianti / decisioni:**
1. **Soft delete reversibile** (regola 6): ripristino = `isTrashed=false`; i file
   documentali non vengono toccati (coerente con E7).
2. **`trashedAt`/`trashReason` azzerati**: una pratica attiva non conserva quei
   campi; la traccia resta negli `HistoryEvent` (`trashed` + `restored`).
3. **Idempotenza + atomicità**: una sola transazione; pratiche non cestinate
   saltate; `restoredCount` conta solo quelle ripristinate ora (`restoredCount=0`
   se nulla cambia, nessun errore).
4. **Conferma leggera senza motivo**: il ripristino non è distruttivo → pulsante
   accent, niente `--color-destructive` (regola 8).
5. **HistoryEvent** `restored` per pratica (regola 9).
6. Layer rispettati: query solo nel repository; logica/transazione nel service;
   zod nel controller; nessun `any`.

**Confine di storia:** cancellazione definitiva (irreversibile, avviso forte) → S10.3.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓.
Verifica interattiva GUI (`npm run desktop`: ripristino per riga, bulk, da
dettaglio; ricomparsa in elenco/Dashboard/conteggi; evento storico; idempotenza)
da completare manualmente.

---

### 2026-06-26 — S10.1: Sposta nel cestino — **apre E10 (Cestino)**

**Nessuna modifica schema, nessuna migrazione.** Le colonne `isTrashed`/`trashedAt`/
`trashReason` esistevano già su `practices`; le esclusioni (Dashboard/alert/elenco/
anzianità) filtravano già `isTrashed=false`. Questa storia rende **raggiungibile** lo
stato cestinato.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `src/features/practices/MoveToTrashModal.tsx` | Modale di conferma riusabile (dettaglio + bulk): motivo **obbligatorio**, pulsante di conferma con colore distruttivo fisso `--color-destructive` (regola 8); props `count`/`pending`/`onConfirm`/`onClose` |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | Canali `PRACTICES_MOVE_TO_TRASH`/`PRACTICES_LIST_TRASHED`; tipi `MoveToTrashInput`/`MoveToTrashResponse`/`TrashedPracticeItem`/`PracticesListTrashedResponse`; estesa `LexFlowApi.practices` |
| `main/modules/practices/repository.ts` | `moveToTrash(id,reason,trashedAt)` (update `isTrashed/trashedAt/trashReason`, `version+1`, guard `isTrashed=false` → idempotente, ritorna `changes`); `findTrashedPractices` (join `phases`, `orderBy desc(trashedAt)`) |
| `main/modules/practices/service.ts` | `moveToTrash(input)`: valida motivo non vuoto, una sola transazione, per ogni id salta assenti/già cestinate, `moveToTrashRow`+`HistoryEvent` `trashed`, ritorna `trashedCount`; `listTrashedPractices` pass-through |
| `main/modules/practices/controller.ts` | `moveToTrashSchema` (ids≥1, reason trim min 1) + handler `PRACTICES_MOVE_TO_TRASH`/`PRACTICES_LIST_TRASHED` |
| `main/preload.ts` | `practices.moveToTrash`/`practices.listTrashed` nel contextBridge |
| `src/api/practices.ts` | Client `moveToTrash`/`listTrashed` |
| `src/features/practices/usePractices.ts` | `useMoveToTrash` (invalida `['practices']`,`['trash']`,`['dashboard']`,`['practice',id]`) + `useTrashedPractices` (queryKey `['trash']`) |
| `src/pages/DettaglioPraticaPage.tsx` | Pulsante «Sposta nel cestino» (distruttivo, accanto a Modifica, nascosto se cestinata); banner «Questa pratica è nel cestino»; `WorkflowActions` nascoste se cestinata; navigazione a `/pratiche` al successo |
| `src/features/practices/PraticheTable.tsx` | Toolbar di selezione: pulsante «Sposta nel cestino» (su `visibleSelectedIds`), modale, svuota selezione al successo, riga errore |
| `src/pages/CestinoPage.tsx` | Placeholder → tabella sola lettura (codice cliccabile=Apri, nome, fase, data cestinazione, motivo) + avviso in testa; loading/empty/error |
| `docs/00-backlog-mvp.md` | S10.1 AC esplicitati (singola+bulk, motivo obbligatorio, `trashedAt`, evento `trashed`, esclusioni già attive, pagina Cestino sola lettura) |

**Invarianti / decisioni:**
1. **Soft delete** (regola 6): nessuna riga rimossa; i file documentali non vengono
   toccati (sopravvivono a cestino+ripristino, coerente con E7).
2. **Motivo obbligatorio** validato su entrambi i lati (zod main + guard renderer, regola 10).
3. **Bulk = stesso motivo**, operazione **atomica** in un'unica transazione; pratiche
   già cestinate saltate (idempotenza), `trashedCount` conta solo quelle spostate ora.
4. **Colori distruttivi fissi** dal token `--color-destructive` (regola 8).
5. **HistoryEvent** `trashed` per pratica (regola 9), motivo in `note`.
6. Layer rispettati: query solo nel repository; logica/transazione nel service; zod nel controller; nessun `any`.

**Confine di storia:** ripristino (singolo/multiplo) → S10.2; cancellazione definitiva
(conferma forte separata) → S10.3; in S10.1 la pagina Cestino è sola lettura.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓.
Verifica interattiva GUI (`npm run desktop`: cestinazione singola e bulk, conferma
senza motivo bloccata, sparizione da elenco/Dashboard, comparsa nel Cestino con data e
motivo, evento storico, banner sul dettaglio cestinato) da completare manualmente.

---

### 2026-06-26 — S8.4: Anzianità + stato vuoto e Vedi pratiche — **E8 (Dashboard) COMPLETATA**

**Nessuna modifica schema, nessuna migrazione.** Storia di sola lettura (nessuna
mutazione, nessun `HistoryEvent`). Riuso del calcolo `daysSinceDeposit` condiviso
e della query candidati degli alert (CLAUDE.md regola 4: niente duplicazioni).

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `src/features/dashboard/AgingSection.tsx` | Sezione «Pratiche più vecchie»: lista delle top-5 pratiche aperte per giorni da deposito; ogni riga = codice istanza (link al dettaglio) + nome + fase + «N giorni dalla data deposito»; loading/empty/error; empty «Nessuna pratica aperta con data deposito.» |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/modules/dashboard/repository.ts` | `findActivePracticesForAlerts`→`findActiveOpenPracticesWithDeposit` e tipo `AlertCandidateRow`→`OpenPracticeRow` (ora condivisi da alert+anzianità); query invariata (`isTrashed=false AND phases.isFinal=false`) |
| `main/modules/dashboard/service.ts` | Import aggiornati; nuova `getDashboardAging(limit=5)`: `daysSinceDeposit` per riga, scarta i `null`, ordina per giorni desc, prende i primi N; `getDashboardAlerts` usa la query rinominata |
| `main/modules/dashboard/controller.ts` | Handler `DASHBOARD_AGING` (nessun input) |
| `main/preload.ts` | `dashboard.aging` nel contextBridge |
| `shared/ipc.ts` | Canale `DASHBOARD_AGING`; tipi `DashboardAgingItem`/`DashboardAgingResponse`; `LexFlowApi.dashboard.aging` |
| `src/api/dashboard.ts` | Client `aging()` |
| `src/features/dashboard/useDashboard.ts` | `useDashboardAging` (queryKey `['dashboard','aging']`, già coperta dall'invalidazione `['dashboard']`) |
| `src/features/dashboard/PhaseCountCards.tsx` | `PhaseCard` ora è un `Link` a `/pratiche?phaseId=…` con affordance «Vedi pratiche →» |
| `src/pages/DashboardPage.tsx` | Stato vuoto archivio unico (gate su `phaseCounts`): blocco «Archivio vuoto…» + azione «Crea una nuova pratica» (→ /pratiche); altrimenti Avvisi + Anzianità + Card per fase; loading/error a livello pagina |
| `src/features/practices/practiceFilters.ts` | Helper puro `filtersFromSearchParams(params)` (legge `phaseId`/`collaboratoreId`/`professionistaId` numerici) + `parseNumericParam` |
| `src/pages/PratichePage.tsx` | `useSearchParams`; filtri inizializzati una volta da `filtersFromSearchParams` (deep-link); barra filtri invariata |
| `docs/00-backlog-mvp.md` | S8.4 AC esplicitati (anzianità top-5, stato vuoto unico con azione, deep-link `?phaseId=`) |

**Invarianti / decisioni:**
1. **Anzianità senza soglia:** mostra le più vecchie a prescindere da 30/60/90
   (a differenza degli alert S8.2); pratiche senza data deposito escluse (non
   ordinabili per età), nessun `NaN`. I giorni coincidono col «Ferma da N giorni»
   dell'alert per la stessa pratica (calcolo condiviso).
2. **Esclusioni** identiche agli alert (cestino + fasi finali), a livello SQL,
   grazie alla query condivisa.
3. **Stato vuoto unico:** quando nessuna fase ha pratiche attive, un solo blocco
   con azione; le sezioni non vengono renderizzate (niente vuoti duplicati). Le
   empty interne delle sezioni restano come difesa ma non compaiono.
4. **Deep-link via query string** (`?phaseId=`): parsing in un punto unico,
   estendibile; i filtri restano pienamente modificabili/azzerabili.
5. **Freschezza:** `['dashboard']` già invalidato su create/executeTransition →
   copre `['dashboard','aging']`, nessuna modifica in `usePractices.ts`.

**Confine di storia:** card «documenti mancanti» in Dashboard → futuro (non in
S8.4); deep-link su altri filtri oltre la fase → estendibile ma non richiesto ora.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓.
Verifica interattiva GUI (`npm run desktop`: top-5 anzianità coerenti con gli
alert, click card per fase → elenco filtrato, archivio vuoto con azione, pratica
senza data deposito esclusa) da completare manualmente.

---

### 2026-06-26 — S8.3: Giorni dalla data deposito — **E8 (Dashboard)**

**Renderer-only + dedup. Nessuna modifica schema, nessuna migrazione, nessun
nuovo canale IPC.** Il calcolo dell'anzianità da deposito (prima privato nel
service alert di S8.2) è estratto in un modulo condiviso e riusato da entrambi i
lati (CLAUDE.md regola 4: niente duplicazioni).

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `shared/giorniDeposito.ts` | Funzione pura `daysSinceDeposit(dataDeposito): number \| null` + costante `MS_PER_DAY`. Giorni interi ≥ 0 tra oggi (data locale) e la data deposito ISO; `null` se assente/non parsabile. Fonte di verità unica per alert (S8.2) e display (S8.3). |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/modules/dashboard/service.ts` | Rimossa la `daysSinceDeposit` locale e la costante `MS_PER_DAY`; ora importate da `shared/giorniDeposito`. Comportamento alert S8.2 invariato. |
| `src/pages/DettaglioPraticaPage.tsx` | Costante `DEPOSITO_ASSENTE`; helper `formatGiorniDeposito` (riusa l'helper condiviso); nuovo `Field` «Giorni dalla data deposito» in «Dati generali»; `Field.isAbsent` esteso a `DEPOSITO_ASSENTE` (muted/italic); il `Field` «Data deposito» riusa la costante (assente ora reso muted, coerente con il pattern). |
| `docs/00-backlog-mvp.md` | S8.3 AC esplicitati (dettaglio pratica, `null`→«Data deposito non presente», nessun NaN, calcolo condiviso; aggregati/«Vedi pratiche» → S8.4). |

**Invarianti / decisioni:**
1. **Collocazione**: metrica per-pratica nel dettaglio (sezione «Dati generali»),
   non sulla Dashboard (decisione utente). L'anzianità aggregata resta S8.4.
2. **Calcolo unico**: `daysSinceDeposit` condiviso → il numero nel dettaglio
   coincide con il «Ferma da N giorni» dell'alert per la stessa pratica.
3. **Assenza**: data deposito mancante/non parsabile → «Data deposito non
   presente» (muted), mai `NaN`/`undefined`.

**Confine di storia:** card anzianità aggregata, stato vuoto archivio con azione
e «Vedi pratiche» → Pratiche filtrate restano **S8.4**.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓.
Verifica interattiva GUI (`npm run desktop`: pratica con/senza data deposito,
coerenza col conteggio dell'alert, nessun NaN) da completare manualmente.

---

### 2026-06-26 — S8.2: Alert aggregato per pratica — **E8 (Dashboard)**

**Nessuna modifica schema, nessuna migrazione.** Sola lettura aggregata su
`practices`+`phases`. Logica di severità/motivazioni **pura** nel service (layer
business); il repository fa solo la query.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `src/features/dashboard/AlertsSection.tsx` | Sezione «Avvisi»: un box per pratica, bordo sinistro col token semantico di severità, codice istanza link al dettaglio (`/pratiche/:id`), fase corrente, elenco motivazioni; loading/empty/error; empty «Nessun avviso. Tutte le pratiche attive sono nei tempi.» |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | Canale `DASHBOARD_ALERTS`; tipi `AlertSeverity`/`DashboardAlert`/`DashboardAlertsResponse`; `LexFlowApi.dashboard.alerts()` |
| `main/modules/dashboard/repository.ts` | `findActivePracticesForAlerts`: `innerJoin practices→phases`, `where isTrashed=false AND phases.isFinal=false`; tipo `AlertCandidateRow`. Solo lettura |
| `main/modules/dashboard/service.ts` | `getDashboardAlerts` + helper puri `daysSinceDeposit`/`severityForDays`/`buildReasons`/`toAlert` e `SEVERITY_RANK`; filtro severità `null`, ordinamento severità→giorni desc |
| `main/modules/dashboard/controller.ts` | Handler `DASHBOARD_ALERTS` (nessun input) |
| `main/preload.ts` | `dashboard.alerts` nel contextBridge |
| `src/api/dashboard.ts` | Client `alerts()` |
| `src/features/dashboard/useDashboard.ts` | `useDashboardAlerts` (queryKey `['dashboard','alerts']`) |
| `src/pages/DashboardPage.tsx` | `<AlertsSection>` sopra le card; titolo «Pratiche per fase»; sottotitolo «Centro di controllo…» |
| `docs/00-backlog-mvp.md` | S8.2 AC esplicitati (soglie `>`, severità da giorni, motivazioni aggregate, esclusioni, ordinamento, cliccabile) |

**Invarianti / decisioni:**
1. **Severità = unico driver della comparsa del box**, dai giorni da deposito:
   `> 90` rosso, `> 60` arancione, `> 30` giallo (strettamente maggiori). `≤ 30`
   o `dataDeposito` assente/non parsabile → nessun box.
2. **dataDeposito assente** non genera alert in S8.2; il messaggio «Data deposito
   non presente» è perimetro S8.3.
3. **Motivazioni aggregate**: sempre «Ferma da N giorni dalla data deposito»; più,
   per **category canonica** `decree_received`, «Decreto ricevuto ma non ancora
   inviato a SCP». Le contestuali non alzano la severità.
4. **Esclusioni**: cestino (`isTrashed=false`) e **fasi finali** (`phases.isFinal=false`).
5. **Colori semantici fissi** dai token `--color-warning-yellow|orange|red`
   (CLAUDE.md regola 8), già definiti in `global.css`.
6. **Freschezza**: `['dashboard']` è già invalidato su create/executeTransition →
   copre `['dashboard','alerts']`. Il passare dei giorni si riflette a query/refetch/
   riavvio (nessun timer introdotto).
7. Layer rispettati: query solo nel repository; nessun `any`.

**Confine di storia:** display per-pratica «Giorni dalla data deposito: X» / «Data
deposito non presente» → S8.3; card anzianità e «Vedi pratiche» con filtro coerente
→ S8.4; alert nell'intestazione del dettaglio pratica → riuso futuro; card
«documenti mancanti» → futuro.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓.
Verifica interattiva GUI (`npm run desktop`: box per severità 30/60/90, doppia
motivazione in `decree_received`, esclusione cestino/fasi finali, empty state,
aggiornamento dopo avanzamento) da completare manualmente.

---

### 2026-06-26 — S8.1: Card per fase dinamiche — **apre E8 (Dashboard)**

**Nessuna modifica schema, nessuna migrazione.** Sola lettura aggregata su
`practices`+`phases`. Nuovo modulo `dashboard` come casa per le storie E8 successive
(alert/anzianità/documenti mancanti).

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/modules/dashboard/repository.ts` | `findActivePhaseCounts`: `count(practices.id)` con `innerJoin practices→phases`, `where isTrashed=false`, `groupBy phases.id`, `orderBy phases.order`. L'inner join + group esclude le fasi senza pratiche attive |
| `main/modules/dashboard/service.ts` | `getDashboardPhaseCounts`: pass-through tipizzato al tipo condiviso |
| `main/modules/dashboard/controller.ts` | `registerDashboardHandlers`: handler `dashboard:phaseCounts` senza input |
| `src/api/dashboard.ts` | Client renderer `window.api.dashboard.phaseCounts()` |
| `src/features/dashboard/useDashboard.ts` | `useDashboardPhaseCounts` (queryKey `['dashboard','phaseCounts']`) |
| `src/features/dashboard/PhaseCountCards.tsx` | Griglia card (conteggio + nome fase); loading/empty/error; stato vuoto «Archivio vuoto…» (testo da `06-ui-ux.md`); card non cliccabili (deep-link = S8.4) |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | Canale `DASHBOARD_PHASE_COUNTS`; tipi `DashboardPhaseCount`/`DashboardPhaseCountsResponse`; namespace `LexFlowApi.dashboard` |
| `main/preload.ts` | Namespace `dashboard: { phaseCounts }` nel contextBridge |
| `main/server.ts` | `registerDashboardHandlers()` nel bootstrap |
| `src/pages/DashboardPage.tsx` | Placeholder → intestazione «Dashboard» + `<PhaseCountCards>` |
| `src/features/practices/usePractices.ts` | Invalidazione `['dashboard']` negli `onSuccess` di `useCreatePractice` e `useExecuteTransition` (AC «avanzamento aggiorna i conteggi») |

**Invarianti / decisioni:**
1. **Cestino escluso** a livello di query (`isTrashed=false`).
2. **Card dinamiche:** solo fasi con ≥1 pratica attiva (inner join + group), ordinate per `phases.order`.
3. **Freschezza:** create/executeTransition invalidano `['dashboard']`; update non cambia fase → non invalida.
4. Layer rispettati: query solo nel repository; nessun `any`.

**Confine di storia:** alert aggregati 30/60/90 → S8.2; giorni da deposito → S8.3; anzianità + stato-vuoto-archivio con azione + «Vedi pratiche» (deep-link a Pratiche filtrate) → S8.4.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓. Verifica interattiva GUI (`npm run desktop`: card popolate, conteggi corretti dopo avanzamento/creazione, stato vuoto) da completare manualmente.

---

### 2026-06-25 — S7.1: Documenti decreto+fattura — **E7 (Documenti) COMPLETATA**

**Migrazione DB:** incrementale `drizzle/0007_abandoned_blur.sql` (`CREATE TABLE documents`,
8 colonne, 2 FK). Non distruttiva, nessun reset. Boot verificato: migrazione applicata,
tabella `documents` presente nel DB dev.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/database/schema/documents.ts` | Schema Drizzle `documents`: practiceId (FK), transitionRecordId (FK nullable, non popolato), kind, filePath (relativo alla radice documenti), originalName, metadata (JSON), createdAt |
| `main/modules/documents/repository.ts` | `findPracticeRefForDocs`, `insertDocument`, `findDocumentsByPractice`, `findDocumentByKind`, `findDocumentById`, `deleteDocumentRow`, `insertHistoryEvent` (locale) |
| `main/modules/documents/service.ts` | `getDocumentsRoot`/`resolveDocumentPath`; `uploadDocument` (dialog nativo → copia → replace in transazione → unlink vecchio file + HistoryEvent), `listDocuments`, `deleteDocument`, `openDocument` (shell.openPath); guard cestino |
| `main/modules/documents/controller.ts` | `registerDocumentsHandlers`: 4 handler IPC con zod; finestra parente del dialog via `BrowserWindow.fromWebContents(event.sender)` |
| `src/api/documents.ts` | Client renderer `window.api.documents.*` |
| `src/features/documents/useDocuments.ts` | TanStack Query: `useDocuments`, `useUploadDocument`, `useDeleteDocument` (invalidano `['documents', id]` + `['practice', id]`) |
| `src/features/documents/DocumentsSection.tsx` | Due righe (Decreto/Fattura): presente → nome+data+size + [Apri][Sostituisci][Elimina]; assente → «Non presente» + [Carica]; cestinata → sola lettura; loading/empty/error |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/database/schema/index.ts` | `export * from './documents'` |
| `main/server.ts` | `registerDocumentsHandlers()` in bootstrap |
| `main/preload.ts` | Namespace `documents: { listByPractice, upload, delete, open }` |
| `shared/ipc.ts` | 4 canali `DOCUMENTS_*`; tipi `DocumentKind`/`DOCUMENT_KINDS`/`DocumentItem` + input/response; esteso `LexFlowApi.documents` |
| `src/pages/DettaglioPraticaPage.tsx` | Stub «Documenti (E7)» sostituito da `<DocumentsSection>` |
| `docs/02-data-model.md` | §Document: `phaseRecordId`→`transitionRecordId`, `filePath` relativo, kind MVP, persistenza al cestino |
| `docs/00-backlog-mvp.md` | S7.1 AC esplicitati (dialog nativo, path relativo, sostituzione, evento, guard cestino) |

**Invarianti / decisioni:**
1. **Upload via file dialog nativo nel main** (no byte sul bridge, no filesystem nel renderer). Annullamento → `{ canceled: true }`, nessun errore.
2. **Radice documenti** = `app.getPath('userData')/documenti/`; `filePath` salvato **relativo** (`<codiceIstanza>/<filename>`), risolto a runtime → portabile per backup (E11.3) e percorso dati configurabile (E11.2).
3. **Sostituzione per kind**: un solo decreto e una sola fattura. Ordine: copia nuovo file → transazione DB (delete vecchia riga + insert + HistoryEvent) → unlink vecchio file fisico **dopo** il commit (best-effort). Le operazioni filesystem stanno **fuori** dalla transazione SQLite.
4. **Guard cestino**: upload/elimina bloccati su pratica `isTrashed` (`ValidationError`); lista/apertura sempre consentite → i documenti **sopravvivono** a cestino+ripristino (file mai toccati alla cestinazione).
5. **HistoryEvent** su ogni operazione (`document_added`/`document_replaced`/`document_removed`), `documentId` nel payload.
6. `kind` vincolato a `decreto|fattura` lato zod; colonna text libera per kind futuri (`pec|altro`).

**Confine di storia:** alert/aggregati «documenti mancanti» in Dashboard → E8; inclusione documenti in export/backup → E9.1/E11.3; collegamento esplicito al `transitionRecord` e kind `pec|altro` → non ora.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (boot pulito, migrazione 0007 applicata, tabella `documents` verificata nel DB dev). Verifica interattiva GUI (upload/sostituzione/eliminazione/apertura del decreto e della fattura) da completare manualmente.

---

### 2026-06-25 — S6.2: Differenze calcolate — **E6 (Importi) COMPLETATA**

**Renderer-only. Nessuna modifica schema, nessuna migrazione.** Valori derivati al
volo dai quattro importi (non persistiti, vedi `02-data-model.md` §Calcoli derivati).

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `src/features/practices/importoCalc.ts` | Helper puro `computeImportoDifferences`: richiesto−concesso, % riduzione = (richiesto−concesso)/richiesto×100, concesso−fatturato, fatturato−liquidato, concesso−liquidato. `null` se un operando manca/non finito; % `null` anche se richiesto=0 (no div/0). |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `src/pages/DettaglioPraticaPage.tsx` | Costante `NOT_CALCULABLE`; `formatImportoCalc`/`formatPercentuale`; `Field` reso muted anche per «Non calcolabile»; componente `ImportiDifferences` (sottosezione «Differenze» nella sezione Importi) |
| `docs/00-backlog-mvp.md` | S6.2: formule esplicitate + AC (nessun NaN, mostrate nel dettaglio) |

**Regole / decisioni:**
1. Calcoli **non persistiti**: derivati in render dai 4 importi della pratica.
2. Operando mancante → `null` → «Non calcolabile». **% riduzione** anche con `richiesto=0` → «Non calcolabile» (evita NaN/Infinity).
3. Le differenze possono essere negative (formattate con segno in valuta).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓. Verifica interattiva GUI (compilazione importi via transizioni → differenze coerenti) da completare manualmente.

---

### 2026-06-25 — S6.1: Quattro importi (denormalizzazione da transizione)

**Decisione di prodotto (utente):** concesso/fatturato/liquidato **non** si inseriscono a
mano sulla pratica. Si compilano nei campi `importo` delle transizioni del workflow; la
**fonte di verità** è `TransitionRecord.values`. Il service li **denormalizza** su 3 colonne
pratica (cache derivata, non editabili in Modifica pratica) tramite una **mappatura esplicita
field-key→colonna (3 voci)**, non un motore generico. Differenze calcolate (S6.2) separate.

**Migrazione DB:** incrementale `drizzle/0006_vengeful_rick_jones.sql` (ALTER TABLE ADD COLUMN
×3 su `practices`). Nessun reset — dati dev conservati. Boot verificato: migrazione applicata,
3 `field_defs` importo seminati sulle transizioni corrette, 3 colonne presenti nel DB dev.

**Mappatura (il contratto):**

| Transizione (fromKey, buttonLabel) | Field key | Colonna |
| --- | --- | --- |
| `in_attesa_decreto`, «Registra decreto» | `importo_concesso` | `importoConcesso` |
| `decreto_ricevuto`, «Registra invio a SCP» | `importo_fatturato` | `importoFatturato` |
| `in_attesa_liquidazione_scp`, «Registra liquidazione» | `importo_liquidato` | `importoLiquidato` |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/database/schema/practices.ts` | 3 colonne `real` nullable `importoConcesso/Fatturato/Liquidato` |
| `main/database/seed.ts` | `SEED_IMPORTO_FIELDS` + step 3b: insert idempotente (select-then-insert) dei 3 campi `importo` su (fromPhaseId, buttonLabel) |
| `main/modules/practices/repository.ts` | `updatePracticeImporti` + tipo `ImportiUpdate` (aggiorna solo le colonne presenti + `updatedAt`, no bump version) |
| `main/modules/practices/service.ts` | costante `IMPORTO_FIELD_TO_COLUMN` + helper `deriveImportiUpdate`; chiamata in `executeTransition` dentro la transazione dopo `insertTransitionRecord`; mapping dei 3 importi in `getPracticeDetail` |
| `shared/ipc.ts` | `PracticeDetail`: `importoConcesso/Fatturato/Liquidato: number \| null` |
| `src/pages/DettaglioPraticaPage.tsx` | sezione Importi: i 3 segnaposto `ABSENT` → `formatImporto(...)` |
| `docs/02-data-model.md` | 3 colonne denormalizzate in *Practice* + tabella mappatura in *TransitionRecord* |
| `docs/03-workflow-engine.md` | §Ciclo di avanzamento: denormalizzazione importi esplicitata |
| `docs/00-backlog-mvp.md` | S6.1 riscritta (inserimento via transizione, denormalizzato, AC) |

**Invarianti / regole:**
1. Fonte di verità = `TransitionRecord.values`; le colonne pratica sono **cache derivata**.
2. Denormalizzazione solo per valori **numerici finiti**; valore vuoto/non numerico → colonna invariata (nessuna cancellazione via empty).
3. Avviene **dentro la transazione** di `executeTransition`: coerente o rollback con record/evento.
4. I 3 campi seminati sono `required=false` (non bloccano flussi/guard, non forzano l'inserimento).
5. `ModificaPraticaModal` invariato: le 3 colonne non sono editabili a mano (single source of truth).

**Confine di storia:** le **differenze calcolate** (richiesto−concesso, % riduzione, concesso−fatturato, fatturato−liquidato, concesso−liquidato) con «Non calcolabile» sono **S6.2**. Estensione di tabella/filtri elenco agli importi denormalizzati: fuori perimetro S6.1.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (boot pulito, migrazione 0006, 3 colonne + 3 field_defs verificati nel DB dev). Verifica interattiva GUI (compilazione importo in transizione → comparsa nel dettaglio) da completare manualmente.

---

### 2026-06-25 — S4.3: Modifica pratica + storico — **E4 (Creazione/modifica pratica) COMPLETATA**

**Nessuna modifica schema, nessuna migrazione.** Editing dei soli dati generali su
colonne esistenti; `version` incrementato come in `advancePractice`.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `src/features/practices/practiceFormStyles.ts` | Costanti di stile inline condivise dai modali di pratica (estratte da `NuovaPraticaModal` per evitarne la duplicazione) + `readonlyInputStyle` |
| `src/features/practices/ModificaPraticaModal.tsx` | Modale di modifica: campi pre-riempiti dalla pratica, codice istanza read-only, validazione zod (dataUdienza), submit via `useUpdatePractice`; riusa `DynamicField`/`PecBlock`/`getMenuOptions` |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | Canale `PRACTICES_UPDATE`; tipi `UpdatePracticeInput`/`UpdatePracticeResponse`; esteso `LexFlowApi.practices` |
| `main/modules/practices/repository.ts` | `findPracticeForEdit` (set editabili + isTrashed), `updatePracticeFields` (version++), `deletePecDepositoRecipients` |
| `main/modules/practices/service.ts` | `updatePractice`: diff campo-per-campo in transazione, normalizzazione, `HistoryEvent` `updated` solo se `changed`; helper `normStr`/`stableStringify` |
| `main/modules/practices/controller.ts` | `updatePracticeSchema` (zod) + handler `PRACTICES_UPDATE` |
| `main/preload.ts` | Bridge `practices.updatePractice` |
| `src/api/practices.ts` | Client `updatePractice` |
| `src/features/practices/usePractices.ts` | Hook `useUpdatePractice` (invalida `['practice', id]`, `['practices']`) |
| `src/features/practices/NuovaPraticaModal.tsx` | Stili inline ora importati da `practiceFormStyles.ts` (nessun cambio funzionale → S4.2 invariata) |
| `src/pages/DettaglioPraticaPage.tsx` | Pulsante «Modifica» (nascosto se cestinata) + montaggio `ModificaPraticaModal` |
| `docs/00-backlog-mvp.md` | AC di S4.3 esplicitati (campi editabili, codice/fase immutabili, evento `updated`) |

**Invarianti / decisioni:**
1. **Editabili:** nome istanza, soggetti, tipologia/competenza/autorità, date udienza/deposito, modalità deposito, importo richiesto, note, campi generali configurabili, PEC deposito. **Non editabili da S4.3:** `codiceIstanza` (identità/path documenti, read-only) e fase corrente (si muove solo via transizioni, E5).
2. **«Modifica rilevante»** = qualsiasi variazione di un campo editabile. Un solo `HistoryEvent` type `updated`, `note` = «Modificati: …», `payload` = `{ changes: [{label, from, to}] }`. Nessun campo cambiato → nessun evento, `changed=false`, nessun errore.
3. `customValues` confrontato con stringify stabile (chiavi ordinate); PEC deposito confrontata come insieme ordinato e sostituita integralmente (`contesto='deposito'`).
4. Guard pratica nel cestino: modifica rifiutata (`ValidationError`), coerente con `executeTransition`.
5. `nomeIstanza` non svuotabile: se vuoto, si mantiene il valore corrente. `dataUdienza` resta obbligatoria; modificarla non rigenera il codice.

**Confine di storia:** i 3 importi concesso/fatturato/liquidato (colonne + differenze) restano **E6**.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` da verificare interattivamente.

---

### 2026-06-25 — S3.4: Ordinamento + selezione multipla — **E3 (Elenco e ricerca) COMPLETATA**

**Nessuna modifica schema, nessuna migrazione.** Solo `PraticheTable.tsx`
(renderer). Stato locale di ordinamento e selezione; tutti gli hook dichiarati
prima degli early-return.

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `src/features/practices/PraticheTable.tsx` | Ordinamento per colonna (`SortColumn`/`SortDir`, `comparePractices`, `SortHeader` con indicatore ▲/▼); selezione multipla (`selectedIds: Set`, checkbox per riga + "seleziona tutto"); toolbar conteggio selezionate + "Deseleziona tutto" |

**Regole / decisioni:**
1. **Ordinamento:** click sull'intestazione ordina; ri-click inverte la direzione; cambio colonna riparte da `asc`. Valori `null` sempre in fondo. Confronto: numerico per gli importi, `localeCompare('it', {numeric:true})` per le stringhe (ordinamento naturale del codice istanza). Senza colonna attiva resta l'ordine backend (`createdAt` desc).
2. **Selezione limitata al filtrato:** le righe considerate selezionate sono l'intersezione tra `selectedIds` e le righe visibili (filtrate+ordinate); "seleziona tutto" agisce solo sul filtrato corrente; lo stato `indeterminate` riflette la selezione parziale. Nessun `set-state-in-effect`: la selezione effettiva è derivata in render.
3. **Azioni bulk:** la selezione è il meccanismo; le operazioni di massa effettive (es. sposta nel cestino) arriveranno con E10. Per ora la toolbar mostra conteggio + deseleziona.

**Confine di storia:** E3 è completa. Prossima epica per ordine di costruzione: E6 (Importi) / E7 (Documenti).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` da verificare interattivamente.

---

### 2026-06-25 — S3.3: Filtri base

**Nessuna modifica schema, nessuna migrazione.** Filtri lato renderer
sull'elenco già caricato/cachato, combinabili tra loro e con la ricerca
globale (S3.2). Le opzioni dei menu (fase/collaboratore/professionista) sono
derivate dalle pratiche presenti — nessuna query aggiuntiva, nessun filtro che
produrrebbe zero risultati.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `src/features/practices/practiceFilters.ts` | Tipo `PracticeFilters`, `emptyFilters`, `hasActiveFilters`, predicato puro `matchesFilters`, helper di derivazione opzioni (`derivePhaseOptions`/`deriveCollaboratoreOptions`/`deriveProfessionistaOptions` con dedup + sort `it`) |
| `src/features/practices/PraticheFilters.tsx` | Barra filtri: select fase/collaboratore/professionista, range data deposito (da/a), range importo richiesto (min/max), pulsante «Azzera filtri» (disabilitato se nessun filtro attivo) |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `src/features/practices/PraticheTable.tsx` | Prop `filters`; filtro combinato `matchesFilters(p) && match ricerca`; stato vuoto-filtrato generalizzato a ricerca+filtri |
| `src/pages/PratichePage.tsx` | Stato `filters`, render `<PraticheFilters>`, `filters` passato alla tabella |

**Regole / decisioni:**
1. Filtri combinabili in AND; ciascun campo `null` = filtro inattivo.
2. Date ISO confrontate lessicograficamente; pratica con data/importo mancante esclusa quando il relativo filtro è attivo.
3. **Decisione di prodotto:** il filtro data opera sulla **data deposito** (data operativa cardine del dominio: anzianità/alert S8). Modificabile su richiesta.
4. **Fuori perimetro:** importi concesso/fatturato/liquidato (E6, non ancora denormalizzati sulla pratica) → filtro importo limitato a `importoRichiesto`; numeri di procedimento fuori MVP.

**Confine di storia:** S3.4 (ordinamento colonne + selezione multipla limitata al filtrato) resta storia separata successiva.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` da verificare interattivamente.

---

### 2026-06-25 — S3.2: Ricerca globale

**Nessuna modifica schema, nessuna migrazione.** Filtro lato renderer
sull'elenco già caricato/cachato da `useActivePractices`: ricerca istantanea,
nessun IPC per battuta, nessuna business logic nei layer main (filtro di
presentazione). Unico tocco backend: esposizione del campo `note` nell'elenco.

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | Aggiunto `note: string \| null` a `PracticeListItem` |
| `main/modules/practices/repository.ts` | `findAllActivePractices`: `note` aggiunto alla `select(...)` e al mapping |
| `src/features/practices/PraticheTable.tsx` | Prop `searchTerm`; helper puri `normalizeForSearch` (lowercase + NFD senza diacritici) e `searchableBlob` (codice, nome, denominazioni soggetti, autorità, note); filtro `includes`; stato **filtrato-vuoto** distinto da quello «Nessuna pratica attiva» |
| `src/pages/PratichePage.tsx` | Stato `search`, `<input type="search">` con pulsante "✕" di azzeramento; `searchTerm` passato alla tabella |

**Regole / invarianti:**
1. Ricerca **case-insensitive e accent-insensitive** (es. "AUTORITA" trova "Autorità").
2. Campi cercabili: codice istanza, nome istanza, denominazione collaboratore/professionista, autorità giudiziaria, note.
3. Termine vuoto → elenco completo; termine senza match → stato filtrato-vuoto dedicato.
4. **Fuori perimetro:** numeri di procedimento multipli (fuori MVP, nessuna colonna in `practices`).

**Confine di storia:** S3.3 (filtri fase/soggetti/date/importi) e S3.4 (ordinamento + selezione multipla) restano storie separate successive.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` da verificare interattivamente.

---

### 2026-06-25 — S5.4: Guard di coerenza degli stati — **E5 (Workflow operativo) COMPLETATA**

**Nessuna modifica schema, nessuna migrazione.** Solo lettura di `history_events` join `phases`.

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/modules/practices/repository.ts` | Nuova `findReachedPhaseCategories(practiceId)`: `selectDistinct` delle `phases.category` raggiunte dagli `HistoryEvent` (innerJoin su `toPhaseId`), `Set<string>` |
| `main/modules/practices/service.ts` | Costanti `LIQUIDATION_CATEGORY`/`REQUIRED_BEFORE_LIQUIDATION` + helper `assertLiquidationGuard`; chiamata in `executeTransition` dentro la transazione (`phaseChanged && toPhaseCategory==='liquidated'`), prima dell'insert del record |
| `docs/03-workflow-engine.md` | §"Coerenza degli stati": specificata la regola concreta del guard di liquidazione e la natura "difesa in profondità" |

**Invarianti / regole del guard:**
1. Attivo solo su destinazione `category='liquidated'` con effettivo cambio fase.
2. Richiede che la pratica abbia attraversato (via `HistoryEvent.toPhaseId`) una fase `decree_received` **e** una `awaiting_liquidation`; altrimenti `ValidationError` con elenco di ciò che manca.
3. Ragiona per **category canonica**, non per `key`: le fasi custom (`category='custom'`) non innescano il guard.
4. Controllo **dentro la transazione** → rollback (nessun `TransitionRecord`/`HistoryEvent`) se non superato.
5. `isResume` ha `toPhaseCategory=null` → mai liquidazione, nessun falso positivo.

**S5.5 (Storico/timeline):** considerata coperta da S5.1 (`TimelineSection` in `DettaglioPraticaPage`). Eventuale arricchimento con i valori compilati nelle transizioni resta TODO futuro.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (boot pulito). Verifica interattiva GUI ✓: percorso valido fino a Liquidata e percorso bloccato via transizione-scorciatoia confermati dall'utente.

### 2026-06-25 — S5.3: Form dinamico fase + salvataggio

**Migrazione DB:** incrementale `drizzle/0005_yellow_sunset_bain.sql` (`CREATE TABLE transition_records`, 8 colonne, 4 FK). Nessun reset — dati dev conservati. La colonna `pec_recipients.transition_record_id` (già presente) viene ora popolata (nessun vincolo FK aggiunto, per evitare il recreate-table di SQLite).

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/database/schema/transitionRecords.ts` | Schema Drizzle `transition_records`: practiceId, transitionId, fromPhaseId, toPhaseId (nullable, destinazione risolta), recordedAt, values (JSON keyed by fieldKey), note |
| `src/features/practices/dynamicFields.tsx` | Componenti condivisi `DynamicField` e `PecBlock` (estratti da NuovaPraticaModal): rendering campi configurabili + visibilità condizionale + blocco PEC |
| `src/features/practices/menuHelpers.ts` | Helper puri `getMenuOptions`/`getMenuOptionsBySetId` (separati dai componenti per react-refresh/only-export-components) |
| `src/features/practices/TransitionFormModal.tsx` | Modale form dinamico transizione: carica i campi `scope='transition'`, validazione client leggera (required+condizionale+pec), note, salva via `useExecuteTransition`; stati loading/empty/error |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/database/schema/index.ts` | `export * from './transitionRecords'` |
| `main/modules/practices/repository.ts` | `findPracticeCoreById`, `findTransitionForExecution` (join toPhase per category/isActive), `findActiveTransitionFields`, `findActiveMenuOptionValues`, `insertTransitionRecord`, `advancePractice` (version++ via sql), `insertPecRecipientsForTransition` |
| `main/modules/practices/service.ts` | `executeTransition` + helper `validateTransitionValues`/`isFieldVisible`/`isEmptyValue`/`extractPecAddresses`/`derivePecContesto` |
| `main/modules/practices/controller.ts` | Handler `practices:executeTransition` con schema zod |
| `shared/ipc.ts` | Canale `PRACTICES_EXECUTE_TRANSITION`; tipi `ExecuteTransitionInput`/`ExecuteTransitionResponse`; esteso `LexFlowApi.practices` |
| `main/preload.ts` | Metodo `practices.executeTransition` nel bridge |
| `src/api/practices.ts` | Client `executeTransition` |
| `src/features/practices/usePractices.ts` | Hook `useExecuteTransition` (invalida `['practice', id]`, `['practice', id, 'transitions']`, `['practices']`) |
| `src/features/practices/NuovaPraticaModal.tsx` | Rimosse le definizioni locali di `DynamicField`/`PecBlock`/helper menu; ora importate dai moduli condivisi (forma e stili invariati) |
| `src/features/practices/WorkflowActions.tsx` | Il click apre `TransitionFormModal` (rimosso il placeholder S5.3) |

**Invarianti / regole motore (docs/03-workflow-engine.md §Ciclo di avanzamento):**
1. Guard di disponibilità: transizione `isActive`, non `isAutomatic`, e `fromPhaseId === currentPhaseId` — controllo **dentro la transazione** sul currentPhaseId reale (riletto con `findPracticeCoreById`).
2. Pratica nel cestino → avanzamento bloccato.
3. Calcolo destinazione: `isResume` → torna a `previousPhaseId` (errore se assente) e azzera; toPhase `category='suspended'` → salva `previousPhaseId=current`; `toPhaseId===current` (self/ripetibile) → nessun cambio fase; altrimenti → `toPhaseId`. `toPhase` inattiva (non-resume) → errore.
4. Self/ripetibili producono `HistoryEvent` type `event` **senza** toPhase (nessun cambio fase); le altre type `phase_changed` con from/to.
5. Validazione campi lato main (fonte autorevole): campo nascosto dalla condizione **non** obbligatorio; campo `pec` obbligatorio solo se il blocco è visibile; value `menu` deve essere un'opzione attiva del set.
6. PEC dei campi transizione salvate in `TransitionRecord.values` **e** come `PecRecipient`, con contesto derivato dalla toPhase (`awaiting_liquidation`→`scp`, `deposited`→`deposito`, altrimenti `altro`). TODO: rendere il contesto configurabile sul campo `pec`.
7. `version` incrementato su avanzamento (`version = version + 1`).

**Confine di storia:** i **guard di business** (es. niente «Liquidata» senza decreto+SCP registrati) sono **S5.4**; la **denormalizzazione dei 4 importi** sulle colonne pratica è **E6** (per ora i valori vivono in `TransitionRecord.values`); l'upload file resta stub E7.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (boot pulito, migrazione 0005 applicata, tabella `transition_records` verificata nel DB dev). Verifica interattiva GUI dell'avanzamento (sollecito ripetibile, cambio fase, sospendi/riprendi, PEC condizionale) da completare manualmente.

---

### 2026-06-25 — S5.2: Pulsanti dinamici = transizioni

**Nessuna modifica schema, nessuna migrazione.** Solo lettura della configurazione workflow esistente.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `src/features/practices/WorkflowActions.tsx` | Componente: un pulsante per transizione disponibile dalla fase corrente; stati loading/empty/error; click → avviso "compilazione in S5.3" (form e salvataggio non ancora implementati) |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | Canale `PRACTICES_LIST_AVAILABLE_TRANSITIONS`; tipi `ListAvailableTransitionsInput`, `AvailableTransition`, `PracticesListAvailableTransitionsResponse`; esteso `LexFlowApi.practices` |
| `main/modules/practices/repository.ts` | `findAvailableTransitionsFromPhase(phaseId)`: transizioni `isActive && !isAutomatic` dalla fase, join `phases` per toPhaseDisplayName, ordinate per `order` |
| `main/modules/practices/service.ts` | `listAvailableTransitions({practiceId})`: NotFoundError se pratica assente; `[]` se fase finale; altrimenti mappa il repository |
| `main/modules/practices/controller.ts` | Handler IPC con schema zod `{ practiceId }` |
| `main/preload.ts` | Metodo `practices.listAvailableTransitions` nel bridge |
| `src/api/practices.ts` | Client `listAvailableTransitions` |
| `src/features/practices/usePractices.ts` | Hook `useAvailableTransitions(practiceId)` (disabilitato se id null/fase finale) |
| `src/pages/DettaglioPraticaPage.tsx` | Sezione Workflow: placeholder S5.2 sostituito da `<WorkflowActions>` |

**Invarianti:**
1. Solo transizioni `isActive && !isAutomatic` dalla `currentPhaseId`, ordinate per `order`.
2. Fase finale (`isFinal`) → nessun pulsante (la query è disabilitata lato hook e il service ritorna `[]`).
3. Nessuna fase/pulsante hard-coded: l'elenco deriva interamente dalla config workflow.

**Confine di storia:** il click sui pulsanti non avanza ancora la pratica. Form dinamico, validazione PEC condizionale, `TransitionRecord`/`HistoryEvent` e cambio fase sono **S5.3**.

**Pulizia debito lint (contestuale, su richiesta utente):** azzerati gli errori `eslint` preesistenti che rendevano `npm run lint` rosso. Interventi:
- Tipi di ritorno espliciti aggiunti: `PhaseBadge`/`PracticeRow` (`PraticheTable.tsx`), `handleCreated` (`PratichePage.tsx`), `getMenuOptions`/`getMenuOptionsBySetId`/handler/`handleSubmit` (`NuovaPraticaModal.tsx`), `findInitialPhase`/`findAutomaticTransitionFromPhase`/`findHistoryEventsByPractice`/`findAvailableTransitionsFromPhase` (`practices/repository.ts`, con interfacce `AvailableTransitionRow` e `HistoryEventListRow`).
- Anti-pattern `react-hooks/set-state-in-effect` in `NuovaPraticaModal.tsx`: l'auto-generazione di `nomeIstanza` è passata da `useEffect` a un handler `handleDataUdienzaChange` sul cambio data (stesso comportamento, nessun `setState` sincrono in effect).
- `eslint.config.mjs`: override `@typescript-eslint/no-unused-vars` con `argsIgnorePattern`/`varsIgnorePattern`/`caughtErrorsIgnorePattern: '^_'` e `ignoreRestSiblings: true`, per istituzionalizzare la convenzione underscore già in uso (es. `_ia`).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ (exit 0, intero progetto) · `npm run build` ✓

---

### 2026-06-24 — S2.1: CRUD Professionisti

**Migrazione DB:** incrementale `drizzle/0001_safe_black_bolt.sql` (`CREATE TABLE professionisti`, 11 colonne). Nessun reset — dati dev esistenti conservati.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/database/schema/professionisti.ts` | Schema Drizzle: id, nome, cognome, denominazione, codiceFiscale, email, pec, telefono, ruolo, note, isActive |
| `main/modules/anagrafiche/repository.ts` | findAllProfessionisti (ordinati per denominazione ASC), findProfessionistaById, insertProfessionista, updateProfessionistaFields, setProfessionistaIsActive |
| `main/modules/anagrafiche/service.ts` | listProfessionisti, createProfessionista, updateProfessionista, setProfessionistaActive + invarianti; TODO guard pratiche documentato |
| `main/modules/anagrafiche/controller.ts` | registerAnagraficheHandlers: 4 handler IPC con zod inline |
| `src/api/anagrafiche.ts` | Client IPC renderer (wrapper window.api.anagrafiche.*) |
| `src/features/anagrafiche/professionisti/useProfessionisti.ts` | TanStack Query: useAllProfessionisti, useCreateProfessionista, useUpdateProfessionista, useSetProfessionistaActive |
| `src/features/anagrafiche/professionisti/ProfessionistaFormModal.tsx` | Modal crea/modifica: 9 campi, denominazione auto-sync da cognome+nome (sbloccabile svuotando), isActive solo in edit |
| `src/features/anagrafiche/professionisti/ProfessionistiSection.tsx` | Tabella (denominazione, ruolo, contatti, stato, azioni), loading/empty/error, toggle attiva/disattiva con confirm |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/database/schema/index.ts` | `export * from './professionisti'` |
| `shared/ipc.ts` | 4 canali `anagrafiche:*`, tipi Professionista, `LexFlowApi.anagrafiche` |
| `main/preload.ts` | Sezione `anagrafiche:` nel contextBridge |
| `main/server.ts` | `registerAnagraficheHandlers()` |
| `src/pages/InstanceSettingsPage.tsx` | Placeholder → `<ProfessionistiSection />`; placeholder Collaboratori rimasto per S2.2 |

**Invarianti service:**
1. `nome` non vuoto → ValidationError
2. `cognome` non vuoto → ValidationError
3. `denominazione` null/vuota → generata da `${cognome} ${nome}` (validata poi)
4. `codiceFiscale` se valorizzato: `/^[A-Za-z0-9]{11}$|^[A-Za-z0-9]{16}$/` (CF 16 o PI 11) → ValidationError
5. `email` / `pec` se valorizzati: formato email base → ValidationError
6. Guard pratiche: TODO documentato (E4)

**Struttura modulo:** `main/modules/anagrafiche/` progettato per ospitare anche S2.2 Collaboratori (stesso repository/service/controller, funzioni aggiuntive).

**Verifiche:** `npm run typecheck` ✓ · `npm run build` ✓

---

### 2026-06-24 — Riconciliazione documentale post-audit (nessuna modifica al codice applicativo)

**Obiettivo:** chiudere le 10 divergenze emerse nell'audit con il principio "una informazione in un posto solo".

**A — Backlog (`00-backlog-mvp.md`):**
- Rimossa intera §2 (ridescriveva il modello dati): sostituita con rimando a `02-data-model.md` e `07-workflow-tree.md`
- Rimossa §1: eliminato riferimento a `modules/{dto,validation,types}` e a "DI via costruttore"; struttura modulo ridotta al reale `{controller,service,repository}`
- S1.1 AC: rimosso `pecEnabled` dalla lista campi (rimosso in S0.4)
- S1.3 AC: aggiornato `scope='general'|'transition'` (era `'phase'`); aggiunta lista tipi incluso `pec`
- UC4: `PhaseRecord` → `TransitionRecord`; testo allineato al modello corrente
- S5.3: `PhaseRecord` → `TransitionRecord`

**B — Architettura (`01-architecture.md`):**
- Struttura `modules/<dominio>/`: rimosso `dto.ts`, `validation.ts`, `types.ts`; aggiornata a `{controller.ts, service.ts, repository.ts}` con note reali
- Flusso IPC: "validazione zod (dto)" → "validazione zod (inline nel controller)"
- §"Pratiche elite adottate": "DI via costruttore" → descrizione reale (import diretti del repository)

**C — Convenzioni (`04-conventions.md`):**
- Service: rimossa "DI via costruttore"; sostituita con "import diretto funzioni repository" e nota deliberata di semplicità
- Controller: "valida con dto/zod" → "valida con zod (inline nel controller)"
- Tipi espliciti: `PhaseRecord` → `TransitionRecord`

**D — Workflow tree (`07-workflow-tree.md`):**
- §RIASSUNTO TECNICO: `PracticeHistory` → `HistoryEvent`

**E — Verifica anti-duplicazione:**
- Nessun residuo attivo di `pecEnabled`, `PhaseRecord` (come termine in uso), `scope='phase'`, `dto.ts/validation.ts` come struttura, `DI via costruttore` in documenti normativi. Solo presenze storiche in PROGRESS.md e ways-of-working.md (appropriate come log/esempi).
- Decisione aperta `PhaseRecord vs HistoryEvent` in PROGRESS.md: aggiornata a `TransitionRecord vs HistoryEvent` con descrizione corretta.

---

### 2026-06-24 — Intervento di documentazione e istituzionalizzazione processo (nessuna modifica al codice applicativo)

**Obiettivo:** rendere il repository l'unica fonte di verità e formalizzare il metodo di lavoro.

**File creati:**

| File | Contenuto |
| ---- | --------- |
| `docs/ways-of-working.md` | Metodo di lavoro: principio fonte di verità, processo storia-per-storia (7 passi), DoD completa, euristiche operative, policy audit di coerenza (con esempi storici), uso Plan Mode, policy revisione esterna |
| `SETUP.md` | Guida riproduzione ambiente: prerequisiti (Node 22/npm 10), npm global prefix, Claude Code CLI, GitHub CLI, clone+install, rebuild nativo (sintomo NODE_MODULE_VERSION e fix), HashRouter note, alias Drizzle→driver cifrabile, reset DB dev, percorsi userData macOS/Windows, tabella script npm |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `CLAUDE.md` | Aggiunta regola 13 (repository = unica fonte di verità; Claude Code = autore doc tecnica); aggiunta regola 14 (gate PROGRESS.md obbligatorio); aggiunto `ways-of-working.md` all'indice doc; aggiunta sezione "Documenti radice del repository" con `SETUP.md` |

**Audit di coerenza eseguito** (vedere sezione Audit nel log del giorno):

Divergenze rilevate tra `docs/00-backlog-mvp.md` e il codice/doc aggiornati:
1. `FieldDef.scope` — backlog dice `general|phase`; codice usa `general|transition` (corretto da S1.3)
2. `Phase.pecEnabled` — backlog cita la colonna; rimossa in S0.4 (PEC guidata dai campi)
3. `Transition` — backlog non include `isRepeatable`/`isAutomatic`/`isResume`; presenti nello schema reale
4. `PhaseRecord` — backlog usa questo nome; codice e `02-data-model.md` usano `TransitionRecord`
5. `FieldDef.type` — backlog non include `pec`; aggiunto in S1.5
6. `01-architecture.md` struttura cartelle — cita `dto.ts`/`validation.ts`/`types.ts` per modulo; non esistono nel codice (validazione inline nel controller)
7. `04-conventions.md` — cita dependency injection via costruttore nei service; non implementata (service importano le funzioni repository direttamente)
8. `07-workflow-tree.md` — usa `PracticeHistory` come nome entità; codice e `02-data-model.md` usano `HistoryEvent`

**Nota:** le divergenze sono state rilevate e documentate. Nessuna corretta in questo intervento — l'utente decide cosa aggiornare e quando.

---

### 2026-06-24 — S1.5: Regola PEC condizionale — **E1 (Configurazione workflow) COMPLETATA**

**Modifiche schema (con reset DB dev):**

- `main/database/schema/fieldDefs.ts` — aggiunto `pec` all'enum dei tipi; aggiunte colonne `conditionalOnFieldId` (FK self → field_defs, nullable) e `conditionalValue` (text, nullable)
- Migrazione `drizzle/0000_hard_mockingbird.sql` eliminata, snapshot e journal resettati; `npm run db:generate` → `drizzle/0000_real_micromax.sql` (schema completo, 6 tabelle, 15 colonne field_defs)
- DB dev (`~/Library/Application Support/lexflow/lexflow.db`) eliminato e ricreato al prossimo avvio (migrazioni + seed automatici)
- Nota: con dati reali si useranno migrazioni incrementali (0001_*.sql), non il reset

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/database/schema/fieldDefs.ts` | Tipo `pec` aggiunto all'enum; `conditionalOnFieldId` (FK self) e `conditionalValue` nullable |
| `shared/ipc.ts` | `FieldType` e `FIELD_TYPES` aggiornati con `pec`; `FieldDefListItem` esteso con `conditionalOnFieldId`, `conditionalValue`, `conditionalOnFieldLabel`; `CreateFieldInput` e `UpdateFieldInput` estesi con i due nuovi campi |
| `main/modules/config/repository.ts` | `findFieldsByFilter` risolve ora `conditionalOnFieldLabel`; `updateFieldFields` accetta i due nuovi campi; aggiunta `findActiveMenuOptionByValue` |
| `main/modules/config/service.ts` | Aggiunta `assertConditionalInvariant` con tutte le invarianti; `createField` e `updateField` aggiornati (invarianti pec + condizionale); `setFieldActive` aggiornato con TODO su controllori |
| `main/modules/config/controller.ts` | `fieldTypeEnum` aggiornato con `pec`; schemi zod `createFieldSchema` e `updateFieldSchema` estesi |
| `src/features/config/fields/FieldFormModal.tsx` | Aggiunto tipo PEC con hint; nuova sezione "Visibilità condizionale" (toggle + select controllore + select valore); validazione zod coerente; prop `containerFields` aggiunta |
| `src/features/config/fields/FieldsSection.tsx` | `FIELD_TYPE_LABELS` aggiornato; badge "PEC" e "se [controllore] = [valore]" in tabella; pulsante "Blocco PEC condizionale" (convenience); `containerFields` passato al modal |

**Invarianti implementate nel service (`assertConditionalInvariant`):**

1. `type='pec'`: `menuSetId` deve essere null → ValidationError
2. `conditionalOnFieldId` e `conditionalValue`: entrambi null o entrambi valorizzati → ValidationError
3. Il campo controllore deve esistere → NotFoundError
4. Il campo controllore deve essere `type='menu'` → ValidationError
5. Il campo controllore deve essere `isActive=true` → ValidationError
6. Il campo controllore deve essere nello stesso contenitore (stesso scope e transitionId) → ValidationError
7. Il campo controllore deve avere un `menuSetId` associato → ValidationError
8. `conditionalValue` deve corrispondere al value di un'opzione attiva del menu set del controllore → ValidationError
9. Un campo non può essere controllore di sé stesso → ValidationError
10. Ciclo diretto (A condiziona B e B condiziona A) rilevato in update → ValidationError
11. TODO documentato: disattivare/modificare un campo menu usato come controllore lascia la condizione intatta; E5 tratterà il controllore inattivo come "condizione non soddisfatta"

**Pulsante convenience PEC:** incluso in `FieldsSection` (tab transizione). Cerca un campo menu nella transizione con un'opzione il cui value o label (case-insensitive) = 'pec'; se trovato crea direttamente il campo `type='pec'` "Destinatari PEC" condizionato su quel campo e valore. Se non trovato, mostra nota esplicativa. Nessuna logica di dominio cablata.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓

---

### 2026-06-24 — S1.3: CRUD Campi configurabili

**Modifiche schema (con reset DB dev):**

- `main/database/schema/fieldDefs.ts` — `scope` enum cambiato da `'general'|'phase'` → `'general'|'transition'`; colonna `phaseId` (FK→phases) sostituita da `transitionId` (FK→transitions, nullable)
- Migrazione precedente eliminata; `drizzle/meta/_journal.json` ricreato vuoto; `npm run db:generate` → `drizzle/0000_hard_mockingbird.sql` (nuovo schema completo)
- DB dev (`~/Library/Application Support/lexflow/lexflow.db`) eliminato e ricostruito al prossimo avvio (migrazioni + seed automatici)
- Seed invariato: nessun field_def nel seed; fasi/transizioni/menu standard ripopolati correttamente
- Nota: con dati reali si useranno migrazioni incrementali, non il reset

**File nuovi:**

| File                                            | Descrizione                                                                                                                                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/config/fields/useFields.ts`       | TanStack Query hooks: useFields, useCreateField, useUpdateField, useSetFieldActive, useReorderFields                                            |
| `src/features/config/fields/FieldFormModal.tsx` | Modale crea/modifica campo: label, tipo (9 opzioni), menuSetId condizionale (solo type=menu), 4 toggle, key read-only in edit                   |
| `src/features/config/fields/FieldsSection.tsx`  | Sezione campi: 2 tab (Campi generali / Campi per transizione), select transizione raggruppata per fase, tabella, riordino ▲/▼, attiva/disattiva |

**File modificati:**

| File                                 | Modifica                                                                                                                                                                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/ipc.ts`                      | 5 nuovi canali IPC; aggiunti `FieldType`, `FIELD_TYPES`, `FieldDefListItem`, `ListFieldsFilter`, `CreateFieldInput`, `UpdateFieldInput`, `SetFieldActiveInput`, `ReorderFieldsInput` e relativi response type; esteso `LexFlowApi.config` |
| `main/modules/config/repository.ts`  | Aggiunte 8 funzioni: `findFieldsByFilter`, `findFieldById`, `fieldKeyExistsInContainer`, `findMaxFieldOrderInContainer`, `insertField`, `updateFieldFields`, `setFieldIsActive`, `reorderFieldsAtomic`                                    |
| `main/modules/config/service.ts`     | Aggiunti `listFields`, `createField`, `updateField`, `setFieldActive`, `reorderFields`; helper `generateUniqueFieldKey`                                                                                                                   |
| `main/modules/config/controller.ts`  | 5 handler IPC con schemi zod (fieldTypeEnum con `as const` per preservare literal union)                                                                                                                                                  |
| `main/preload.ts`                    | Aggiornati 5 metodi config nel bridge                                                                                                                                                                                                     |
| `src/api/config.ts`                  | Aggiunti 5 metodi client IPC                                                                                                                                                                                                              |
| `src/pages/InstanceSettingsPage.tsx` | Sostituito segnaposto S1.3 con `<FieldsSection />`                                                                                                                                                                                        |

**Invarianti implementate nel service:**

1. `scope='transition'`: `transitionId` obbligatorio e deve referenziare una transizione esistente → ValidationError/NotFoundError
2. `scope='general'`: `transitionId` deve essere null → ValidationError
3. `type='menu'`: `menuSetId` obbligatorio e deve referenziare un menu set esistente → ValidationError/NotFoundError
4. `type!='menu'`: `menuSetId` deve essere null → ValidationError
5. `key` generata come slug dalla label alla creazione (con suffisso numerico per unicità); unica all'interno del container (global per general, per transitionId per transition); immutabile dopo creazione
6. TODO documentato: guard "non disattivare campo in uso da pratiche" (implementare quando esiste tabella practices)

**Delete fisica:** NON implementata (solo attiva/disattiva con `isActive`).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · avvio Electron ✓ · sezione "Campi configurabili" visibile in Impostazioni istanze ✓ · modale "Nuovo campo" aperto correttamente ✓ · tab "Campi per transizione" mostra select raggruppata per fase ✓ · (automatica) selezionabile ✓

---

### 2026-06-24 — S1.4: CRUD Menu a tendina

**File nuovi:**

| File                                                | Descrizione                                                                                                                                                    |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/config/menus/useMenus.ts`             | TanStack Query hooks: useMenuSets, useCreateMenuSet, useUpdateMenuSet, useCreateMenuOption, useUpdateMenuOption, useSetMenuOptionActive, useReorderMenuOptions |
| `src/features/config/menus/MenuSetFormModal.tsx`    | Modale crea/rinomina menu set; key auto-generata in creazione, sola lettura in modifica                                                                        |
| `src/features/config/menus/MenuOptionFormModal.tsx` | Modale crea/modifica opzione; value in sola lettura in modifica                                                                                                |
| `src/features/config/menus/MenusSection.tsx`        | Sezione menu: layout due livelli (set list + options pane), riordino ▲/▼ scoped, attiva/disattiva inline, stati loading/empty/error                            |

**File modificati:**

| File                                 | Modifica                                                                                                                                                                                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `shared/ipc.ts`                      | 7 nuovi canali IPC; aggiunti `MenuOptionListItem`, `MenuSetListItem`, tutti i tipi input/response; esteso `LexFlowApi.config`                                                                                                                                                                                |
| `main/modules/config/repository.ts`  | Aggiunte tutte le funzioni repo per menu sets e options (findAllMenuSets, findMenuSetById, menuSetKeyExists, insertMenuSet, updateMenuSetLabel, findMenuOptionById, menuOptionValueExists, findMaxMenuOptionOrder, insertMenuOption, updateMenuOptionLabel, setMenuOptionIsActive, reorderMenuOptionsAtomic) |
| `main/modules/config/service.ts`     | Aggiunti listMenuSets, createMenuSet, updateMenuSet, createMenuOption, updateMenuOption, setMenuOptionActive, reorderMenuOptions con invarianti; helper generateUniqueMenuSetKey, toMenuOptionListItem                                                                                                       |
| `main/modules/config/controller.ts`  | 7 handler IPC con schemi zod                                                                                                                                                                                                                                                                                 |
| `main/preload.ts`                    | Aggiunti 7 metodi config nel bridge                                                                                                                                                                                                                                                                          |
| `src/api/config.ts`                  | Aggiunti 7 metodi client IPC                                                                                                                                                                                                                                                                                 |
| `src/pages/InstanceSettingsPage.tsx` | Sostituito segnaposto S1.4 con `<MenusSection />`                                                                                                                                                                                                                                                            |

**Invarianti implementate nel service:**

1. `key` del set generata come slug snake_case dalla label alla creazione; immutabile (non esposta in update)
2. `key` del set univoca (generateUniqueMenuSetKey con fallback numerico)
3. `value` dell'opzione univoco dentro lo stesso set → ConflictError se duplicato
4. `value` immutabile dopo la creazione (non incluso nell'UpdateMenuOptionInput)
5. `value` non vuoto obbligatorio → ValidationError
6. TODO documentato: guard "non disattivare opzione in uso da pratiche" (implementare con tabella practices)

**Seed:** I 5 menu set standard erano già presenti nel seed (creato in S0.4). Nessuna reinserzione necessaria.

**Delete fisica:** NON implementata per set né opzioni (TODO documentato); solo attiva/disattiva per le opzioni.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · avvio Electron ✓ · 5 set standard visibili con conteggi opzioni ✓ · selezione set mostra opzioni ✓ · aggiunta opzione a `autorita_giudiziaria` ✓ · creazione nuovo set (`Test menu` → key `test_menu`) ✓ · badge "opz. attive" aggiornato in tempo reale ✓

---

### 2026-06-24 — S1.2: CRUD Transizioni

**File nuovi:**

| File                                                      | Descrizione                                                                                                                                   |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/config/transitions/useTransitions.ts`       | TanStack Query hooks: useAllTransitions, useCreateTransition, useUpdateTransition, useSetTransitionActive, useReorderTransitions              |
| `src/features/config/transitions/TransitionFormModal.tsx` | Modale crea/modifica transizione con validazione zod lato renderer; fromPhaseId readonly in edit mode                                         |
| `src/features/config/transitions/TransitionsSection.tsx`  | Sezione transizioni: elenco raggruppato per fase (header MAIUSCOLO), badge flag, riordino ▲/▼ scoped per gruppo, attiva/disattiva con confirm |

**File modificati:**

| File                                 | Modifica                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/ipc.ts`                      | 4 nuovi canali IPC; esteso `TransitionListItem` con `fromPhaseDisplayName`, `fromPhaseOrder`, `toPhaseDisplayName`; aggiunto `CreateTransitionInput`, `UpdateTransitionInput`, `SetTransitionActiveInput`, `ReorderTransitionsInput` e relativi response type; esteso `LexFlowApi.config`                                                                                                       |
| `main/modules/config/repository.ts`  | Aggiornato `findTransitions()` (ora include displayName/order da phases, ordina per `phases.order` anziché `fromPhaseId`); aggiunti `findTransitionById`, `findTransitionEnrichedById`, `findMaxTransitionOrderForPhase`, `countActiveAutomaticTransitionsForPhase`, `transitionLabelExists`, `insertTransition`, `updateTransitionFields`, `setTransitionIsActive`, `reorderTransitionsAtomic` |
| `main/modules/config/service.ts`     | Aggiunto helper privato `assertTransitionInputValid` con tutte le invarianti; aggiunti `createTransition`, `updateTransition`, `setTransitionActive`, `reorderTransitions`                                                                                                                                                                                                                      |
| `main/modules/config/controller.ts`  | Aggiunto 4 handler IPC con schemi zod                                                                                                                                                                                                                                                                                                                                                           |
| `main/preload.ts`                    | Aggiunto 4 metodi config nel bridge                                                                                                                                                                                                                                                                                                                                                             |
| `src/api/config.ts`                  | Aggiunto 4 metodi client IPC                                                                                                                                                                                                                                                                                                                                                                    |
| `src/pages/InstanceSettingsPage.tsx` | Sostituito segnaposto S1.2 con `<TransitionsSection />`                                                                                                                                                                                                                                                                                                                                         |

**Invarianti implementate nel service:**

1. `fromPhase` non può essere finale (`isFinal=true`) → ValidationError
2. `toPhase` non può essere inattiva (`isActive=false`) → ValidationError
3. `isResume=true`: `toPhaseId` deve essere null; `fromPhase` deve avere `category=suspended`; `buttonLabel` obbligatorio → ValidationError
4. `isResume=false`: `toPhaseId` obbligatorio → ValidationError
5. `isAutomatic=true && isActive=true`: max 1 automatica attiva per `fromPhase` → ConflictError
6. `isAutomatic=false`: `buttonLabel` obbligatorio → ValidationError
7. Unicità `(fromPhaseId, buttonLabel)` quando label non vuota → ConflictError (con excludeId per update)
8. `fromPhaseId == toPhaseId`: `isRepeatable` forzato a `true` automaticamente nel service

**Delete fisica:** NON implementata (TODO documentato); solo attiva/disattiva coerente con fasi.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · avvio Electron ✓ · 40 transizioni canoniche raggruppate visibili ✓ · modale crea/modifica ✓ · validazione frontend ("Seleziona la fase di partenza") ✓ · fromPhase select esclude fasi finali ✓ · badge Ripetibile/Automatica/Ripresa ✓ · label "(automatica)" per transizioni senza label ✓ · "(resta nella fase)" per self-transition ✓ · "↩ fase di provenienza" per isResume ✓

### 2026-06-24 — S1.1: Guscio applicativo + CRUD Fasi

**Dipendenze aggiunte:**

- `react-router-dom` v7 (prod) — routing HashRouter lato renderer
- `@tanstack/react-query` v5 (prod) — gestione dati asincroni e cache lato renderer

**File nuovi:**

| File                                            | Descrizione                                                                                                    |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `main/errors/AppError.ts`                       | Gerarchia errori tipizzati: AppError, NotFoundError, ConflictError, ValidationError                            |
| `src/styles/global.css`                         | CSS custom properties (tema chiaro base, colori semantici fissi, badge)                                        |
| `src/components/layout/Sidebar.tsx`             | Sidebar di navigazione con NavLink attivo e link Diagnostica IPC                                               |
| `src/components/layout/AppLayout.tsx`           | Layout root: sidebar + `<Outlet />` scrollabile                                                                |
| `src/routes/Router.tsx`                         | HashRouter con 7 route (dashboard, pratiche, report, impostazioni-istanze, impostazioni-app, cestino, dev/ipc) |
| `src/pages/PlaceholderSection.tsx`              | Componente placeholder riutilizzabile "Sezione in costruzione"                                                 |
| `src/pages/DashboardPage.tsx`                   | Placeholder Dashboard                                                                                          |
| `src/pages/PratichePage.tsx`                    | Placeholder Pratiche                                                                                           |
| `src/pages/ReportPage.tsx`                      | Placeholder Report                                                                                             |
| `src/pages/AppSettingsPage.tsx`                 | Placeholder Impostazioni app                                                                                   |
| `src/pages/CestinoPage.tsx`                     | Placeholder Cestino                                                                                            |
| `src/pages/IpcDemoPage.tsx`                     | Demo IPC spostata da PlaceholderPage (route `/dev/ipc`)                                                        |
| `src/pages/InstanceSettingsPage.tsx`            | Pagina Impostazioni istanze: sezione Fasi + segnaposto Transizioni/Campi/Menu/Anagrafiche                      |
| `src/features/config/phases/usePhases.ts`       | TanStack Query hooks: useAllPhases, useCreatePhase, useUpdatePhase, useSetPhaseActive, useReorderPhases        |
| `src/features/config/phases/PhaseFormModal.tsx` | Modale crea/modifica fase con validazione zod lato renderer                                                    |
| `src/features/config/phases/PhasesSection.tsx`  | Sezione fasi: tabella ordinata, badge, pulsanti su/giù, Attiva/Disattiva con guard inline                      |
| `src/utils/ipcError.ts`                         | Helper per estrarre il messaggio utente dagli errori IPC di Electron                                           |

**File modificati:**

| File                                | Modifica                                                                                                                                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `shared/ipc.ts`                     | Aggiunto `PhaseCategory`, `PHASE_CATEGORIES`, 5 nuovi canali IPC, tipi input/output CRUD fasi, esteso `LexFlowApi.config`                                                                                                                                          |
| `main/modules/config/repository.ts` | Aggiunto `findAllPhases`, `findPhaseById`, `findMaxOrder`, `countActiveInitialPhases`, `keyExists`, `createPhaseAtomic`, `updatePhaseAtomic`, `setPhaseIsActive`, `reorderPhasesAtomic`; rimosso explicit `.select()` da `findActivePhases` (ora usa `toListItem`) |
| `main/modules/config/service.ts`    | Aggiunto `listAllPhases`, `createPhase`, `updatePhase`, `setPhaseActive`, `reorderPhases`; helper `slugify`, `generateUniqueKey`, `assertCanDeactivate` (con TODO guard pratiche)                                                                                  |
| `main/modules/config/controller.ts` | Aggiunto 5 handler IPC con validazione zod; helper `parseOrThrow`                                                                                                                                                                                                  |
| `main/preload.ts`                   | Aggiunto 5 metodi config nel bridge contextBridge                                                                                                                                                                                                                  |
| `src/api/config.ts`                 | Aggiunto 5 metodi client IPC                                                                                                                                                                                                                                       |
| `src/App.tsx`                       | Sostituito `<PlaceholderPage />` con `<Router />`                                                                                                                                                                                                                  |
| `src/main.tsx`                      | Aggiunto `QueryClientProvider` e import `global.css`                                                                                                                                                                                                               |

**Decisioni implementative:**

- Transazioni nelle operazioni composite (`createPhaseAtomic`, `updatePhaseAtomic`, `reorderPhasesAtomic`) usando `getDb().transaction((tx) => {...})` con `tx` per garantire atomicità.
- La `key` viene generata via `slugify(displayName)` alla creazione e non è mai aggiornata in `updatePhase` (colonna `key` esclusa dal SET).
- Guard "non disattivare l'unica fase iniziale" attivo in `assertCanDeactivate`. Guard "non disattivare se usata da pratiche" lasciato come TODO documentato.
- Delete fisica delle fasi NON implementata: le FK con `transitions` e l'uso futuro nelle pratiche lo rendono rischioso. Disponibile solo attiva/disattiva.
- Messaggi di errore IPC puliti via `ipcErrorMessage()` che rimuove il prefisso "Error invoking remote method '...': ErrorClass: ".

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · avvio Electron ✓ · 13 fasi visibili in tabella ✓ · creazione fase nuova (category custom, key auto-generata) ✓ · persistenza al riavvio ✓ · guard unica fase iniziale mostra errore chiaro ✓

### 2026-06-24 — S0.4 (riallineamento): Schema canonico workflow (13 fasi, 40 transizioni)

**Motivazione:** il seed precedente modellava come fasi alcune entità che nel file canonico `docs/07-workflow-tree.md` sono transizioni/eventi (Sollecito effettuato, Integrazione richiesta/inviata, Invio a SCP, Correzione decreto richiesta, Impugnazione decreto depositata). Schema e seed riallineati al modello corretto.

**Reset DB di sviluppo:** `~/Library/Application Support/lexflow/lexflow.db` eliminato (nessun dato reale presente — solo configurazione di test). Le migrazioni Drizzle rigenerate da zero. In presenza di dati reali si useranno migrazioni incrementali, non il reset.

**Modifiche schema:**

- `phases.ts` — rimossa colonna `pecEnabled` (la PEC è guidata dai campi della transizione, non dalla fase); aggiornato enum `category` con i valori canonici: `awaiting_integration, awaiting_correction, awaiting_appeal, awaiting_integration_scp` (aggiunti) — rimosso `scp_sent` (non è una fase)
- `transitions.ts` — `toPhaseId` ora nullable (necessario per `isResume`); aggiunte colonne `isRepeatable`, `isAutomatic`, `isResume` (bool, default false); indice unico cambiato da `(fromPhaseId, toPhaseId)` → `(fromPhaseId, buttonLabel)`
- Migrazione `drizzle/0000_even_arachne.sql` eliminata; rigenerata come `drizzle/0000_youthful_power_pack.sql`

**Fasi seedate (13):** depositata, in_attesa_decreto, in_attesa_integrazione, decreto_ricevuto, in_attesa_esito_correzione, in_attesa_esito_impugnazione, in_attesa_liquidazione_scp, in_attesa_integrazione_scp, liquidata, chiusa, rifiutata, sospesa, annullata. Nessuna fase non-canonica presente.

**Transizioni seedate (40):** coprono tutti i rami del `docs/07-workflow-tree.md` inclusi solleciti ripetibili, transizione automatica depositata→in_attesa_decreto, gestione completa sospensione/ripresa (isResume, toPhaseId=null).

**Nuovo canale IPC `config:listTransitions`:**

- `main/modules/config/repository.ts` — aggiunto `findTransitions()` (join transitions→phases per fromPhaseKey; toPhaseKey risolto in memoria)
- `main/modules/config/service.ts` — aggiunto `listTransitions()`
- `main/modules/config/controller.ts` — handler `config:listTransitions`
- `shared/ipc.ts` — rimosso `pecEnabled` da `PhaseListItem`; aggiunti `CONFIG_LIST_TRANSITIONS`, `TransitionListItem`, `ConfigListTransitionsResponse`; `LexFlowApi.config` esteso con `listTransitions()`
- `main/preload.ts` — aggiunto `config.listTransitions` nel bridge
- `src/api/config.ts` — aggiunto `listTransitions()`
- `src/pages/PlaceholderPage.tsx` — mostra 13 fasi con category/isInitial/isFinal + conteggio transizioni

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · avvio Electron ✓ (13 fasi + "40 transizioni" visibili) · seed idempotente verificato (2ª esecuzione senza duplicati) ✓

---

### 2026-06-24 — S0.4 + S0.3 (parziale): Database, migrazioni, seed, config, logging

**Dipendenze aggiunte:**

- `better-sqlite3-multiple-ciphers` (prod) — driver SQLite nativo cifrabile
- `drizzle-orm` (prod) — ORM + adapter better-sqlite3 + migrator
- `zod` (prod) — validazione configurazione avvio
- `drizzle-kit` (dev) — generatore migrazioni
- `@electron/rebuild` (dev) — rebuild nativo per ABI Electron
- `@types/better-sqlite3` (dev) — tipi per il cast nel connection.ts
- `playwright-core` (dev) — driver per test UI automatizzati

**Problema risolto (adattamento adapter Drizzle):**
`drizzle-orm/better-sqlite3` fa `require('better-sqlite3')` a livello di modulo. Soluzione: in `electron.vite.config.ts`, drizzle-orm è escluso dall'esternalizzazione (`externalizeDepsPlugin({ exclude: ['drizzle-orm'] })`) e bundlato con l'alias `'better-sqlite3' → 'better-sqlite3-multiple-ciphers'`. Nel bundle finale il require punta al modulo corretto; l'interfaccia repository è invariata.

**Rebuild nativo:** `npm run rebuild` (postinstall) compila `better-sqlite3-multiple-ciphers` per l'ABI di Electron (verificato con Electron 39).

**File e cartelle create:**

- `main/utils/logger.ts` — logger strutturato (level, timestamp, action)
- `main/config/startup.ts` — validazione zod percorso dati + check scrittura
- `main/database/schema/phases.ts` — tabella phases (9 colonne, unique key)
- `main/database/schema/transitions.ts` — tabella transitions (unique fromPhaseId+toPhaseId)
- `main/database/schema/fieldDefs.ts` — tabella field_defs
- `main/database/schema/menuSets.ts` — tabella menu_sets (unique key)
- `main/database/schema/menuOptions.ts` — tabella menu_options (unique menuSetId+value)
- `main/database/schema/appSettings.ts` — tabella app_settings (riga singola)
- `main/database/schema/index.ts` — re-export schema
- `main/database/connection.ts` — apertura DB in userData, WAL+FK, cast documentato
- `main/database/migrations.ts` — applica migrazioni all'avvio (TODO packaging)
- `main/database/seed.ts` — seed idempotente: 13 fasi, transizioni complete, 5 menu set, app_settings
- `main/modules/config/repository.ts` — query fasi attive ordinate
- `main/modules/config/service.ts` — listActivePhases()
- `main/modules/config/controller.ts` — IPC handler config:listPhases
- `drizzle/0000_even_arachne.sql` — migrazione generata da drizzle-kit
- `drizzle.config.ts` — configurazione drizzle-kit
- `src/api/config.ts` — client IPC config lato renderer

**File modificati:**

- `electron.vite.config.ts` — externalizeDepsPlugin con exclude + resolve.alias
- `package.json` — script db:generate, db:migrate, rebuild, postinstall
- `shared/ipc.ts` — aggiunto CONFIG_LIST_PHASES, PhaseListItem, ConfigListPhasesResponse
- `main/preload.ts` — aggiunto config.listPhases nel bridge
- `main/server.ts` — registerConfigHandlers()
- `main/app.ts` — bootstrap DB: validateStartupConfig → initDatabase → runMigrations → runSeed
- `src/pages/PlaceholderPage.tsx` — lista fasi da IPC con loading/empty/error state

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · avvio Electron ✓ (13 fasi visibili) · lexflow.db creato in userData ✓ · seed idempotente (2ª esecuzione: 13 fasi, nessuna duplicazione) ✓

---

### 2026-06-24 — S0.4 (completamento): Seed esteso con rami post-decreto

**Motivazione:** le fasi "Correzione decreto richiesta" e "Impugnazione decreto depositata" erano menzionate nel glossario e nel workflow-engine come rami post-decreto configurabili, ma assenti nel seed iniziale.

**File modificati:**

- `main/database/seed.ts` — aggiunte 2 fasi e 12 transizioni; step 1b di normalizzazione order (idempotente via UPDATE per key)

**Fasi aggiunte (2):**

| key                    | displayName                     | category | order | pecEnabled |
| ---------------------- | ------------------------------- | -------- | ----- | ---------- |
| `correzione_decreto`   | Correzione decreto richiesta    | custom   | 8     | true       |
| `impugnazione_decreto` | Impugnazione decreto depositata | custom   | 9     | true       |

Gli order delle fasi successive sono stati riaggiustati: scp_sent→10, awaiting_liquidation→11, liquidated→12, closed→13, suspended→14, annulled→15.

**Transizioni aggiunte (12):**

- Decreto ricevuto → Correzione decreto richiesta ("Registra correzione decreto")
- Correzione decreto richiesta → Decreto ricevuto ("Registra nuovo decreto corretto")
- Correzione decreto richiesta → In attesa di decreto ("Torna in attesa di decreto")
- Correzione decreto richiesta → Sollecito effettuato ("Registra sollecito")
- Correzione decreto richiesta → Sospesa ("Sospendi pratica")
- Correzione decreto richiesta → Annullata ("Annulla pratica")
- Decreto ricevuto → Impugnazione decreto depositata ("Registra impugnazione decreto")
- Impugnazione decreto depositata → Decreto ricevuto ("Registra nuovo decreto")
- Impugnazione decreto depositata → In attesa di decreto ("Torna in attesa di decreto")
- Impugnazione decreto depositata → Sollecito effettuato ("Registra sollecito")
- Impugnazione decreto depositata → Sospesa ("Sospendi pratica")
- Impugnazione decreto depositata → Annullata ("Annulla pratica")

Nota: le transizioni → Sospesa e → Annullata dei rami post-decreto usano button label specifici ("Sospendi pratica" / "Annulla pratica") e sono gestite esplicitamente in BASE_TRANSITIONS, NON tramite NON_FINAL_KEYS_FOR_SUSPENSION (che genera le etichette generiche "Sospendi" / "Annulla").

**Decisione aperta risolta parzialmente:** "Impugnazione da Rifiutata" — applicata opzione (A): solo da Decreto ricevuto; Rifiutata resta `isFinal=true`. Allineato alla raccomandazione in PROGRESS.md Log decisioni aperte.

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · avvio Electron ✓ (15 fasi visibili, ordine corretto) · seed idempotente (2ª esecuzione: 15 fasi identiche, nessuna duplicazione) ✓

---

### 2026-06-23 — S0.1: Scaffolding Electron + React + TypeScript + electron-vite

**File e cartelle create:**

- `package.json` — dipendenze e script npm (electron-vite, React 19, TypeScript 5.9, ESLint 9)
- `electron.vite.config.ts` — configurazione electron-vite con path custom (main/ e src/)
- `tsconfig.json` / `tsconfig.node.json` / `tsconfig.web.json` — TypeScript strict con project references
- `eslint.config.mjs` — ESLint 9 flat config con @electron-toolkit/eslint-config-ts + react plugins
- `electron-builder.yml` — configurazione packaging macOS/Windows
- `shared/ipc.ts` — contratto IPC tipizzato (LexFlowApi, IPC_CHANNELS)
- `main/app.ts` — creazione BrowserWindow (contextIsolation on, nodeIntegration off)
- `main/server.ts` — bootstrap IPC handlers
- `main/preload.ts` — contextBridge che espone window.api
- `main/preload.d.ts` — estensione Window per il renderer
- `main/modules/app/controller.ts` — handler IPC app:getVersion
- `src/index.html`, `src/main.tsx`, `src/App.tsx`, `src/env.d.ts` — entry renderer
- `src/api/app.ts` — client IPC tipizzato per il renderer
- `src/pages/PlaceholderPage.tsx` — UI placeholder con "LexFlow" + versione via IPC
- Directory stub con `.gitkeep`: `main/{config,database,middlewares,errors,utils,jobs}`, `src/{components/{layout,ui},features,routes,hooks,store,context,services,types,utils,validations,assets}`

**Decisioni:**

- DB (better-sqlite3-multiple-ciphers + drizzle) non installato: rinviato a S0.4 come da istruzione.
- electron-vite usa path custom via `rollupOptions.input` con `{ index: ... }` per garantire output `out/{main,preload}/index.js`.
- Renderer root = `src/`, entry HTML = `src/index.html` (non `src/renderer/` come nel template default).
- Typecheck splittato: `typecheck:node` + `typecheck:web` con `--composite false` (consente shared/ in entrambi i tsconfig senza conflitti).
- CLAUDE.md aggiornato: descrizioni script allineate alla realtà di electron-vite (dev/desktop avviano l'intera app, non solo il renderer).

**Verifiche:** `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (finestra aperta con placeholder "LexFlow" e versione via IPC)

---

### 2026-06-24 — S2.2: CRUD Collaboratori

**Migrazione DB:** incrementale `drizzle/0002_even_alice.sql` (`CREATE TABLE collaboratori`, 7 colonne). Nessun reset — dati dev esistenti conservati.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/database/schema/collaboratori.ts` | Schema Drizzle: id, nome, cognome, denominazione, codiceInterno (nullable), note (nullable), isActive |
| `src/features/anagrafiche/collaboratori/useCollaboratori.ts` | TanStack Query: useAllCollaboratori, useCreateCollaboratore, useUpdateCollaboratore, useSetCollaboratoreActive |
| `src/features/anagrafiche/collaboratori/CollaboratoreFormModal.tsx` | Modal crea/modifica: 5 campi (cognome*, nome*, denominazione* auto-sync, codiceInterno, note), isActive solo in edit |
| `src/features/anagrafiche/collaboratori/CollaboratoriSection.tsx` | Tabella (denominazione, codice interno, stato, azioni), loading/empty/error, toggle attiva/disattiva con confirm |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/database/schema/index.ts` | `export * from './collaboratori'` |
| `shared/ipc.ts` | 4 canali `anagrafiche:*` collaboratori, tipi CollaboratoreListItem/Create/Update/SetActive, `LexFlowApi.anagrafiche` esteso |
| `main/modules/anagrafiche/repository.ts` | +5 funzioni: findAllCollaboratori (ordinati per denominazione ASC), findCollaboratoreById, insertCollaboratore, updateCollaboratoreFields, setCollaboratoreIsActive |
| `main/modules/anagrafiche/service.ts` | +4 funzioni: listCollaboratori, createCollaboratore, updateCollaboratore, setCollaboratoreActive; invarianti nome/cognome/denominazione; TODO guard pratiche documentato (E4) |
| `main/modules/anagrafiche/controller.ts` | +4 handler IPC in registerAnagraficheHandlers; zod schema collaboratori (codiceInterno max 50) |
| `main/preload.ts` | +4 metodi `anagrafiche:` collaboratori nel contextBridge |
| `src/api/anagrafiche.ts` | +4 metodi collaboratori |
| `src/pages/InstanceSettingsPage.tsx` | Placeholder "Collaboratori — in arrivo (S2.2)" → `<CollaboratoriSection />`; `comingSoonStyle` rimosso (non più usato) |

**Invarianti service:**
1. `nome` non vuoto → ValidationError
2. `cognome` non vuoto → ValidationError
3. `denominazione` null/vuota → generata da `${cognome} ${nome}`
4. `codiceInterno`: opzionale, nessun formato imposto (max 50 chars)
5. Guard pratiche: TODO documentato (E4)

**Verifiche:** `npm run typecheck` ✓ · `npm run build` ✓

---

### 2026-06-25 — S5.1: Dettaglio pratica (read-only)

**Nessuna migrazione DB** — schema invariato, solo nuove query di lettura.

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | + canale `PRACTICES_GET`; tipi `GetPracticeInput`, `PracticeDetail`, `PracticeDetailPhase`, `PracticeDetailHistoryItem`, `GetPracticeResponse`; esteso `LexFlowApi.practices` con `getPractice` |
| `main/modules/practices/repository.ts` | + `import { and }`; `PracticeDetailRow`; `findPracticeDetailById` (LEFT JOIN phases/professionisti/collaboratori); `findPhaseNameMap` (id→displayName, risolve from/to/previous senza join aliasati); `findHistoryEventsByPractice` (ordinati timestamp ASC, id ASC); `findPecDepositoAddresses` (and: practiceId + contesto='deposito') |
| `main/modules/practices/service.ts` | + `getPracticeDetail` (NotFoundError se assente; `parseCustomValues` robusto a JSON invalido; compone detail con history e PEC) |
| `main/modules/practices/controller.ts` | + handler `PRACTICES_GET` con schema zod `{ id: positive int }` |
| `main/preload.ts` | + `practices.getPractice` nel bridge |
| `src/api/practices.ts` | + `getPractice(input)` |
| `src/features/practices/usePractices.ts` | + `usePracticeDetail(id)` (queryKey `['practice', id]`, enabled se id != null); aggiunti tipi di ritorno espliciti agli hook esistenti (pulizia lint del file toccato) |
| `src/pages/DettaglioPraticaPage.tsx` | Placeholder → vista reale: helper formato (data/dataora/importo/`textOrAbsent`), `resolveCustomValue` (menu→label opzione, si_no→Sì/No, importo/data formattati), componenti `PhaseBadge`/`Section`/`FieldGrid`/`Field`, sezioni `CustomFieldsSection` e `TimelineSection`; stati loading/empty(id non valido)/error(404 "Pratica non trovata"). Campi assenti → "Non presente"; data deposito assente → "Data deposito non presente". |

**Decisioni implementative:**
- Timeline read-only inclusa già in S5.1 (i dati `HistoryEvent` esistono da S4.2). S5.5 la raffinerà.
- 4 importi: solo `importoRichiesto` reale; Concesso/Fatturato/Liquidato mostrano "Non presente" (placeholder E6).
- Pulsanti transizione, form di transizione, modifica e documenti restano a S5.2/S5.3/S4.3/E7 (placeholder espliciti in pagina).
- Risoluzione campi personalizzati nel renderer riusando `useFields({ scope: 'general' })` e `useMenuSets()` (nessuna nuova logica backend). Chiavi orfane in `customValues` (campo poi disattivato) mostrate comunque per non nascondere dati.
- `getPractice` non filtra `isTrashed` (dettaglio consultabile anche dal cestino in E10); `isTrashed` esposto nel detail per usi futuri.

**Verifiche:** `npm run typecheck` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (boot pulito: migrazioni + seed 13 fasi/40 transizioni/5 menu, IPC registrati, nessun errore runtime) · forma SQL delle 4 query nuove validata contro il DB di sviluppo reale (join e nomi colonna corretti) ✓ · `npm run lint`: i nuovi file (`DettaglioPraticaPage.tsx`, `usePractices.ts`) sono puliti; restano **15 errori lint pre-esistenti** in `NuovaPraticaModal.tsx`, `PraticheTable.tsx`, `PratichePage.tsx` (introdotti in S3.1/S4.2, che verificarono solo typecheck+build) — verificato che erano già rossi su HEAD prima di S5.1. **TODO qualità (S13):** bonificare il lint di quei 3 file (tipi di ritorno mancanti + `set-state-in-effect` in NuovaPraticaModal).

---

### 2026-06-25 — S3.1: Tabella pratiche attive

**Nessuna migrazione DB** — schema esistente, solo nuova query con JOIN.

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `src/features/practices/PraticheTable.tsx` | Tabella pratiche: 7 colonne (codice istanza link, nome, fase badge, collaboratore, professionista, data udienza, importo), stati loading/empty/error |
| `src/pages/DettaglioPraticaPage.tsx` | Placeholder route `/pratiche/:id` — usa `useParams`, mostra ID; sarà implementata in S5.1 |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `shared/ipc.ts` | + `PRACTICES_LIST` channel; + interfaccia `PracticeListItem` (16 campi); + `PracticesListResponse`; + `listPractices()` in `LexFlowApi.practices` |
| `main/modules/practices/repository.ts` | + import `desc`, `professionisti`, `collaboratori`; + `findAllActivePractices()` con LEFT JOIN a phases/professionisti/collaboratori, filtro `isTrashed=false`, ordine `createdAt DESC` |
| `main/modules/practices/service.ts` | + import `PracticesListResponse`, `findAllActivePractices`; + `listActivePractices()` |
| `main/modules/practices/controller.ts` | + import `PracticesListResponse`, `listActivePractices`; + handler IPC `practices:listPractices` |
| `main/preload.ts` | + `practices.listPractices` nel bridge |
| `src/api/practices.ts` | + `listPractices()` client IPC |
| `src/features/practices/usePractices.ts` | + import `useQuery`; + hook `useActivePractices()` con queryKey `['practices']` |
| `src/pages/PratichePage.tsx` | Placeholder div → `<PraticheTable />`; banner post-creazione rimanente (senza il testo S3.1) |
| `src/routes/Router.tsx` | + import `DettaglioPraticaPage`; + route `/pratiche/:id` |

**Decisione implementativa:**
S3.1 anticipata rispetto all'ordine backlog (E4→E5→E3) perché è prerequisito bloccante per S5.1 e S4.3: senza lista non esiste navigazione verso il dettaglio.

**Verifiche:** `npm run typecheck` ✓ · `npm run build` ✓

---

### 2026-06-25 — S4.2: Form Nuova pratica

**Nuove tabelle DB:** migrazione incrementale `drizzle/0004_same_wolfsbane.sql`.

| Tabella | Colonne |
| ------- | ------- |
| `history_events` | id, practiceId (FK→practices), timestamp, type, title, fromPhaseId (FK→phases, nullable), toPhaseId (FK→phases, nullable), note, payload (JSON) |
| `pec_recipients` | id, practiceId (FK→practices), transitionRecordId (nullable — FK futura verso transition_records in E5), contesto (deposito\|scp\|altro), indirizzo |

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/database/schema/historyEvents.ts` | Schema Drizzle `history_events` |
| `main/database/schema/pecRecipients.ts` | Schema Drizzle `pec_recipients` |
| `src/features/practices/usePractices.ts` | TanStack Query: `useCreatePractice()` con invalidazione query `['practices']` |
| `src/features/practices/NuovaPraticaModal.tsx` | Modal Nuova pratica: 6 sezioni fisse + campi custom generali dinamici + PEC deposito condizionale. Componenti `DynamicField` (tutti i tipi tranne `file`) e `PecBlock` (lista indirizzi con +/−). Preview codice istanza aggiornata live su cambio dataUdienza. Auto-gen nomeIstanza `YYYYMMDD_NOTA_SPESE`. |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/database/schema/index.ts` | + export historyEvents, pecRecipients |
| `shared/ipc.ts` | + canale `PRACTICES_CREATE`, tipi `CreatePracticeInput` / `CreatePracticeResponse`; esteso `LexFlowApi.practices` |
| `main/modules/practices/repository.ts` | + `findInitialPhase`, `findAutomaticTransitionFromPhase`, `insertPractice`, `updatePracticeCurrentPhase`, `insertHistoryEvent`, `insertPecRecipients` |
| `main/modules/practices/service.ts` | + `createPractice` (transazione atomica: genera codice inside tx, insert practice, HistoryEvent "Pratica depositata", auto-transizione → HistoryEvent "In attesa di decreto", PEC recipients) |
| `main/modules/practices/controller.ts` | + handler IPC `practices:createPractice` con schema zod |
| `main/preload.ts` | + `practices.createPractice` nel bridge |
| `src/api/practices.ts` | + `createPractice` |
| `src/pages/PratichePage.tsx` | Placeholder → pulsante "+ Nuova pratica" + gestione modal + banner conferma post-creazione |

**Invarianti service `createPractice`:**
1. `dataUdienza` obbligatoria, formato YYYY-MM-DD → ValidationError
2. Deve esistere una fase con `isInitial=true` → NotFoundError se assente
3. `codiceIstanza` rigenerato inside tx con loop di unicità (race-condition safe anche in mono-utente)
4. Auto-transizione eseguita solo se esiste una transizione con `isAutomatic=true` dalla fase iniziale (opzionale; senza transizione la pratica resta in `depositata`)
5. PEC recipients inseriti solo se `pecDestinatari` non vuoto (indirizzi vuoti filtrati lato renderer)
6. `transitionRecordId` in `pec_recipients` è null in S4.2 (FK sarà popolata in E5 con `transition_records`)

**Campi custom generali:** il modal carica `useFields({ scope: 'general' })` e rende ogni campo attivo con il componente `DynamicField`. Visibilità condizionale rispettata. Tipo `file` mostra placeholder "Upload disponibile in E7".

**Riutilizzati:** `useMenuSets()`, `useAllProfessionisti()`, `useAllCollaboratori()`, `useFields()` — nessuna modifica.

**Nota CSS:** `--color-success-bg` non è definita in `global.css` (aggiunta inline come fallback `#f0fdf4` nel banner di conferma). Da aggiungere in S11.1 con il tema.

**Verifiche:** `npm run typecheck` ✓ · `npm run build` ✓ · `npm run desktop` ✓ (app avviata, migrazione applicata, tabelle create) · Flusso createPractice simulato su DB reale con sqlite3 ✓ (practice con `current_phase_id=in_attesa_decreto`, 2 history_events, PEC recipients) · Funzionalità preesistenti integre ✓

---

### 2026-06-24 — S4.1: Generazione codice istanza automatica

**Obiettivo:** infrastruttura backend necessaria prima del form Nuova pratica (S4.2): schema `practices`, campo `siglaCodice` in AppSettings, algoritmo di generazione codice, IPC esposto.

**Migrazione DB:** incrementale `drizzle/0003_melted_nighthawk.sql` (CREATE TABLE practices 22 colonne + FK; ALTER TABLE app_settings ADD COLUMN sigla_codice). Nessun reset.

**Formato codice confermato dall'utente:** `AAAAMMGG_SIGLA_NNN` (underscore) es. `20260624_NP_001`. Progressivo annuale (COUNT delle pratiche con codice che inizia per AAAA + 1).

**File nuovi:**

| File | Descrizione |
| ---- | ----------- |
| `main/database/schema/practices.ts` | Schema Drizzle completo Practice (22 colonne, FK a phases/professionisti/collaboratori, dataUdienza nullable in DB ma obbligatoria per business — vincolo imposto in S4.2) |
| `main/modules/practices/repository.ts` | `countPracticesByYear`, `existsCodiceIstanza`, `getSiglaCodice` |
| `main/modules/practices/service.ts` | `generateCodiceIstanza` — pre-riempimento UI; TODO: rigenerare dentro la transazione di insert in S4.2 |
| `main/modules/practices/controller.ts` | `registerPracticesHandlers` + IPC `practices:generateCodiceIstanza`; validazione zod: dataUdienza regex YYYY-MM-DD |
| `src/api/practices.ts` | Client IPC renderer |

**File modificati:**

| File | Modifica |
| ---- | -------- |
| `main/database/schema/appSettings.ts` | + `siglaCodice: text('sigla_codice').notNull().default('NP')` |
| `main/database/schema/index.ts` | + `export * from './practices'` |
| `main/database/seed.ts` | + `siglaCodice: 'NP'` nel blocco insert AppSettings |
| `shared/ipc.ts` | + canale `PRACTICES_GENERATE_CODICE`, tipi `GenerateCodiceIstanzaInput/Response`, `LexFlowApi.practices` |
| `main/preload.ts` | + sezione `practices:` nel contextBridge |
| `main/server.ts` | + `registerPracticesHandlers()` |
| `docs/02-data-model.md` | + `siglaCodice` ad AppSettings (formato codice, default NP, configurabile in E11) |

**Decisioni:**
- `dataUdienza` obbligatoria per il generatore (e per la pratica): vincolo di business documentato nel service e nel controller; il vincolo NOT NULL nel form arriva in S4.2.
- Il codice generato via IPC è da considerarsi _preview_; il codice definitivo va rigenerato/verificato inside la transazione di insert in S4.2.
- `importoRichiesto` memorizzato come `real` (SQLite float); nessun calcolo fiscale automatico.

**Verifiche:** `npm run typecheck` ✓ · `npm run build` ✓
