import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS, PHASE_CATEGORIES } from '../../../shared/ipc'
import type {
  ConfigListPhasesResponse,
  ConfigListAllPhasesResponse,
  ConfigListTransitionsResponse,
  ConfigCreatePhaseResponse,
  ConfigUpdatePhaseResponse,
  ConfigSetPhaseActiveResponse,
  ConfigReorderPhasesResponse
} from '../../../shared/ipc'
import {
  listActivePhases,
  listAllPhases,
  listTransitions,
  createPhase,
  updatePhase,
  setPhaseActive,
  reorderPhases
} from './service'
import { logger } from '../../utils/logger'

const categoryEnum = z.enum(PHASE_CATEGORIES)

const createPhaseSchema = z.object({
  displayName: z.string().min(1, 'Il nome è obbligatorio').max(100),
  category: categoryEnum,
  isInitial: z.boolean(),
  isFinal: z.boolean(),
  isActive: z.boolean()
})

const updatePhaseSchema = z.object({
  id: z.number().int().positive(),
  displayName: z.string().min(1, 'Il nome è obbligatorio').max(100),
  category: categoryEnum,
  isInitial: z.boolean(),
  isFinal: z.boolean(),
  isActive: z.boolean()
})

const setPhaseActiveSchema = z.object({
  id: z.number().int().positive(),
  isActive: z.boolean()
})

const reorderPhasesSchema = z
  .array(z.object({ id: z.number().int().positive(), order: z.number().int().nonnegative() }))
  .min(1)

function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? 'Input non valido'
    throw new Error(msg)
  }
  return result.data
}

export function registerConfigHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CONFIG_LIST_PHASES, (): ConfigListPhasesResponse => {
    logger.debug('IPC', IPC_CHANNELS.CONFIG_LIST_PHASES)
    return listActivePhases()
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_LIST_ALL_PHASES, (): ConfigListAllPhasesResponse => {
    logger.debug('IPC', IPC_CHANNELS.CONFIG_LIST_ALL_PHASES)
    return listAllPhases()
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_LIST_TRANSITIONS, (): ConfigListTransitionsResponse => {
    logger.debug('IPC', IPC_CHANNELS.CONFIG_LIST_TRANSITIONS)
    return listTransitions()
  })

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_CREATE_PHASE,
    (_, input: unknown): ConfigCreatePhaseResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_CREATE_PHASE)
      const parsed = parseOrThrow(createPhaseSchema, input)
      return createPhase(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_UPDATE_PHASE,
    (_, input: unknown): ConfigUpdatePhaseResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_UPDATE_PHASE)
      const parsed = parseOrThrow(updatePhaseSchema, input)
      return updatePhase(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_SET_PHASE_ACTIVE,
    (_, input: unknown): ConfigSetPhaseActiveResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_SET_PHASE_ACTIVE)
      const parsed = parseOrThrow(setPhaseActiveSchema, input)
      return setPhaseActive(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_REORDER_PHASES,
    (_, input: unknown): ConfigReorderPhasesResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_REORDER_PHASES)
      const parsed = parseOrThrow(reorderPhasesSchema, input)
      return reorderPhases(parsed)
    }
  )
}
