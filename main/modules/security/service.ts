import { join } from 'path'
import type {
  SecurityChangePasswordInput,
  SecurityConfigResponse,
  SecurityDisableEncryptionInput,
  SecurityDisableLockInput,
  SecurityEnableEncryptionInput,
  SecurityEncryptionResponse,
  SecurityMutationResponse,
  SecuritySetPasswordInput,
  SecurityStateResponse,
  SecurityUnlockInput,
  SecurityUnlockResponse
} from '../../../shared/ipc'
import { ConflictError, ValidationError } from '../../errors/AppError'
import { applyRekey, isDbOpen } from '../../database/connection'
import { openAndInitDatabase } from '../../database/bootstrapDb'
import { startAutoBackupScheduler } from '../backup/scheduler'
import { writeBackupZip } from '../backup/service'
import { getBackupPath } from '../backup/repository'
import { backupTimestamp } from '../backup/naming'
import {
  assertPasswordPolicy,
  buildLockMarker,
  computeKeyHex,
  currentSalt,
  deriveCurrentKeyHex,
  disableLock,
  generateSalt,
  isEncrypted,
  isLockEnabled,
  persistMarker,
  setEncryptedFlag,
  setPassword,
  verifyPassword
} from '../../config/securityMarker'
import { logger } from '../../utils/logger'

// Lock all'avvio (S14.1) + cifratura a riposo (S14.2). Il lock è "attivo ma non
// ancora sbloccato" finché il DB non è aperto: con lock attivo il boot differisce
// l'apertura del DB a `unlock`.
export function getSecurityState(): SecurityStateResponse {
  return { locked: isLockEnabled() && !isDbOpen() }
}

export function getSecurityConfig(): SecurityConfigResponse {
  return { lockEnabled: isLockEnabled(), encrypted: isEncrypted() }
}

// Verifica la password e, se corretta, apre il DB (cifrato se il marker lo
// segna: la chiave è derivata dalla password) e avvia lo scheduler dei backup —
// le operazioni differite dal boot con lock. Idempotente sul DB.
export function unlock(input: SecurityUnlockInput): SecurityUnlockResponse {
  if (!verifyPassword(input.password)) {
    return { success: false }
  }
  if (!isDbOpen()) {
    const keyHex = isEncrypted() ? deriveCurrentKeyHex(input.password) ?? undefined : undefined
    openAndInitDatabase(keyHex)
    startAutoBackupScheduler()
    logger.info('SECURITY_UNLOCK', keyHex ? 'DB cifrato aperto' : 'DB aperto dopo sblocco')
  }
  return { success: true }
}

// Imposta una password iniziale (attiva il lock, cifratura spenta). Consentito
// solo ad app sbloccata (DB aperto): raggiungibile solo dalle Impostazioni.
export function setLockPassword(input: SecuritySetPasswordInput): SecurityMutationResponse {
  assertPasswordPolicy(input.password)
  setPassword(input.password)
  return { lockEnabled: true }
}

// Cambio password. Se il DB è cifrato, ri-cifra (rekey) con la nuova chiave
// nella stessa operazione, così il DB resta apribile. Ordine: rekey PRIMA della
// scrittura del marker, per non lasciare un marker che non apre il DB.
export function changeLockPassword(
  input: SecurityChangePasswordInput
): SecurityMutationResponse {
  if (!verifyPassword(input.currentPassword)) {
    throw new ValidationError('La password attuale non è corretta.')
  }
  assertPasswordPolicy(input.newPassword)

  if (isEncrypted()) {
    const newSalt = generateSalt()
    const newKeyHex = computeKeyHex(input.newPassword, newSalt)
    applyRekey(newKeyHex)
    persistMarker(buildLockMarker(input.newPassword, newSalt, true))
    logger.info('SECURITY_PASSWORD_CHANGED', 'con rekey (DB cifrato)')
  } else {
    setPassword(input.newPassword)
    logger.info('SECURITY_PASSWORD_CHANGED', 'senza rekey')
  }
  return { lockEnabled: true }
}

// Rimozione password (disattiva il lock). Bloccata se il DB è cifrato: senza
// password non ci sarebbe la chiave per aprirlo. Va prima disattivata la cifratura.
export function disableLockPassword(
  input: SecurityDisableLockInput
): SecurityMutationResponse {
  if (!verifyPassword(input.currentPassword)) {
    throw new ValidationError('La password attuale non è corretta.')
  }
  if (isEncrypted()) {
    throw new ConflictError(
      'Disattiva prima la cifratura del database, poi potrai rimuovere la password.'
    )
  }
  disableLock()
  return { lockEnabled: false }
}

// Backup di sicurezza obbligatorio prima di un'operazione di (de)cifratura. Se
// fallisce, l'operazione non prosegue (l'errore si propaga).
function safetyBackup(prefix: string): string {
  const dest = join(getBackupPath(), `${prefix}-${backupTimestamp()}.zip`)
  writeBackupZip(dest)
  logger.info('SECURITY_SAFETY_BACKUP', dest)
  return dest
}

// Attiva la cifratura a riposo (S14.2). Richiede lock attivo e la re-immissione
// della password (la chiave non è conservata). Backup di sicurezza → rekey della
// connessione viva → flag `encrypted` nel marker.
export function enableEncryption(
  input: SecurityEnableEncryptionInput
): SecurityEncryptionResponse {
  if (!isLockEnabled()) {
    throw new ConflictError('Imposta prima una password per attivare la cifratura.')
  }
  if (!verifyPassword(input.password)) {
    throw new ValidationError('La password non è corretta.')
  }
  if (isEncrypted()) {
    throw new ConflictError('La cifratura è già attiva.')
  }
  const salt = currentSalt()
  if (!salt) {
    throw new ConflictError('Configurazione di sicurezza incompleta.')
  }

  const safetyBackupPath = safetyBackup('pre-encrypt')
  const keyHex = computeKeyHex(input.password, salt)
  applyRekey(keyHex)
  setEncryptedFlag(true)
  logger.info('SECURITY_ENCRYPTION_ENABLED', 'DB cifrato')
  return { encrypted: true, safetyBackupPath }
}

// Disattiva la cifratura: backup di sicurezza → rekey a testo in chiaro →
// flag `encrypted=false`. Il lock resta attivo.
export function disableEncryption(
  input: SecurityDisableEncryptionInput
): SecurityEncryptionResponse {
  if (!verifyPassword(input.password)) {
    throw new ValidationError('La password non è corretta.')
  }
  if (!isEncrypted()) {
    throw new ConflictError('La cifratura non è attiva.')
  }

  const safetyBackupPath = safetyBackup('pre-decrypt')
  applyRekey(null)
  setEncryptedFlag(false)
  logger.info('SECURITY_ENCRYPTION_DISABLED', 'DB in chiaro')
  return { encrypted: false, safetyBackupPath }
}
