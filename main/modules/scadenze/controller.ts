import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type {
  DeleteScadenzaResponse,
  ListScadenzeResponse,
  ScadenzaItem,
} from '../../../shared/ipc'
import { createScadenza, deleteScadenza, listScadenze, updateScadenza } from './service'
import { logger } from '../../utils/logger'

function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? 'Input non valido'
    throw new Error(msg)
  }
  return result.data
}

const listSchema = z.object({ practiceId: z.number().int().positive() })
const createSchema = z.object({
  practiceId: z.number().int().positive(),
  descrizione: z.string().min(1, 'La descrizione è obbligatoria'),
  dataScadenza: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data non valida'),
})
const updateSchema = z.object({
  id: z.number().int().positive(),
  descrizione: z.string().min(1, 'La descrizione è obbligatoria'),
  dataScadenza: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data non valida'),
  completata: z.boolean(),
})
const deleteSchema = z.object({ id: z.number().int().positive() })

export function registerScadenzeHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SCADENZE_LIST, (_event, input: unknown): ListScadenzeResponse => {
    logger.debug('IPC', IPC_CHANNELS.SCADENZE_LIST)
    return listScadenze(parseOrThrow(listSchema, input))
  })

  ipcMain.handle(IPC_CHANNELS.SCADENZE_CREATE, (_event, input: unknown): ScadenzaItem => {
    logger.debug('IPC', IPC_CHANNELS.SCADENZE_CREATE)
    return createScadenza(parseOrThrow(createSchema, input))
  })

  ipcMain.handle(IPC_CHANNELS.SCADENZE_UPDATE, (_event, input: unknown): ScadenzaItem => {
    logger.debug('IPC', IPC_CHANNELS.SCADENZE_UPDATE)
    return updateScadenza(parseOrThrow(updateSchema, input))
  })

  ipcMain.handle(IPC_CHANNELS.SCADENZE_DELETE, (_event, input: unknown): DeleteScadenzaResponse => {
    logger.debug('IPC', IPC_CHANNELS.SCADENZE_DELETE)
    return deleteScadenza(parseOrThrow(deleteSchema, input))
  })
}
