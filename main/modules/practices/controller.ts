import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type {
  GenerateCodiceIstanzaResponse,
  CreatePracticeResponse,
  PracticesListResponse,
} from '../../../shared/ipc'
import { generateCodiceIstanza, createPractice, listActivePractices } from './service'
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

const createPracticeSchema = z.object({
  codiceIstanza:       z.string().optional(),
  nomeIstanza:         z.string().optional(),
  collaboratoreId:     z.number().int().positive().nullable().optional(),
  professionistaId:    z.number().int().positive().nullable().optional(),
  tipologiaAttivita:   z.string().optional(),
  dataUdienza:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dataUdienza deve essere nel formato YYYY-MM-DD'),
  competenza:          z.string().optional(),
  autoritaGiudiziaria: z.string().optional(),
  dataDeposito:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')).transform(v => v || undefined),
  modalitaDeposito:    z.string().optional(),
  importoRichiesto:    z.number().nullable().optional(),
  note:                z.string().optional(),
  customValues:        z.record(z.string(), z.unknown()).optional(),
  pecDestinatari:      z.array(z.string()).optional(),
})

export function registerPracticesHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.PRACTICES_LIST,
    (): PracticesListResponse => {
      logger.debug('IPC', IPC_CHANNELS.PRACTICES_LIST)
      return listActivePractices()
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.PRACTICES_GENERATE_CODICE,
    (_, input: unknown): GenerateCodiceIstanzaResponse => {
      logger.debug('IPC', IPC_CHANNELS.PRACTICES_GENERATE_CODICE)
      const parsed = parseOrThrow(generateCodiceSchema, input)
      return generateCodiceIstanza(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.PRACTICES_CREATE,
    (_, input: unknown): CreatePracticeResponse => {
      logger.debug('IPC', IPC_CHANNELS.PRACTICES_CREATE)
      const parsed = parseOrThrow(createPracticeSchema, input)
      return createPractice(parsed)
    }
  )
}
