import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'
import { logger } from '../utils/logger'

// Puntatore di bootstrap del percorso dati (S11.2).
//
// Il DB risiede DENTRO la cartella dati e la colonna `app_settings.dataPath` vive
// dentro il DB: non può quindi indicare dove aprire il DB stesso al boot. La
// posizione fissa nota è `app.getPath('userData')`, dove teniamo un piccolo file
// `config.json` che punta al percorso dati effettivo. Questo modulo è l'unica
// fonte di verità del percorso dati a runtime: viene risolto una sola volta,
// PRIMA dell'apertura del DB, e cachato.
//
// Nell'MVP il default è `userData` e non esiste UI per spostare i dati: lo
// spostamento effettivo è una storia post-MVP dedicata. Qui c'è solo la lettura.

const POINTER_FILE = 'config.json'

const pointerSchema = z.object({
  dataPath: z.string().min(1)
})

let cachedDataPath: string | null = null

function pointerPath(): string {
  return join(app.getPath('userData'), POINTER_FILE)
}

function writePointer(dataPath: string): void {
  writeFileSync(pointerPath(), JSON.stringify({ dataPath }, null, 2), 'utf-8')
}

// Risolve il percorso dati leggendo (o creando) il puntatore esterno. Robusto:
// qualsiasi errore di IO/parsing → log + fallback al default, mai un crash.
export function resolveDataPath(): string {
  if (cachedDataPath) return cachedDataPath

  const defaultPath = app.getPath('userData')
  let dataPath = defaultPath

  try {
    if (existsSync(pointerPath())) {
      const raw = readFileSync(pointerPath(), 'utf-8')
      const parsed = pointerSchema.safeParse(JSON.parse(raw))
      if (parsed.success) {
        dataPath = parsed.data.dataPath
      } else {
        logger.warn('DATAPATH_POINTER_INVALID', 'config.json non valido, ripristino default')
        writePointer(defaultPath)
      }
    } else {
      writePointer(defaultPath)
      logger.info('DATAPATH_POINTER_CREATED', defaultPath)
    }
  } catch (err) {
    logger.error('DATAPATH_POINTER_ERROR', err instanceof Error ? err.message : String(err))
    dataPath = defaultPath
  }

  cachedDataPath = dataPath
  return dataPath
}

// Percorso dati corrente. Risolve il puntatore se non ancora fatto.
export function getDataPath(): string {
  return cachedDataPath ?? resolveDataPath()
}

// Lettura del puntatore SENZA cache né side effect (a differenza di
// resolveDataPath, che cacha). La usa lo spostamento a freddo (S11.2b) per
// leggere il vecchio percorso prima che venga risolto/cachato altrove.
export function readStoredDataPath(): string {
  const defaultPath = app.getPath('userData')
  try {
    if (!existsSync(pointerPath())) return defaultPath
    const parsed = pointerSchema.safeParse(JSON.parse(readFileSync(pointerPath(), 'utf-8')))
    return parsed.success ? parsed.data.dataPath : defaultPath
  } catch {
    return defaultPath
  }
}

// Scrive il puntatore su un nuovo percorso e aggiorna la cache runtime (così un
// eventuale getDataPath successivo nello stesso processo è coerente). Usata dallo
// spostamento a freddo (S11.2b) dopo aver copiato i dati.
export function writeStoredDataPath(newDataPath: string): void {
  writePointer(newDataPath)
  cachedDataPath = newDataPath
}
