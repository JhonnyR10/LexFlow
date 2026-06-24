# 04 — Convenzioni di codice e Git

## Principi

- Una responsabilità per file. File piccoli. Nomi chiari e descrittivi. Zero duplicazioni.
- Separazione netta dei layer: renderer (UI) → bridge IPC → controller → service → repository → DB. Nessun salto di layer.
- I componenti React non contengono business logic. I controller non contengono business logic né query. Le query stanno solo nei repository.

## TypeScript

- `strict: true`. Vietato `any` (usa `unknown` + narrowing dove serve). Niente `@ts-ignore` senza motivazione scritta.
- Tipi espliciti per: Practice, Phase, Transition, FieldDef, TransitionRecord, HistoryEvent, anagrafiche, Document, filtri, AppSettings, payload e risposte IPC, errori.
- I contratti IPC (request/response) sono tipi in `shared/`, usati identici da renderer e main.

## Validazione

- zod su ogni input: lato renderer (UX immediata) e lato main (sicurezza/integrità). Gli schemi sono la fonte dei tipi (`z.infer`).

## Stato e dati

- Dati che vengono dal main: **TanStack Query** (cache, loading, error, invalidazione su mutazione).
- Stato UI locale/globale semplice: **Zustand**. Non mettere nello store l'intero archivio pratiche/documenti: si interroga via query.
- Niente dati mock mescolati ai dati reali; eventuali mock isolati e rimossi prima di considerare una feature completa.

## Stati UI obbligatori

Ogni vista che carica dati gestisce: **loading**, **empty** (con messaggio utile), **error** (con messaggio + eventuale retry). Mai esporre `NaN`, `undefined`, `Invalid Date`.

## Errori

- Nel main: classi `AppError` tipizzate (es. `NotFoundError`, `ValidationError`, `ConflictError`), normalizzate in un payload IPC coerente.
- Nel renderer: gli errori IPC diventano stati error gestiti dal componente; aggiungi `ErrorBoundary` per pagina/feature per evitare che un errore di rendering faccia esplodere l'app.

## Backend (main)

- Controller (handler IPC): riceve, valida con zod (inline nel controller), chiama il service, ritorna. Niente logica.
- Service: business logic, guard di coerenza, orchestrazione transazioni. Le funzioni del repository del proprio modulo vengono importate e usate direttamente (nessuna dependency injection via costruttore). Scelta deliberata di semplicità per un'app desktop mono-utente; la DI formale si introduce solo se serviranno test unitari estesi dei service.
- Repository: unico punto d'accesso a Drizzle/SQLite. Se cambia l'ORM, cambia solo qui.
- Operazioni che scrivono dati rilevanti emettono un `HistoryEvent` nella stessa transazione.

## Frontend (renderer)

- `features/<dominio>/` raggruppa componenti, hook e logica di una funzionalità.
- `components/ui` = primitivi riutilizzabili senza dominio; `components/layout` = struttura pagina.
- Un componente cliccabile (es. codice istanza) ha stile link, hover, cursore pointer, comportamento coerente in tutta l'app.

## Naming

- File componenti: `PascalCase.tsx`. Hook: `useXxx.ts`. Moduli main: `kebab-case` o `dominio/`. Chiavi tecniche (`key`) in `snake_case` o `camelCase` ma coerenti e immutabili.

## Git

Workflow per ogni storia del backlog completata e verificata:

```
git status
git add .
git commit -m "messaggio chiaro e specifico"
git pull --rebase
git push
```

- Un commit = una unità logica completa e funzionante (build verde).
- Messaggi in imperativo, specifici: cosa cambia e perché, non "fix vari".
- Non committare segreti, `node_modules`, build artifact, DB locale o documenti utente: configurali in `.gitignore`.

## Definition of Done (per storia)

`npm run typecheck` + `npm run lint` + `npm run build` + `npm run desktop` verdi; funzionalità preesistenti integre; layer rispettati; nessun `any`; loading/empty/error gestiti; `HistoryEvent` dove pertinente; **doc in `docs/` aggiornato se il requisito è cambiato**; **`docs/PROGRESS.md` aggiornato** (stato storia + log modifiche); commit con messaggio chiaro; conferma dell'utente prima di procedere alla storia successiva.
