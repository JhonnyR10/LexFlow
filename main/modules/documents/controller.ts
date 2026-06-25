import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS, DOCUMENT_KINDS } from '../../../shared/ipc'
import type {
  ListDocumentsResponse,
  UploadDocumentResponse,
  DeleteDocumentResponse,
  OpenDocumentResponse,
} from '../../../shared/ipc'
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
  openDocument,
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

const kindSchema = z.enum(DOCUMENT_KINDS as readonly [string, ...string[]])

const listDocumentsSchema = z.object({
  practiceId: z.number().int().positive(),
})

const uploadDocumentSchema = z.object({
  practiceId: z.number().int().positive(),
  kind:       kindSchema,
})

const deleteDocumentSchema = z.object({
  id: z.number().int().positive(),
})

const openDocumentSchema = z.object({
  id: z.number().int().positive(),
})

export function registerDocumentsHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.DOCUMENTS_LIST,
    (_, input: unknown): ListDocumentsResponse => {
      logger.debug('IPC', IPC_CHANNELS.DOCUMENTS_LIST)
      const parsed = parseOrThrow(listDocumentsSchema, input)
      return listDocuments(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.DOCUMENTS_UPLOAD,
    (event: IpcMainInvokeEvent, input: unknown): Promise<UploadDocumentResponse> => {
      logger.debug('IPC', IPC_CHANNELS.DOCUMENTS_UPLOAD)
      const parsed = parseOrThrow(uploadDocumentSchema, input)
      const win = BrowserWindow.fromWebContents(event.sender)
      // kind è validato dall'enum zod (decreto|fattura): cast sicuro al tipo unione.
      return uploadDocument({ practiceId: parsed.practiceId, kind: parsed.kind as 'decreto' | 'fattura' }, win)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.DOCUMENTS_DELETE,
    (_, input: unknown): DeleteDocumentResponse => {
      logger.debug('IPC', IPC_CHANNELS.DOCUMENTS_DELETE)
      const parsed = parseOrThrow(deleteDocumentSchema, input)
      return deleteDocument(parsed)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.DOCUMENTS_OPEN,
    (_, input: unknown): Promise<OpenDocumentResponse> => {
      logger.debug('IPC', IPC_CHANNELS.DOCUMENTS_OPEN)
      const parsed = parseOrThrow(openDocumentSchema, input)
      return openDocument(parsed)
    }
  )
}
