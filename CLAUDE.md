# CLAUDE.md — LexFlow

Memoria di progetto per Claude Code. Leggi questo file all'inizio di ogni sessione. È la fonte autorevole per lo sviluppo, distillata dai documenti di specifica del committente. In caso di conflitto tra una richiesta estemporanea e queste regole, segnala il conflitto prima di agire.

## Cos'è LexFlow

Gestionale desktop per la tracciabilità delle istanze di liquidazione e notule spese depositate presso uffici giudiziari. Segue l'iter della pratica dal deposito al decreto, all'invio SCP, alla liquidazione e chiusura. Strumento operativo interno, non una semplice tabella. Glossario dominio: `docs/05-domain-glossary.md`.

## Decisioni di prodotto bloccate

- **Greenfield**, da zero.
- **Desktop locale mono-utente**: Electron + SQLite. Niente cloud, niente autenticazione, niente multi-utente.
- **Workflow configurabile già nell'MVP**: fasi, transizioni e campi si configurano dai dati, non si scrivono nel codice. È il cuore dell'app: `docs/03-workflow-engine.md`.
- Sigla del codice istanza **configurabile** (default `NP`). File documentali su **filesystem** (`<percorsoDati>/documenti/<codiceIstanza>/`), riferimento in DB. Numeri di procedimento multipli **fuori MVP**. Percorso dati condiviso multi-PC **fuori MVP**.
- **Backup automatico periodico in MVP** (oltre a quello manuale e a quello pre-reset). **Post-MVP:** protezione dati (lock + cifratura DB), scadenzario/termini, export PDF scheda pratica. Il driver DB cifrabile è adottato già ora con cifratura **spenta**, per evitare migrazioni future.

## Stack

