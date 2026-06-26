import { mkdir, access } from 'fs/promises'
import { constants } from 'fs'
import { z } from 'zod'
import { logger } from '../utils/logger'
import { resolveDataPath } from './dataPath'

const startupConfigSchema = z.object({
  dataPath: z.string().min(1, 'Il percorso dati è vuoto')
})

export async function validateStartupConfig(): Promise<void> {
  // Risolve il puntatore di bootstrap (config.json in userData) PRIMA del DB e
  // valida il percorso dati effettivo, non più userData direttamente.
  const dataPath = resolveDataPath()

  const parsed = startupConfigSchema.safeParse({ dataPath })
  if (!parsed.success) {
    const msg = parsed.error.message
    logger.error('STARTUP_CONFIG_INVALID', msg)
    throw new Error(`Configurazione avvio non valida: ${msg}`)
  }

  try {
    await mkdir(dataPath, { recursive: true })
    await access(dataPath, constants.W_OK)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error('STARTUP_PATH_NOT_WRITABLE', `${dataPath}: ${msg}`)
    throw new Error(`Percorso dati non accessibile (${dataPath}): ${msg}`)
  }

  logger.info('STARTUP_CONFIG_OK', dataPath)
}
