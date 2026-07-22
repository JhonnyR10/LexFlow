import type {
  SecurityChangePasswordInput,
  SecurityConfigResponse,
  SecurityDisableLockInput,
  SecurityMutationResponse,
  SecuritySetPasswordInput,
  SecurityStateResponse,
  SecurityUnlockInput,
  SecurityUnlockResponse
} from '../../../shared/ipc'
import { ValidationError } from '../../errors/AppError'
import { isDbOpen } from '../../database/connection'
import { openAndInitDatabase } from '../../database/bootstrapDb'
import { startAutoBackupScheduler } from '../backup/scheduler'
import {
  assertPasswordPolicy,
  disableLock,
  isLockEnabled,
  setPassword,
  verifyPassword
} from '../../config/securityMarker'
import { logger } from '../../utils/logger'

// Lock all'avvio (S14.1). Il lock è "attivo ma non ancora sbloccato" finché il
// DB non è aperto: con lock attivo il boot differisce l'apertura del DB a
// `unlock`. Se il DB è già aperto (default senza lock, o dopo lo sblocco) non
// c'è nulla da bloccare.
export function getSecurityState(): SecurityStateResponse {
  return { locked: isLockEnabled() && !isDbOpen() }
}

export function getSecurityConfig(): SecurityConfigResponse {
  return { lockEnabled: isLockEnabled() }
}

// Verifica la password e, se corretta, apre il DB (init+migrazioni+seed) e avvia
// lo scheduler dei backup automatici — le operazioni differite dal boot con lock.
// Idempotente rispetto al DB (openAndInitDatabase è no-op se già aperto).
export function unlock(input: SecurityUnlockInput): SecurityUnlockResponse {
  if (!verifyPassword(input.password)) {
    return { success: false }
  }
  if (!isDbOpen()) {
    openAndInitDatabase()
    startAutoBackupScheduler()
    logger.info('SECURITY_UNLOCK', 'DB aperto dopo sblocco')
  }
  return { success: true }
}

// Imposta una password (attiva il lock). Consentito solo ad app sbloccata
// (DB aperto): è raggiungibile solo dalle Impostazioni.
export function setLockPassword(input: SecuritySetPasswordInput): SecurityMutationResponse {
  assertPasswordPolicy(input.password)
  setPassword(input.password)
  return { lockEnabled: true }
}

export function changeLockPassword(
  input: SecurityChangePasswordInput
): SecurityMutationResponse {
  if (!verifyPassword(input.currentPassword)) {
    throw new ValidationError('La password attuale non è corretta.')
  }
  assertPasswordPolicy(input.newPassword)
  setPassword(input.newPassword)
  return { lockEnabled: true }
}

export function disableLockPassword(
  input: SecurityDisableLockInput
): SecurityMutationResponse {
  if (!verifyPassword(input.currentPassword)) {
    throw new ValidationError('La password attuale non è corretta.')
  }
  disableLock()
  return { lockEnabled: false }
}
