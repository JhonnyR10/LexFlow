# 01 — Architettura

Tipologia: applicazione **desktop locale mono-utente** (Electron). Greenfield.

## Scelta del tipo di app (motivazione)

L'app gira su un solo PC, offline, con dati locali e un unico amministratore. Una web app introdurrebbe server, hosting, autenticazione e concorrenza senza alcun beneficio per questo caso d'uso. Quindi: **desktop Electron**. La condivisione multi-PC è esplicitamente fuori MVP; se servirà, si valuterà allora una variante con percorso dati su cartella di rete (con gestione conflitti) o un backend server.

## Stack

| Strato | Tecnologia |
|---|---|
| Renderer (UI) | React + TypeScript + Vite |
| Stato server (cache richieste IPC) | TanStack Query |
| Stato UI globale | Zustand |
| Validazione | zod (renderer e main) |
| Main process (logica) | TypeScript |
| Persistenza | SQLite via **better-sqlite3-multiple-ciphers** (drop-in di better-sqlite3, supporta cifratura) |
| Query/migrazioni | **Drizzle ORM** |
| Backup | archivio (copia file DB + cartella documenti), automatico periodico + manuale |
| Packaging | electron-builder |

### Multipiattaforma (macOS + Windows)

Un solo codice gira su macOS e Windows; lo sviluppo avviene su Mac senza differenze. Accorgimenti obbligatori:

