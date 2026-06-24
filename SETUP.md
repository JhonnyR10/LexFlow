# SETUP — Riproduzione dell'ambiente di sviluppo LexFlow

Guida per configurare da zero l'ambiente di sviluppo su una macchina nuova.

---

## Piattaforme supportate

- **macOS** (sviluppo primario; build produzione via `npm run build:mac`)
- **Windows** (build produzione via `npm run build:win` — eseguire su Windows o via CI)

---

## Prerequisiti

### Node.js e npm

| Requisito | Versione minima | Versione usata nel progetto |
|---|---|---|
| Node.js | 20.x LTS | 22.15.1 |
| npm | 10.x | 10.9.2 |

Installare tramite [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) o [nvm-windows](https://github.com/coreybutler/nvm-windows):

```bash
nvm install 22
nvm use 22
node --version   # v22.x.x
npm --version    # 10.x.x
```

### npm global prefix (macOS)

Prima di installare tool globali, verificare che il prefix non richieda sudo:

```bash
npm config get prefix   # dovrebbe essere ~/.npm-global o simile, NON /usr/local
```

Se punta a `/usr/local` (richiede sudo), configurarlo:

```bash
mkdir ~/.npm-global
npm config set prefix ~/.npm-global
# aggiungere a ~/.zshrc o ~/.bash_profile:
export PATH="$HOME/.npm-global/bin:$PATH"
source ~/.zshrc
```

### Git

```bash
git --version   # verifica che git sia installato
```

### GitHub CLI (opzionale ma consigliato)

```bash
brew install gh          # macOS
gh auth login            # segui il wizard (browser)
```

### Claude Code CLI

```bash
npm install -g @anthropic/claude-code
claude --version
```

---

## Setup repository

### Clone e dipendenze

```bash
git clone <url-repository> LexFlow
cd LexFlow
npm install
```

`postinstall` esegue automaticamente `npm run rebuild` (vedi sezione Rebuild).

### Verifica build

```bash
npm run typecheck   # deve essere verde (zero errori TS)
npm run build       # build produzione
npm run desktop     # avvia l'app Electron in sviluppo
```

---

## Note tecniche importanti

### Rebuild nativo (better-sqlite3-multiple-ciphers)

`better-sqlite3-multiple-ciphers` è un modulo nativo (C++) che deve essere compilato per l'ABI di Electron, non per quella di Node.js di sistema.

**Sintomo se manca il rebuild:**
```
Error: The module was compiled against a different Node.js version...
NODE_MODULE_VERSION expected X, got Y.
```

**Fix:**
```bash
npm run rebuild
# oppure
./node_modules/.bin/electron-rebuild
```

Questo viene eseguito automaticamente dal postinstall a ogni `npm install`. Se si aggiunge o aggiorna una dipendenza nativa, rieseguire `npm run rebuild`.

**Perché:** Electron usa una versione di Node interna che differisce dalla versione di sistema. I moduli nativi devono essere compilati per l'ABI interna di Electron.

### HashRouter (non BrowserRouter)

Il renderer usa `HashRouter` di react-router-dom, non `BrowserRouter`. Motivo: Electron carica il renderer da `file://` — il routing HTML5 History API non funziona con protocollo file. Il `#` nell'URL è trasparente al filesystem.

Non cambiare in `BrowserRouter` senza prima configurare un server HTTP interno (che è over-engineering per questo caso d'uso).

### Alias Drizzle → better-sqlite3-multiple-ciphers

`drizzle-orm/better-sqlite3` fa internamente `require('better-sqlite3')` a livello di modulo. Per reindirizzarlo al driver cifrabile:

```typescript
// electron.vite.config.ts
plugins: [externalizeDepsPlugin({ exclude: ['drizzle-orm'] })],
resolve: {
  alias: { 'better-sqlite3': 'better-sqlite3-multiple-ciphers' }
}
```

- `drizzle-orm` è **escluso** dall'esternalizzazione → viene bundlato
- L'alias reindirizza il `require` interno di Drizzle al driver corretto
- `better-sqlite3-multiple-ciphers` resta **esternalizzato** (è un nativo)

**Non toccare questa configurazione** senza aver letto `docs/01-architecture.md`.

### DB di sviluppo

Il DB di sviluppo si trova in userData:

| Piattaforma | Percorso |
|---|---|
| macOS | `~/Library/Application Support/lexflow/lexflow.db` |
| Windows | `%APPDATA%\lexflow\lexflow.db` |

**Il DB viene creato automaticamente al primo avvio** (migrazioni + seed idempotente).

**Reset DB di sviluppo** (solo quando non ci sono dati reali — in MVP è sicuro):
```bash
rm ~/Library/Application\ Support/lexflow/lexflow.db   # macOS
# poi riavviare l'app — il DB viene ricreato da zero
```

Con dati reali si useranno **migrazioni incrementali** (`0001_*.sql`, ecc.), non il reset.

**Rigenerare migrazioni** (solo dopo reset completo):
```bash
rm drizzle/*.sql drizzle/meta/0000_snapshot.json
# resettare drizzle/meta/_journal.json a { "version": "7", "dialect": "sqlite", "entries": [] }
npm run db:generate   # genera 0000_*.sql dal codice schema Drizzle
```

---

## Script npm

| Comando | Descrizione |
|---|---|
| `npm run dev` | Alias di `desktop` |
| `npm run desktop` | Avvia app Electron in sviluppo (main + renderer con HMR via electron-vite) |
| `npm run build` | Build di produzione: main + preload + renderer |
| `npm run build:mac` | Packaging macOS (.dmg) — eseguire su macOS |
| `npm run build:win` | Packaging Windows (.exe) — eseguire su Windows o CI |
| `npm run typecheck` | `tsc --noEmit` su entrambi i tsconfig (node + web) — zero file emessi |
| `npm run lint` | ESLint 9 flat config su tutto il progetto |
| `npm run db:generate` | drizzle-kit: genera file migrazione da schema Drizzle |
| `npm run db:migrate` | Applica migrazioni al DB (normalmente fatto automaticamente all'avvio) |
| `npm run rebuild` | Ricompila moduli nativi per ABI Electron (vedi sezione Rebuild) |

---

## Struttura cartelle principale

```
LexFlow/
├── main/           # Main process Electron (TypeScript)
│   ├── app.ts      # Entry point, bootstrap
│   ├── server.ts   # Registrazione IPC handlers
│   ├── preload.ts  # contextBridge — confine main↔renderer
│   ├── config/     # Validazione avvio, configurazione app
│   ├── database/   # Schema Drizzle, migrazioni, seed, connessione
│   ├── modules/    # Logica di dominio: controller/service/repository per modulo
│   ├── errors/     # AppError, NotFoundError, ValidationError, ConflictError
│   └── utils/      # logger, helper
├── src/            # Renderer process (React + TypeScript + Vite)
│   ├── api/        # Client IPC tipizzati (chiamano window.api.*)
│   ├── features/   # Funzionalità per dominio (config/, pratiche/, ecc.)
│   ├── pages/      # Componenti pagina (una per route)
│   ├── components/ # Primitivi UI riutilizzabili, layout
│   ├── routes/     # Router.tsx con HashRouter
│   └── utils/      # Helper renderer
├── shared/         # Tipi e contratti condivisi main↔renderer
│   └── ipc.ts      # LexFlowApi, IPC_CHANNELS, tipi input/output
├── drizzle/        # Migrazioni SQL generate da drizzle-kit
├── docs/           # Documentazione di specifica e processo
├── CLAUDE.md       # Regole di sviluppo per Claude Code
├── SETUP.md        # Questo file
├── electron.vite.config.ts
├── drizzle.config.ts
└── package.json
```
