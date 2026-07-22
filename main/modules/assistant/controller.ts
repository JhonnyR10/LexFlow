import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type { AssistantAskResponse } from '../../../shared/ipc'
import { askAssistant } from './service'
import { logger } from '../../utils/logger'

const askSchema = z.object({
  query: z.string().max(500, 'Domanda troppo lunga'),
})

export function registerAssistantHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.ASSISTANT_ASK, (_event, input: unknown): AssistantAskResponse => {
    logger.debug('IPC', IPC_CHANNELS.ASSISTANT_ASK)
    const result = askSchema.safeParse(input)
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? 'Input non valido'
      throw new Error(msg)
    }
    return askAssistant(result.data)
  })
}
