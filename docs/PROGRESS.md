# PROGRESS — Stato del progetto LexFlow

File **vivo**: traccia avanzamento, decisioni e modifiche. Distinto dalla specifica (`CLAUDE.md` + `docs/*` di riferimento). Claude Code lo legge a inizio sessione e lo aggiorna a fine di ogni storia.

Legenda stato: `TODO` · `IN CORSO` · `FATTO` · `BLOCCATO`

---

## Stato avanzamento (per storia del backlog)

| Storia | Descrizione                                                  | Stato    | Note                                                                                                                                           |
| ------ | ------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| S0.1   | Scaffolding Electron+React+TS+Vite (struttura e placeholder) | FATTO    | Senza DB (aggiunto in S0.4). Bridge IPC app:getVersion incluso.                                                                                |
| S0.2   | Bridge IPC tipizzato                                         | TODO     |                                                                                                                                                |
| S0.3   | Config zod + logging strutturato                             | IN CORSO | config/startup.ts (validazione zod + check scrittura) e utils/logger.ts fatti. Resto (gestione errori tipizzata, ErrorBoundary renderer) dopo. |
| S0.4   | Migrazioni Drizzle + seed (fasi/menu standard)               | FATTO    | DB aperto in userData, migrazioni auto, seed idempotente verificato. Riallineato al modello canonico (13 fasi, 40 transizioni) il 2026-06-24.  |
| S1.1   | CRUD fasi                                                    | TODO     |                                                                                                                                                |
| S1.2   | CRUD transizioni                                             | TODO     |                                                                                                                                                |
| S1.3   | CRUD campi generali e campi fase                             | TODO     |                                                                                                                                                |
| S1.4   | CRUD menu a tendina                                          | TODO     |                                                                                                                                                |
| S1.5   | Regola PEC condizionale                                      | TODO     |                                                                                                                                                |
| S2.1   | CRUD Professionisti                                          | TODO     |                                                                                                                                                |
| S2.2   | CRUD Collaboratori                                           | TODO     |                                                                                                                                                |
| S3.1   | Tabella pratiche attive                                      | TODO     |                                                                                                                                                |
| S3.2   | Ricerca globale                                              | TODO     |                                                                                                                                                |
| S3.3   | Filtri base                                                  | TODO     |                                                                                                                                                |
| S3.4   | Ordinamento + selezione multipla                             | TODO     |                                                                                                                                                |
| S4.1   | Generazione codice istanza                                   | TODO     |                                                                                                                                                |
| S4.2   | Form Nuova pratica                                           | TODO     |                                                                                                                                                |
| S4.3   | Modifica pratica + storico                                   | TODO     |                                                                                                                                                |
| S5.1   | Dettaglio pratica                                            | TODO     |                                                                                                                                                |
| S5.2   | Pulsanti dinamici = transizioni                              | TODO     |                                                                                                                                                |
| S5.3   | Form dinamico fase + salvataggio                             | TODO     |                                                                                                                                                |
| S5.4   | Guard coerenza stati                                         | TODO     |                                                                                                                                                |
| S5.5   | Storico/timeline                                             | TODO     |                                                                                                                                                |
| S6.1   | Quattro importi                                              | TODO     |                                                                                                                                                |
| S6.2   | Differenze calcolate                                         | TODO     |                                                                                                                                                |
| S7.1   | Documenti decreto+fattura                                    | TODO     |                                                                                                                                                |
| S8.1   | Card per fase dinamiche                                      | TODO     |                                                                                                                                                |
| S8.2   | Alert aggregato per pratica                                  | TODO     |                                                                                                                                                |
| S8.3   | Giorni da deposito                                           | TODO     |                                                                                                                                                |
| S8.4   | Anzianità + stato vuoto + Vedi pratiche                      | TODO     |                                                                                                                                                |
| S9.1   | Export CSV                                                   | TODO     |                                                                                                                                                |
| S10.1  | Sposta nel cestino                                           | TODO     |                                                                                                                                                |
| S10.2  | Ripristino                                                   | TODO     |                                                                                                                                                |
| S10.3  | Cancellazione definitiva                                     | TODO     |                                                                                                                                                |
| S11.1  | Tema + colori semantici fissi                                | TODO     |                                                                                                                                                |
| S11.2  | Percorso dati                                                | TODO     |                                                                                                                                                |
| S11.3  | Backup completo + ripristino                                 | TODO     |                                                                                                                                                |
| S11.4  | Reset con backup automatico                                  | TODO     |                                                                                                                                                |
| S11.7  | Backup automatico periodico + rotazione                      | TODO     | MVP (deciso 2026-06-23)                                                                                                                        |
| S13.\* | Qualità trasversale (errori/loading/empty/PEC)               | TODO     |                                                                                                                                                |

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

## Decisioni aperte / da confermare

- Sigla codice fissa o configurabile (assunta configurabile).
- Documenti su filesystem vs blob in DB (assunto filesystem).
- PhaseRecord vs HistoryEvent per i dati di fase: da consolidare quando si costruirà E5 (timeline = HistoryEvent; valori chiave denormalizzati sulla pratica).

---

## Log modifiche

Registro cronologico degli interventi rilevanti di Claude Code (cosa è cambiato, dove). Aggiungere una voce a fine storia.

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
