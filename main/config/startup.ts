import { app } from 'electron'
import { mkdir, access } from 'fs/promises'
import { constants } from 'fs'
import { z } from 'zod'
import { logger } from '../utils/logger'

const startupConfigSchema = z.object({
  userDataPath: z.string().min(1, 'Il percorso userData è vuoto')
})

export async function validateStartupConfig(): Promise<void> {
  const userDataPath = app.getPath('userData')

  const parsed = startupConfigSchema.safeParse({ userDataPath })
  if (!parsed.success) {
    const msg = parsed.error.message
    logger.error('STARTUP_CONFIG_INVALID', msg)
    throw new Error(`Configurazione avvio non valida: ${msg}`)
  }

  try {
    await mkdir(userDataPath, { recursive: true })
    await access(userDataPath, constants.W_OK)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error('STARTUP_PATH_NOT_WRITABLE', `${userDataPath}: ${msg}`)
    throw new Error(`Percorso dati non accessibile (${userDataPath}): ${msg}`)
  }

  logger.info('STARTUP_CONFIG_OK', userDataPath)
}
