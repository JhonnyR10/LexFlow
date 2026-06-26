import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type {
  GenerateCodiceIstanzaResponse,
  CreatePracticeResponse,
  PracticesListResponse,
  GetPracticeResponse,
  PracticesListAvailableTransitionsResponse,
  ExecuteTransitionResponse,
  UpdatePracticeResponse,
  MoveToTrashResponse,
  PracticesListTrashedResponse,
} from '../../../shared/ipc'
import {
  generateCodiceIstanza,
  createPractice,
  updatePractice,
  listActivePractices,
  getPracticeDetail,
  listAvailableTransitions,
  executeTransition,
  moveToTrash,
  listTrashedPractices,
} from './service'
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

const getPracticeSchema = z.object({
  id: z.number().int().positive()
})

const listAvailableTransitionsSchema = z.object({
  practiceId: z.number().int().positive()
})

const executeTransitionSchema = z.object({
  practiceId:   z.number().int().positive(),
  transitionId: z.number().int().positive(),
  values:       z.record(z.string(), z.unknown()).optional().default({}),
  note:         z.string().nullable().optional(),
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

const updatePracticeSchema = z.object({
  id:                  z.number().int().positive(),
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

const moveToTrashSchema = z.object({
  ids:    z.array(z.number().int().positive()).min(1, 'Nessuna pratica selezionata'),
  reason: z.string().trim().min(1, 'Indicare un motivo per la cestinazione'),
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

  ipcMain.handle(
    IPC_CHANNELS.PRACTICES_UPDATE,
    (_, input: unknown): UpdatePracticeResponse => {
      logger.debug('IPC', IPC_CHANNELS.PRACTICES_UPDATE)
      const parsed = parseOrThrow(updatePracticeSchema, input)
      return updatePractice(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.PRACTICES_GET,
    (_, input: unknown): GetPracticeResponse => {
      logger.debug('IPC', IPC_CHANNELS.PRACTICES_GET)
      const parsed = parseOrThrow(getPracticeSchema, input)
      return getPracticeDetail(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.PRACTICES_LIST_AVAILABLE_TRANSITIONS,
    (_, input: unknown): PracticesListAvailableTransitionsResponse => {
      logger.debug('IPC', IPC_CHANNELS.PRACTICES_LIST_AVAILABLE_TRANSITIONS)
      const parsed = parseOrThrow(listAvailableTransitionsSchema, input)
      return listAvailableTransitions(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.PRACTICES_EXECUTE_TRANSITION,
    (_, input: unknown): ExecuteTransitionResponse => {
      logger.debug('IPC', IPC_CHANNELS.PRACTICES_EXECUTE_TRANSITION)
      const parsed = parseOrThrow(executeTransitionSchema, input)
      return executeTransition(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.PRACTICES_MOVE_TO_TRASH,
    (_, input: unknown): MoveToTrashResponse => {
      logger.debug('IPC', IPC_CHANNELS.PRACTICES_MOVE_TO_TRASH)
      const parsed = parseOrThrow(moveToTrashSchema, input)
      return moveToTrash(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.PRACTICES_LIST_TRASHED,
    (): PracticesListTrashedResponse => {
      logger.debug('IPC', IPC_CHANNELS.PRACTICES_LIST_TRASHED)
      return listTrashedPractices()
    }
  )
}