- **Renderer (frontend):** React + TypeScript + Vite. Stato server via TanStack Query; stato UI via Zustand; validazione con zod.
- **Main process (backend):** TypeScript, layer `config / database / modules / middlewares / errors / utils`.
- **DB:** SQLite via **better-sqlite3-multiple-ciphers + Drizzle ORM** (drop-in di better-sqlite3, cifratura disponibile ma spenta nell'MVP; scelta motivata in `docs/01-architecture.md`; Prisma scartato per attrito di packaging in Electron).
- **Confine renderer↔main:** **bridge IPC tipizzato** (preload + contextBridge). NON usare un server HTTP/Express: è over-engineering per mono-utente locale.

## Regole non negoziabili

1. **Non rompere ciò che funziona.** Prima di modificare, leggi il codice esistente. Non riscrivere parti non richieste.
2. **Layer separati.** Renderer → bridge IPC → controller → service (business logic) → repository (DB) → Drizzle/SQLite. Nessuna query fuori dai repository. Nessuna business logic nei componenti React o nei controller.
3. **TypeScript serio.** Vietato `any`. Tipi espliciti per pratiche, fasi, workflow, importi, documenti, filtri, impostazioni, risposte IPC, errori.
4. **File piccoli, nomi chiari, niente duplicazioni.** Un file = una responsabilità. Aggiorna sempre gli import dopo uno spostamento.
5. **Stati UI obbligatori.** Ogni vista gestisce loading, empty e error. Mai mostrare `NaN`/`undefined`: importi mancanti → "Non presente"/"Non calcolabile"; data deposito assente → "Data deposito non presente".
6. **Soft delete.** Il Cestino è eliminazione logica (`isTrashed`). Le pratiche cestinate sono escluse da Dashboard, Report, filtri ordinari, alert e assistente, finché non ripristinate.
7. **Relazioni per ID.** Collaboratori e professionisti collegati per ID, mai per stringa. Non eliminabili se collegati a pratiche: solo disattivabili.
8. **Colori semantici fissi.** Alert giallo/arancione/rosso, errori e azioni distruttive NON cambiano con il tema.
9. **Storico sempre.** Ogni operazione rilevante (creazione, modifica, avanzamento fase, documenti, cestino, ripristino) scrive un `HistoryEvent`.
10. **Validazione doppia.** zod lato renderer e lato main.
11. **Multipiattaforma.** L'app gira su macOS e Windows da un solo codice. Mai percorsi hardcoded: usa `app.getPath('userData')` per il percorso dati e il modulo `path` di Node per costruire i percorsi (documenti in `<userData>/documenti/<codiceIstanza>/`). L'installer Windows si produce su Windows o via CI (vedi `01-architecture.md`).
12. **Documentazione = fonte di verità.** Quando un requisito di funzionalità o UX/UI cambia, aggiorna il doc in `docs/` corrispondente **nello stesso intervento, prima del codice**. Non lasciare mai codice che diverge dalla specifica.

## Metodo di lavoro

- Si procede **passo dopo passo** secondo il backlog (`docs/00-backlog-mvp.md`). Una storia alla volta.
- A fine intervento: `npm run typecheck`, `npm run build`, `npm run desktop` devono restare verdi.
- Prima di passare alla storia successiva: build verde, funzionalità preesistenti integre, e **conferma esplicita dell'utente**. Non avanzare in autonomia.
- A fine di ogni storia: aggiorna `docs/PROGRESS.md` (stato della storia, modifiche fatte, eventuali decisioni). All'inizio di ogni sessione leggi `docs/PROGRESS.md` per sapere a che punto sei.
- Commit Git per ogni storia completata con messaggio chiaro.

## Comandi

```
npm run dev          # alias di desktop: avvia l'intera app Electron in sviluppo (main + renderer con HMR)
npm run desktop      # avvia l'intera app Electron in sviluppo (main + renderer con HMR) — usa electron-vite dev
npm run build        # build di produzione: main + preload + renderer via electron-vite build
npm run typecheck    # tsc --noEmit su entrambi i tsconfig (node e web) — non emette file
npm run lint         # eslint (flat config ESLint 9)
npm run db:generate  # drizzle: genera migrazioni — disponibile da S0.4
npm run db:migrate   # applica migrazioni — disponibile da S0.4
```

Note: con electron-vite, `dev`/`desktop` avviano **sia** il main process Electron **sia** il dev server Vite del renderer. Non è un semplice dev server web.

## Indice della documentazione (`docs/`)

- `PROGRESS.md` — stato avanzamento, log decisioni, log modifiche. **Leggi a inizio sessione; aggiorna a fine storia.**
- `00-backlog-mvp.md` — epiche, storie con criteri d'accettazione, perimetro MVP, ordine di costruzione. **Leggi prima di stimare o pianificare.**
- `01-architecture.md` — stack, layer, struttura cartelle, bridge IPC, scelta DB. **Leggi prima di toccare struttura o configurazione.**
- `02-data-model.md` — entità, relazioni, regole di integrità. **Leggi prima di modificare lo schema o un repository.**
- `03-workflow-engine.md` — motore workflow configurabile (fasi, transizioni, form dinamici, regola PEC). **Leggi prima di lavorare su pratiche, dettaglio pratica, dashboard.**
- `07-workflow-tree.md` — albero canonico completo fasi/transizioni/timeline. **Fonte di verità del workflow: prevale in caso di dubbio sul flusso.**
- `04-conventions.md` — convenzioni codice, naming, struttura cartelle frontend/backend, Git.
- `05-domain-glossary.md` — termini del dominio legale.
- `06-ui-ux.md` — temi, alert, dashboard, stati vuoti, layout responsive.

## Ordine di costruzione

E0 scaffolding → E1 configurazione workflow → E2 anagrafiche → E4 creazione pratica → E5 workflow operativo → E3 elenco/filtri → E6 importi → E7 documenti → E8 dashboard → E10 cestino → E11 impostazioni → E9.1 export CSV → E13 qualità. Il motore di workflow (E1+E5) va costruito presto: tutto il resto vi si appoggia.
