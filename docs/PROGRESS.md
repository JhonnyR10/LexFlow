# PROGRESS — Stato del progetto LexFlow

File **vivo**: traccia avanzamento, decisioni e modifiche. Distinto dalla specifica (`CLAUDE.md` + `docs/*` di riferimento). Claude Code lo legge a inizio sessione e lo aggiorna a fine di ogni storia.

Legenda stato: `TODO` · `IN CORSO` · `FATTO` · `BLOCCATO`

---

## Stato avanzamento (per storia del backlog)

| Storia | Descrizione                                                  | Stato    | Note                                                                                                                                                                                                                     |
| ------ | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S0.1   | Scaffolding Electron+React+TS+Vite (struttura e placeholder) | FATTO    | Senza DB (aggiunto in S0.4). Bridge IPC app:getVersion incluso.                                                                                                                                                          |
| S0.2   | Bridge IPC tipizzato                                         | TODO     |                                                                                                                                                                                                                          |
| S0.3   | Config zod + logging strutturato                             | IN CORSO | config/startup.ts (validazione zod + check scrittura) e utils/logger.ts fatti. Resto (gestione errori tipizzata, ErrorBoundary renderer) dopo.                                                                           |
| S0.4   | Migrazioni Drizzle + seed (fasi/menu standard)               | FATTO    | DB aperto in userData, migrazioni auto, seed idempotente verificato. Riallineato al modello canonico (13 fasi, 40 transizioni) il 2026-06-24.                                                                            |
| S1.1   | CRUD fasi + guscio applicativo                               | FATTO    | Routing HashRouter, sidebar, 6 pagine, QueryClientProvider. CRUD fasi completo. Guard disattivazione unica fase iniziale attivo; guard pratiche (TODO) documentato. Delete fisica rinviata (FK constraints).             |
| S1.2   | CRUD transizioni                                             | FATTO    | Backend: createTransition/updateTransition/setTransitionActive/reorderTransitions con invarianti; UI: elenco raggruppato per fase, modale create/edit, riordino scoped, attiva/disattiva. Delete fisica rinviata (TODO). |
| S1.3   | CRUD campi configurabili (generali e per transizione)        | FATTO    | Schema migrato: scope general\|transition, transitionId (FK transitions) sostituisce phaseId. Migrazioni rigenerate, DB dev resettato. Delete fisica e guard d'uso rinviati (TODO con tabella practices).                |
| S1.4   | CRUD menu a tendina                                          | FATTO    | Backend: 7 canali IPC con invarianti (key immutabile, value univoco/immutabile). UI: layout due livelli, 5 set standard visibili. Delete fisica e guard d'uso rinviati (TODO).                                           |
| S1.5   | Regola PEC condizionale                                      | FATTO    | Schema migrato: tipo pec + conditionalOnFieldId/conditionalValue. Visibilità condizionale nel form campo, badge nella tabella, pulsante convenience PEC.                                                                  |
| S2.1   | CRUD Professionisti                                          | FATTO    | Nuovo modulo anagrafiche (IPC namespace `anagrafiche:`), schema Drizzle + migrazione incrementale 0001_*.sql, CRUD completo, denominazione auto-derivata da cognome+nome, validazione CF/email morbida.                  |
| S2.2   | CRUD Collaboratori                                           | FATTO    | Modulo anagrafiche esteso: schema Drizzle + migrazione incrementale 0002_*.sql, CRUD completo, denominazione auto-derivata da cognome+nome, codiceInterno opzionale.                                                     |
| S3.1   | Tabella pratiche attive                                      | FATTO    | IPC practices:listPractices, LEFT JOIN phases/professionisti/collaboratori, PraticheTable con 7 colonne, route /pratiche/:id con DettaglioPraticaPage placeholder.                                                        |
| S3.2   | Ricerca globale                                              | TODO     |                                                                                                                                                                                                                          |
| S3.3   | Filtri base                                                  | TODO     |                                                                                                                                                                                                                          |
| S3.4   | Ordinamento + selezione multipla                             | TODO     |                                                                                                                                                                                                                          |
| S4.1   | Generazione codice istanza                                   | FATTO    | Schema practices (22 col, FK a phases/professionisti/collaboratori), siglaCodice in AppSettings, migrazione 0003_*.sql, IPC practices:generateCodiceIstanza, formato AAAAMMGG_SIGLA_NNN.                                 |
| S4.2   | Form Nuova pratica                                           | FATTO    | Modal Nuova pratica: 6 sezioni, campi fissi + campi custom generali + PEC deposito. Backend: createPractice con transazione, auto-transizione depositata→in_attesa_decreto, HistoryEvent. Nuove tabelle: history_events, pec_recipients. Migrazione 0004_*.sql. |                                                                                                                                                                                                                          |
| S4.3   | Modifica pratica + storico                                   | TODO     |                                                                                                                                                                                                                          |
| S5.1   | Dettaglio pratica                                            | TODO     |                                                                                                                                                                                                                          |
| S5.2   | Pulsanti dinamici = transizioni                              | TODO     |                                                                                                                                                                                                                          |
| S5.3   | Form dinamico fase + salvataggio                             | TODO     |                                                                                                                                                                                                                          |
| S5.4   | Guard coerenza stati                                         | TODO     |                                                                                                                                                                                                                          |
| S5.5   | Storico/timeline                                             | TODO     |                                                                                                                                                                                                                          |
| S6.1   | Quattro importi                                              | TODO     |                                                                                                                                                                                                                          |
| S6.2   | Differenze calcolate                                         | TODO     |                                                                                                                                                                                                                          |
| S7.1   | Documenti decreto+fattura                                    | TODO     |                                                                                                                                                                                                                          |
| S8.1   | Card per fase dinamiche                                      | TODO     |                                                                                                                                                                                                                          |
| S8.2   | Alert aggregato per pratica                                  | TODO     |                                                                                                                                                                                                                          |
| S8.3   | Giorni da deposito                                           | TODO     |                                                                                                                                                                                                                          |
| S8.4   | Anzianità + stato vuoto + Vedi pratiche                      | TODO     |                                                                                                                                                                                                                          |
| S9.1   | Export CSV                                                   | TODO     |                                                                                                                                                                                                                          |
| S10.1  | Sposta nel cestino                                           | TODO     |                                                                                                                                                                                                                          |
| S10.2  | Ripristino                                                   | TODO     |                                                                                                                                                                                                                          |
| S10.3  | Cancellazione definitiva                                     | TODO     |                                                                                                                                                                                                                          |
| S11.1  | Tema + colori semantici fissi                                | TODO     |                                                                                                                                                                                                                          |
| S11.2  | Percorso dati                                                | TODO     |                                                                                                                                                                                                                          |
| S11.3  | Backup completo + ripristino                                 | TODO     |                                                                                                                                                                                                                          |
| S11.4  | Reset con backup automatico                                  | TODO     |                                                                                                                                                                                                                          |
| S11.7  | Backup automatico periodico + rotazione                      | TODO     | MVP (deciso 2026-06-23)                                                                                                                                                                                                  |
| S13.\* | Qualità trasversale (errori/loading/empty/PEC)               | TODO     |                                                                                                                                                                                                                          |

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
