import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type {
  AnagraficheListProfessionistiResponse,
  AnagraficheCreateProfessionistaResponse,
  AnagraficheUpdateProfessionistaResponse,
  AnagraficheSetProfessionistaActiveResponse
} from '../../../shared/ipc'
import {
  listProfessionisti,
  createProfessionista,
  updateProfessionista,
  setProfessionistaActive
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

const nullableStr = z.string().nullable()

const createProfessionistaSchema = z.object({
  nome:          z.string().min(1, 'Il nome è obbligatorio').max(100),
  cognome:       z.string().min(1, 'Il cognome è obbligatorio').max(100),
  denominazione: z.string().max(200).nullable(),
  codiceFiscale: nullableStr,
  email:         nullableStr,
  pec:           nullableStr,
  telefono:      nullableStr,
  ruolo:         nullableStr,
  note:          nullableStr
})

const updateProfessionistaSchema = z.object({
  id:            z.number().int().positive(),
  nome:          z.string().min(1, 'Il nome è obbligatorio').max(100),
  cognome:       z.string().min(1, 'Il cognome è obbligatorio').max(100),
  denominazione: z.string().max(200).nullable(),
  codiceFiscale: nullableStr,
  email:         nullableStr,
  pec:           nullableStr,
  telefono:      nullableStr,
  ruolo:         nullableStr,
  note:          nullableStr,
  isActive:      z.boolean()
})

const setProfessionistaActiveSchema = z.object({
  id:       z.number().int().positive(),
  isActive: z.boolean()
})

export function registerAnagraficheHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.ANAGRAFICHE_LIST_PROFESSIONISTI,
    (): AnagraficheListProfessionistiResponse => {
      logger.debug('IPC', IPC_CHANNELS.ANAGRAFICHE_LIST_PROFESSIONISTI)
      return listProfessionisti()
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.ANAGRAFICHE_CREATE_PROFESSIONISTA,
    (_, input: unknown): AnagraficheCreateProfessionistaResponse => {
      logger.debug('IPC', IPC_CHANNELS.ANAGRAFICHE_CREATE_PROFESSIONISTA)
      const parsed = parseOrThrow(createProfessionistaSchema, input)
      return createProfessionista(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.ANAGRAFICHE_UPDATE_PROFESSIONISTA,
    (_, input: unknown): AnagraficheUpdateProfessionistaResponse => {
      logger.debug('IPC', IPC_CHANNELS.ANAGRAFICHE_UPDATE_PROFESSIONISTA)
      const parsed = parseOrThrow(updateProfessionistaSchema, input)
      return updateProfessionista(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.ANAGRAFICHE_SET_PROFESSIONISTA_ACTIVE,
    (_, input: unknown): AnagraficheSetProfessionistaActiveResponse => {
      logger.debug('IPC', IPC_CHANNELS.ANAGRAFICHE_SET_PROFESSIONISTA_ACTIVE)
      const parsed = parseOrThrow(setProfessionistaActiveSchema, input)
      return setProfessionistaActive(parsed)
    }
  )
}
