# BUILD-WINDOWS — Creare l'installer Windows di LexFlow

Guida per produrre l'installer `.exe` di LexFlow su Windows. Lo sviluppo avviene su macOS; il binario nativo
`better-sqlite3-multiple-ciphers` **non è cross-compilabile** in modo affidabile da Mac, quindi la build va
eseguita **su Windows** (manuale, questa guida) oppure **via CI** (GitHub Actions, vedi in fondo).

Config di packaging: `electron-builder.yml` (root). Le migrazioni Drizzle (`drizzle/`) sono impacchettate via
`extraResources` e lette a runtime da `process.resourcesPath/drizzle` (`main/database/migrations.ts`).

---

## 0. Regola d'oro

⚠️ **Non copiare mai la cartella `node_modules` dal Mac a Windows.** Contiene il binario nativo compilato per
macOS: su Windows non funziona. Si trasferiscono **solo i sorgenti** e si esegue `npm install` sul PC Windows.

---

## 1. Prerequisiti (una tantum sul PC Windows)

| Requisito | Note |
|---|---|
| **Node.js 22 LTS** | Installare con [nvm-windows](https://github.com/coreybutler/nvm-windows): `nvm install 22` → `nvm use 22`. Verifica: `node -v` (v22.x), `npm -v` (10.x). |
| **Git** | [git-scm.com](https://git-scm.com/download/win) (per clonare il repo). |
| **Visual Studio Build Tools 2022** | Installer: [Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) → workload **«Sviluppo di app desktop con C++»** (Desktop development with C++). Serve a `node-gyp` per compilare il modulo nativo. |
| **Python 3.x** | Di solito incluso con i Build Tools; altrimenti [python.org](https://www.python.org/) (spuntare «Add to PATH»). |

> Nota: `better-sqlite3-multiple-ciphers` distribuisce spesso **prebuild** per Windows/Electron: in tal caso il
> rebuild scarica il binario già pronto ed è rapido, senza compilazione. I Build Tools restano il fallback se il
> prebuild non è disponibile.

---

## 2. Trasferire i sorgenti

**Opzione consigliata — Git:**
```powershell
git clone <URL-del-repo> LexFlow
cd LexFlow
```
(oppure, se già clonato: `git pull`)

**Opzione copia manuale:** copiare l'intera cartella del progetto **escludendo** `node_modules`, `out`,
`release`, `dev.db`.

---

## 3. Installare le dipendenze (compila il modulo nativo)

```powershell
npm install
```
Il `postinstall` esegue automaticamente `electron-rebuild` di `better-sqlite3-multiple-ciphers` per l'ABI di
Electron. Se serve rifarlo a mano:
```powershell
npm run rebuild
```

Verifica rapida che l'ambiente sia sano:
```powershell
npm run typecheck
npm run build      # build electron-vite (main + preload + renderer in out/)
```

---

## 4. Produrre l'installer

```powershell
npm run build:win
```
Questo esegue `electron-vite build` e poi `electron-builder --win`.

**Output:** `release\0.1.0\LexFlow-Windows-0.1.0-Setup.exe`
(cartella `release\<versione>\`, definita da `directories.output` in `electron-builder.yml`; il nome segue
`artifactName`. La `<versione>` è quella in `package.json`.)

---

## 5. Installare ed eseguire

1. Doppio clic su `LexFlow-Windows-0.1.0-Setup.exe`.
2. L'installer **non è firmato**: Windows SmartScreen mostrerà un avviso → **«Ulteriori informazioni» → «Esegui
   comunque»**. (La firma del codice è un passo futuro, vedi `ROADMAP.md`.)
3. Scegliere la cartella d'installazione (NSIS lo consente) e completare.

### Verifiche al primo avvio (installer funzionante)
- L'app si apre sulla Dashboard senza errori (niente finestra bianca).
- Viene creata la cartella dati utente: `%APPDATA%\LexFlow\` contenente `lexflow.db`, `config.json` (puntatore
  percorso dati) e — dopo il primo documento — `documenti\`.
- Le **migrazioni** sono applicate (il DB ha fasi/transizioni/menu del seed: la Dashboard e «Impostazioni
  istanze» mostrano i dati standard). Se il DB non si crea, vedi Troubleshooting «migrazioni».

Dopo l'installazione, eseguire il collaudo funzionale seguendo **`docs/TEST-PLAN-MVP.md`**.

---

## 6. Troubleshooting

| Sintomo | Causa probabile | Rimedio |
|---|---|---|
| Errore all'avvio tipo `Could not locate the bindings file` / `.node` | Modulo nativo non compilato per l'ABI di Electron | `npm run rebuild`, poi ricostruire. Verificare i Build Tools C++. |
| `Error: Migrations folder not found` / DB senza tabelle | `drizzle/` non impacchettato | Verificare in `electron-builder.yml` il blocco `extraResources: [{from: drizzle, to: drizzle}]`; ricostruire. Controllare che esista `…\resources\drizzle\*.sql` nell'app installata. |
| Finestra bianca all'avvio | Renderer non trovato | Verificare che `npm run build` abbia prodotto `out\renderer\index.html` prima di `electron-builder`. |
| SmartScreen blocca l'installer | Installer non firmato | «Ulteriori informazioni» → «Esegui comunque». |
| `npm install` fallisce sul modulo nativo | Manca il toolchain C++ | Installare Visual Studio Build Tools con «Desktop development with C++» + Python. |

---

## 7. (Opzionale) Build via CI — GitHub Actions

Il workflow `.github/workflows/build-win.yml` builda l'installer su `windows-latest` senza bisogno del PC Windows:

- **Avvio manuale:** GitHub → Actions → «Build Windows installer» → *Run workflow*.
- **Automatico:** al push di un tag `v*` (es. `git tag v0.1.0 && git push origin v0.1.0`).
- L'installer `.exe` è scaricabile come **artifact** della run.

Estensioni future (vedi `ROADMAP.md`): firma del codice, pubblicazione automatica come GitHub Release.

---

## 8. Icona dell'app (futura)

Per ora si usa l'icona Electron di default. Per personalizzarla: aggiungere `resources/icon.ico` (Windows) e
`resources/icon.icns` (macOS), poi scommentare `win.icon` / `mac.icon` in `electron-builder.yml`.