- **Percorsi**: mai hardcodati. Il **percorso dati** (`dataPath`) è risolto a runtime da un **puntatore esterno** `config.json` in `app.getPath('userData')` (vedi sotto), non più letto direttamente da `app.getPath('userData')`. DB (`<dataPath>/lexflow.db`) e documenti (`<dataPath>/documenti/<codiceIstanza>/`) vivono sotto `dataPath`. Costruisci i percorsi solo con il modulo `path` di Node (gestisce i separatori `/` vs `\`).
- **Puntatore di bootstrap del percorso dati** (S11.2): all'avvio l'app legge `dataPath` da `<userData>/config.json`; se il file manca o è invalido lo (ri)crea con il default `dataPath = app.getPath('userData')`. Il puntatore vive **fuori dal DB** perché il DB risiede dentro la cartella dati e non può indicare dove aprirsi: la posizione fissa nota è `userData`. La risoluzione avviene **prima** dell'apertura del DB (modulo `main/config/dataPath.ts`, valore cachato a boot). Nell'MVP S11.2 espone solo **visualizza / copia stringa / apri cartella**. Lo **spostamento effettivo** del percorso dati è **S11.2b**: un pulsante «Cambia cartella…» scrive un marker `pending-move.json` in `userData` e riavvia; **a freddo al boot, PRIMA di `validateStartupConfig`** (che risolve e cacha il percorso), `applyPendingMove()` copia `lexflow.db`(+`-wal`/`-shm`) e `documenti/` dal vecchio al nuovo percorso, **aggiorna il puntatore** `config.json` e rimuove i soli file dati dal vecchio percorso (`config.json`/`security.json` restano ancorati a `userData`). L'ordine è vincolante: il move precede `validateStartupConfig`/`applyPendingRestore` e legge/scrive il puntatore direttamente (senza `getDataPath`, per non cachare il vecchio valore). La portabilità dei dati resta coperta anche da backup/ripristino (S11.3).
- **Marker di sicurezza + boot condizionale (S14.1):** anche lo stato del lock vive **fuori dal DB**, in `<userData>/security.json` (`{ lockEnabled, kdf {salt, iterations, keylen, digest}, verifier }`), per lo stesso motivo del puntatore percorso: va letto **prima** di aprire il DB. Modulo `main/config/securityMarker.ts` (nessuna password in chiaro: solo `salt` + `verifier` PBKDF2 stdlib). **Sequenza di boot** (`main/app.ts`): `validateStartupConfig` → `applyPendingRestore` → `bootstrap()` (registra **sempre** gli handler IPC, incluso `security:*`, senza toccare il DB) → **se lock disattivo** (default): `initDatabase + migrations + seed` subito, poi `startAutoBackupScheduler` (comportamento identico all'MVP) → **se lock attivo**: il DB **non** viene aperto; si crea la finestra, il renderer mostra la schermata di sblocco, e l'apertura del DB (init+migrazioni+seed) e l'avvio dello scheduler sono **differiti** all'handler `security:unlock` dopo verifica della password. L'apertura DB è centralizzata in `openAndInitDatabase(keyHex?)` (idempotente) riusata da entrambi i rami. La colonna `app_settings.security` resta legacy. **Cifratura a riposo (S14.2):** se il marker segna `encrypted`, `security:unlock` deriva la chiave dalla password (PBKDF2 contesto `'key'`) e apre il DB cifrato passando la raw key al driver (`connection.ts:initDatabase(keyHex)`, pragma `key` prima di ogni altra pragma). Attivazione/disattivazione cifratura e cambio password (rekey) avvengono sulla connessione viva (`connection.ts:applyRekey`), sempre preceduti da un backup di sicurezza. Il ripristino di un backup è coerente solo con la stessa password (il marker vive fuori dall'archivio).
- **Modulo nativo**: better-sqlite3 va ricompilato per Electron (electron-rebuild) e per ciascuna piattaforma target.
- **Build dell'installer**: configurazione in `electron-builder.yml` (target NSIS per Windows, DMG per Mac; `drizzle/` impacchettato via `extraResources`; `.node` in `asarUnpack`). Il `.exe` Windows va generato **su una macchina Windows o via CI** (workflow `.github/workflows/build-win.yml`, `windows-latest`): compilare il binario nativo Windows da macOS è inaffidabile. **Guida operativa: `docs/BUILD-WINDOWS.md`**. Output: `.dmg`/`.app` su Mac, installer `.exe` in `release/<versione>/` su Windows.

### Perché better-sqlite3(-multiple-ciphers) + Drizzle e non Prisma

[INFERITO, alta confidenza] Prisma usa un query engine nativo (binario Rust) che in un'app Electron impacchettata va localizzato e distribuito correttamente, e le migrazioni a runtime sono macchinose. better-sqlite3 è sincrono, veloce, si ricompila per Electron con electron-rebuild e si bundla in modo prevedibile. Drizzle è TypeScript-native, leggero, con migrazioni semplici. Il layer repository isola comunque l'ORM: se un domani si cambia motore, l'impatto resta confinato. Se il committente impone Prisma e accetta il lavoro di packaging, si sostituisce solo lo strato `database/` e i repository.

**Variante cifrabile fin da subito.** La cifratura del DB è post-MVP, ma per evitare una futura migrazione di driver si usa già ora `better-sqlite3-multiple-ciphers` (API identica a better-sqlite3) con cifratura **disattivata**. Abilitarla in seguito sarà un cambio di configurazione (apertura del DB con chiave) nello strato `database/`, non un trapianto. Nell'MVP il DB resta in chiaro.

### Backup [MVP]

Il backup è un **singolo file `.zip`** (prodotto con `adm-zip`, libreria pura-JS) con timestamp nel nome (`lexflow-backup-AAAAMMGG-HHMMSS.zip`) che contiene: la copia consistente del file DB SQLite (`lexflow.db`), l'intera cartella `documenti/`, un export JSON di sicurezza (`data.json`, dump di tutte le tabelle) e un `manifest.json` (`format`, `formatVersion`, `appVersion`, `createdAt`, elenco tabelle). La copia del DB è resa consistente con `PRAGMA wal_checkpoint(TRUNCATE)` prima della copia del file (il DB gira in WAL mode).

- **Backup manuale (S11.3):** export via dialog nativo di salvataggio. **Ripristino (S11.3):** import via dialog di apertura; l'archivio viene validato (`manifest.json`) ed estratto in una cartella di **staging** in `userData`, con un **marker** `pending-restore.json`; l'app si **riavvia** (`app.relaunch()`), e **a freddo al boot — prima di aprire il DB** — viene fatta una **copia di sicurezza automatica** dei dati correnti (`pre-restore-<ts>/`) e poi lo **swap** dei file (DB + `documenti/`). Lo swap a freddo evita i lock sul file DB su Windows; le migrazioni a boot allineano un DB ripristinato più vecchio.
- **Export PDF scheda pratica (E16):** **dependency-free**. Il main compone un HTML autonomo dai dati del dettaglio (`getPracticeDetail` + documenti + label dei campi generali), lo carica in una **BrowserWindow offscreen** (`show:false`) e lo rende in PDF con `webContents.printToPDF`; il buffer è salvato via dialog. Nessuna libreria PDF esterna (evita attrito di packaging in Electron). Il PDF usa colori da documento, indipendenti dal tema dell'app.
- **Backup automatico periodico (S11.7):** scheduler nel main process. Trigger `onClose` (via `before-quit`, sincrono, DB aperto) e/o `interval` (timer ogni `intervalHours` ore), secondo `app_settings.backup`. Ogni auto-backup riusa `writeBackupZip` e scrive `lexflow-autobackup-<ts>.zip` sotto `backup.backupPath`, seguito da **rotazione** che elimina gli auto-backup oltre `retentionCount`. La rotazione opera **solo** sui file con prefisso `lexflow-autobackup-`: i backup manuali e quelli pre-reset non vengono mai toccati. Ogni errore è loggato (best-effort, non blocca la chiusura). Il **backup automatico preventivo prima del reset** (**S11.4**) riusa `writeBackupZip` e scrive `pre-reset-<ts>.zip` sotto `backup.backupPath`; è **obbligatorio** (se fallisce, il reset non procede) e **indipendente** dalla rotazione. Configurazione in `AppSettings` (vedi `02-data-model.md`).

## Confine renderer ↔ main: bridge IPC tipizzato

Non si usa un server HTTP/Express interno. Il renderer comunica con il main tramite IPC esposto in modo sicuro dal preload con `contextBridge` (mai `nodeIntegration` nel renderer). Il bridge è la versione desktop dello strato "API" previsto dalle regole: stessa separazione di responsabilità, zero rete.

Flusso completo di una operazione:

```
React component
  → hook (TanStack Query)
    → client IPC tipizzato (renderer/api)
      → preload contextBridge
        → ipcMain handler = controller (main/modules/<dominio>/controller)
          → validazione zod (inline nel controller)
          → service (business logic)
            → repository (Drizzle)
              → better-sqlite3 → SQLite
```

La risposta torna tipizzata fino al componente. Errori del main vengono normalizzati (vedi `errors/`) e gestiti dal renderer con stati error/loading.

## Struttura cartelle

### Renderer (`src/`)
```
src/
├── api/          # client IPC tipizzato (un metodo per canale)
├── assets/
├── components/
│   ├── layout/
│   └── ui/
├── features/     # pratiche, dashboard, report, cestino, impostazioni, anagrafiche, workflow
├── pages/
├── routes/
├── hooks/        # incl. hook TanStack Query
├── store/        # Zustand (stato UI)
├── context/
├── services/     # logica di presentazione (non business)
├── types/        # tipi condivisi nel renderer
├── utils/
└── validations/  # schemi zod lato UI
```

### Main process (`electron/` o `main/`)
```
main/
├── app.ts            # creazione app/finestra
├── server.ts         # bootstrap: registra gli ipcMain handler
├── preload.ts        # contextBridge
├── config/           # config validata con zod all'avvio
├── database/         # connessione better-sqlite3, schema Drizzle, migrazioni, seed
├── modules/
│   └── <dominio>/    # pratiche, fasi, anagrafiche, documenti, report, cestino, settings
│       ├── controller.ts   # handler IPC; validazione zod inline
│       ├── service.ts      # business logic; importa funzioni repository direttamente
│       └── repository.ts   # accesso DB (unico punto Drizzle/SQLite)
├── middlewares/      # wrapping validazione/error per handler
├── errors/           # AppError tipizzati + normalizzazione
├── jobs/             # eventuali task (es. backup pre-reset)
├── integrations/     # eventuale provider AI (post-MVP)
└── utils/
```

### `shared/`
Tipi e costanti condivisi tra renderer e main (es. enum categorie fase, contratti IPC). **Flusso di dipendenze unidirezionale:** `shared` non importa da `renderer` né da `main`.

## Pratiche elite adottate (sottoinsieme)

- Config/percorso dati validati con zod all'avvio: se manca qualcosa di essenziale, l'app non parte in silenzio, mostra errore chiaro.
- Logging strutturato nel main (level, timestamp, action) per operazioni critiche.
- I service importano le funzioni del repository direttamente (nessuna DI formale via costruttore). Scelta deliberata di semplicità per un'app desktop mono-utente; si introduce DI solo se serviranno test unitari estesi dei service.
- Audit trail = `HistoryEvent` (già nel dominio).
- **Modulo `assistant` (S12.1) — service orchestratore, senza repository.** L'assistente locale rule-based non ha accesso DB proprio: il suo `service.ts` **orchestra** i service esistenti (`dashboard/service`, `report/service`) per comporre le risposte, e il `controller.ts` valida con zod la sola query. È un'eccezione motivata alla struttura tripartita `controller/service/repository`: non introduce query nuove (regola 2 rispettata — l'accesso DB resta confinato ai repository dei moduli riusati). Rule-based e locale; provider AI esterno (S12.2) rinviato a `integrations/`.

## Pratiche elite scartate (mismatch con mono-utente locale)

OpenAPI contract-first, migrazioni expand-contract zero-downtime, feature flags, caching con invalidazione, optimistic locking, audit event-driven separato. Si reintroducono solo se l'app diventa multi-utente/web.
