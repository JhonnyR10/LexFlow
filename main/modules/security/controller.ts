import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type {
  SecurityConfigResponse,
  SecurityEncryptionResponse,
  SecurityMutationResponse,
  SecurityStateResponse,
  SecurityUnlockResponse
} from '../../../shared/ipc'
import {
  changeLockPassword,
  disableEncryption,
  disableLockPassword,
  enableEncryption,
  getSecurityConfig,
  getSecurityState,
  setLockPassword,
  unlock
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

const passwordSchema = z.string().min(1, 'Password mancante')

const unlockSchema = z.object({ password: passwordSchema })
const setPasswordSchema = z.object({ password: passwordSchema })
const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema
})
const disableLockSchema = z.object({ currentPassword: passwordSchema })
const encryptionSchema = z.object({ password: passwordSchema })

export function registerSecurityHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SECURITY_GET_STATE, (): SecurityStateResponse => {
    logger.debug('IPC', IPC_CHANNELS.SECURITY_GET_STATE)
    return getSecurityState()
  })

  ipcMain.handle(IPC_CHANNELS.SECURITY_GET_CONFIG, (): SecurityConfigResponse => {
    logger.debug('IPC', IPC_CHANNELS.SECURITY_GET_CONFIG)
    return getSecurityConfig()
  })

  ipcMain.handle(IPC_CHANNELS.SECURITY_UNLOCK, (_event, input: unknown): SecurityUnlockResponse => {
    logger.debug('IPC', IPC_CHANNELS.SECURITY_UNLOCK)
    return unlock(parseOrThrow(unlockSchema, input))
  })

  ipcMain.handle(
    IPC_CHANNELS.SECURITY_SET_PASSWORD,
    (_event, input: unknown): SecurityMutationResponse => {
      logger.debug('IPC', IPC_CHANNELS.SECURITY_SET_PASSWORD)
      return setLockPassword(parseOrThrow(setPasswordSchema, input))
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SECURITY_CHANGE_PASSWORD,
    (_event, input: unknown): SecurityMutationResponse => {
      logger.debug('IPC', IPC_CHANNELS.SECURITY_CHANGE_PASSWORD)
      return changeLockPassword(parseOrThrow(changePasswordSchema, input))
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SECURITY_DISABLE_LOCK,
    (_event, input: unknown): SecurityMutationResponse => {
      logger.debug('IPC', IPC_CHANNELS.SECURITY_DISABLE_LOCK)
      return disableLockPassword(parseOrThrow(disableLockSchema, input))
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SECURITY_ENABLE_ENCRYPTION,
    (_event, input: unknown): SecurityEncryptionResponse => {
      logger.debug('IPC', IPC_CHANNELS.SECURITY_ENABLE_ENCRYPTION)
      return enableEncryption(parseOrThrow(encryptionSchema, input))
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SECURITY_DISABLE_ENCRYPTION,
    (_event, input: unknown): SecurityEncryptionResponse => {
      logger.debug('IPC', IPC_CHANNELS.SECURITY_DISABLE_ENCRYPTION)
      return disableEncryption(parseOrThrow(encryptionSchema, input))
    }
  )
}
