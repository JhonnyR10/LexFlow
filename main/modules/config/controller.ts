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
  ConfigReorderPhasesResponse,
  ConfigCreateTransitionResponse,
  ConfigUpdateTransitionResponse,
  ConfigSetTransitionActiveResponse,
  ConfigReorderTransitionsResponse,
  ConfigListMenuSetsResponse,
  ConfigCreateMenuSetResponse,
  ConfigUpdateMenuSetResponse,
  ConfigCreateMenuOptionResponse,
  ConfigUpdateMenuOptionResponse,
  ConfigSetMenuOptionActiveResponse,
  ConfigReorderMenuOptionsResponse
} from '../../../shared/ipc'
import {
  listActivePhases,
  listAllPhases,
  listTransitions,
  createPhase,
  updatePhase,
  setPhaseActive,
  reorderPhases,
  createTransition,
  updateTransition,
  setTransitionActive,
  reorderTransitions,
  listMenuSets,
  createMenuSet,
  updateMenuSet,
  createMenuOption,
  updateMenuOption,
  setMenuOptionActive,
  reorderMenuOptions
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

  const createTransitionSchema = z.object({
    fromPhaseId: z.number().int().positive(),
    toPhaseId: z.number().int().positive().nullable(),
    buttonLabel: z.string().max(100),
    isRepeatable: z.boolean(),
    isAutomatic: z.boolean(),
    isResume: z.boolean(),
    isActive: z.boolean()
  })

  const updateTransitionSchema = z.object({
    id: z.number().int().positive(),
    fromPhaseId: z.number().int().positive(),
    toPhaseId: z.number().int().positive().nullable(),
    buttonLabel: z.string().max(100),
    isRepeatable: z.boolean(),
    isAutomatic: z.boolean(),
    isResume: z.boolean(),
    isActive: z.boolean()
  })

  const setTransitionActiveSchema = z.object({
    id: z.number().int().positive(),
    isActive: z.boolean()
  })

  const reorderTransitionsSchema = z
    .array(z.object({ id: z.number().int().positive(), order: z.number().int().nonnegative() }))
    .min(1)

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_CREATE_TRANSITION,
    (_, input: unknown): ConfigCreateTransitionResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_CREATE_TRANSITION)
      const parsed = parseOrThrow(createTransitionSchema, input)
      return createTransition(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_UPDATE_TRANSITION,
    (_, input: unknown): ConfigUpdateTransitionResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_UPDATE_TRANSITION)
      const parsed = parseOrThrow(updateTransitionSchema, input)
      return updateTransition(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_SET_TRANSITION_ACTIVE,
    (_, input: unknown): ConfigSetTransitionActiveResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_SET_TRANSITION_ACTIVE)
      const parsed = parseOrThrow(setTransitionActiveSchema, input)
      return setTransitionActive(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_REORDER_TRANSITIONS,
    (_, input: unknown): ConfigReorderTransitionsResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_REORDER_TRANSITIONS)
      const parsed = parseOrThrow(reorderTransitionsSchema, input)
      return reorderTransitions(parsed)
    }
  )

  // ---------- Menu sets / options ----------

  ipcMain.handle(IPC_CHANNELS.CONFIG_LIST_MENU_SETS, (): ConfigListMenuSetsResponse => {
    logger.debug('IPC', IPC_CHANNELS.CONFIG_LIST_MENU_SETS)
    return listMenuSets()
  })

  const createMenuSetSchema = z.object({
    label: z.string().min(1, 'Il nome del menu è obbligatorio').max(100)
  })

  const updateMenuSetSchema = z.object({
    id: z.number().int().positive(),
    label: z.string().min(1, 'Il nome del menu è obbligatorio').max(100)
  })

  const createMenuOptionSchema = z.object({
    menuSetId: z.number().int().positive(),
    label: z.string().min(1, "L'etichetta è obbligatoria").max(100),
    value: z.string().min(1, 'Il valore è obbligatorio').max(100)
  })

  const updateMenuOptionSchema = z.object({
    id: z.number().int().positive(),
    label: z.string().min(1, "L'etichetta è obbligatoria").max(100)
  })

  const setMenuOptionActiveSchema = z.object({
    id: z.number().int().positive(),
    isActive: z.boolean()
  })

  const reorderMenuOptionsSchema = z
    .array(z.object({ id: z.number().int().positive(), order: z.number().int().nonnegative() }))
    .min(1)

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_CREATE_MENU_SET,
    (_, input: unknown): ConfigCreateMenuSetResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_CREATE_MENU_SET)
      const parsed = parseOrThrow(createMenuSetSchema, input)
      return createMenuSet(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_UPDATE_MENU_SET,
    (_, input: unknown): ConfigUpdateMenuSetResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_UPDATE_MENU_SET)
      const parsed = parseOrThrow(updateMenuSetSchema, input)
      return updateMenuSet(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_CREATE_MENU_OPTION,
    (_, input: unknown): ConfigCreateMenuOptionResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_CREATE_MENU_OPTION)
      const parsed = parseOrThrow(createMenuOptionSchema, input)
      return createMenuOption(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_UPDATE_MENU_OPTION,
    (_, input: unknown): ConfigUpdateMenuOptionResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_UPDATE_MENU_OPTION)
      const parsed = parseOrThrow(updateMenuOptionSchema, input)
      return updateMenuOption(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_SET_MENU_OPTION_ACTIVE,
    (_, input: unknown): ConfigSetMenuOptionActiveResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_SET_MENU_OPTION_ACTIVE)
      const parsed = parseOrThrow(setMenuOptionActiveSchema, input)
      return setMenuOptionActive(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIG_REORDER_MENU_OPTIONS,
    (_, input: unknown): ConfigReorderMenuOptionsResponse => {
      logger.debug('IPC', IPC_CHANNELS.CONFIG_REORDER_MENU_OPTIONS)
      const parsed = parseOrThrow(reorderMenuOptionsSchema, input)
      return reorderMenuOptions(parsed)
    }
  )
}
