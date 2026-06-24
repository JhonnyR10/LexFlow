import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type { GenerateCodiceIstanzaResponse } from '../../../shared/ipc'
import { generateCodiceIstanza } from './service'
import { logger } from '../../utils/logger'

function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? 'Input non valido'
    throw new Error(msg)
  }
  return result.data
}

// ISO date YYYY-MM-DD (es. '2026-06-24'); obbligatoria — la pratica non può nascere senza dataUdienza.
const generateCodiceSchema = z.object({
  dataUdienza: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dataUdienza deve essere nel formato YYYY-MM-DD')
})

export function registerPracticesHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.PRACTICES_GENERATE_CODICE,
    (_, input: unknown): GenerateCodiceIstanzaResponse => {
      logger.debug('IPC', IPC_CHANNELS.PRACTICES_GENERATE_CODICE)
      const parsed = parseOrThrow(generateCodiceSchema, input)
      return generateCodiceIstanza(parsed)
    }
  )
}
