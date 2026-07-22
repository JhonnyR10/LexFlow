import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto'
import { z } from 'zod'
import { logger } from '../utils/logger'

// Marker di sicurezza esterno (S14.1).
//
// Lo stato del lock deve essere noto PRIMA di aprire il DB (che in S14.2 potrà
// essere cifrato e comunque risiede dentro la cartella dati): vive quindi in un
// piccolo file `security.json` in `app.getPath('userData')`, fuori dal DB, come
// il puntatore `config.json` del percorso dati. Non conserva mai la password in
// chiaro: solo il `salt` e un `verifier` = PBKDF2(password, salt). Lo sblocco
// ricalcola il verifier e lo confronta in tempo costante.
//
// La derivazione della chiave di cifratura SQLCipher dalla stessa password è
// S14.2 e userà un contesto diverso ('key' vs 'verify') per separazione di
// dominio, così il verifier non rivela mai la chiave.

const MARKER_FILE = 'security.json'

// Parametri KDF. PBKDF2-HMAC-SHA512, stdlib Node (nessuna dipendenza nativa).
const KDF_ITERATIONS = 210_000
const KDF_KEYLEN = 32
const KDF_DIGEST = 'sha512'
const SALT_BYTES = 16

const MIN_PASSWORD_LENGTH = 6

const kdfSchema = z.object({
  salt: z.string().min(1),
  iterations: z.number().int().positive(),
  keylen: z.number().int().positive(),
  digest: z.string().min(1)
})

const markerSchema = z.object({
  lockEnabled: z.boolean(),
  kdf: kdfSchema.optional(),
  verifier: z.string().optional()
})

export type SecurityMarker = z.infer<typeof markerSchema>

const DISABLED: SecurityMarker = { lockEnabled: false }

function markerPath(): string {
  return join(app.getPath('userData'), MARKER_FILE)
}

// Lettura robusta: qualsiasi errore di IO/parsing → log + stato "disattivo",
// mai un crash. Un marker corrotto non deve bloccare fuori l'utente dai propri
// dati (il file DB, in S14.1, non è ancora cifrato).
export function readSecurityMarker(): SecurityMarker {
  try {
    if (!existsSync(markerPath())) return DISABLED
    const parsed = markerSchema.safeParse(JSON.parse(readFileSync(markerPath(), 'utf-8')))
    if (!parsed.success) {
      logger.warn('SECURITY_MARKER_INVALID', 'security.json non valido, lock ignorato')
      return DISABLED
    }
    // Un marker con lock attivo ma senza kdf/verifier è incoerente → disattivo.
    if (parsed.data.lockEnabled && (!parsed.data.kdf || !parsed.data.verifier)) {
      logger.warn('SECURITY_MARKER_INCOMPLETE', 'security.json privo di kdf/verifier, lock ignorato')
      return DISABLED
    }
    return parsed.data
  } catch (err) {
    logger.error('SECURITY_MARKER_ERROR', err instanceof Error ? err.message : String(err))
    return DISABLED
  }
}

function writeSecurityMarker(marker: SecurityMarker): void {
  writeFileSync(markerPath(), JSON.stringify(marker, null, 2), 'utf-8')
}

// Deriva un valore dalla password. `context` separa i domini d'uso (S14.1 usa
// solo 'verify'; S14.2 userà 'key'): salt effettivo = `<salt>|<context>`.
function derive(password: string, saltHex: string, context: string): Buffer {
  const salt = Buffer.concat([Buffer.from(saltHex, 'hex'), Buffer.from(`|${context}`, 'utf-8')])
  return pbkdf2Sync(password, salt, KDF_ITERATIONS, KDF_KEYLEN, KDF_DIGEST)
}

function computeVerifier(password: string, saltHex: string): string {
  return derive(password, saltHex, 'verify').toString('hex')
}

export function isLockEnabled(): boolean {
  return readSecurityMarker().lockEnabled
}

// Stato usato dal cancello di boot: true = l'app deve chiedere lo sblocco.
export function getBootSecurityState(): { locked: boolean } {
  return { locked: isLockEnabled() }
}

// Verifica la password contro il verifier salvato, in tempo costante. False se
// il lock non è attivo o il marker è incompleto.
export function verifyPassword(password: string): boolean {
  const marker = readSecurityMarker()
  if (!marker.lockEnabled || !marker.kdf || !marker.verifier) return false
  const computed = derive(password, marker.kdf.salt, 'verify')
  const stored = Buffer.from(marker.verifier, 'hex')
  if (computed.length !== stored.length) return false
  return timingSafeEqual(computed, stored)
}

export function assertPasswordPolicy(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`La password deve avere almeno ${MIN_PASSWORD_LENGTH} caratteri.`)
  }
}

// Imposta (o reimposta) la password e attiva il lock. Genera un nuovo salt.
export function setPassword(password: string): void {
  assertPasswordPolicy(password)
  const salt = randomBytes(SALT_BYTES).toString('hex')
  writeSecurityMarker({
    lockEnabled: true,
    kdf: { salt, iterations: KDF_ITERATIONS, keylen: KDF_KEYLEN, digest: KDF_DIGEST },
    verifier: computeVerifier(password, salt)
  })
  logger.info('SECURITY_LOCK_ENABLED', 'password impostata')
}

// Disattiva il lock: rimuove il marker (torna al comportamento di default).
export function disableLock(): void {
  try {
    if (existsSync(markerPath())) rmSync(markerPath())
  } catch (err) {
    logger.error('SECURITY_MARKER_REMOVE_ERROR', err instanceof Error ? err.message : String(err))
    // Fallback: sovrascrive con marker inerte così il boot non chiede sblocco.
    writeSecurityMarker(DISABLED)
  }
  logger.info('SECURITY_LOCK_DISABLED', 'password rimossa')
}
