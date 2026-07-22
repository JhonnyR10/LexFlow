import Database from 'better-sqlite3-multiple-ciphers'
import type BetterSqlite3 from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { join } from 'path'
import * as schema from './schema'
import { logger } from '../utils/logger'
import { getDataPath } from '../config/dataPath'

type DbSchema = typeof schema

let db: BetterSQLite3Database<DbSchema> | null = null
let sqliteHandle: BetterSqlite3.Database | null = null

// Percorso assoluto del file DB. Unica fonte: il percorso dati risolto (S11.2).
export function getDbFilePath(): string {
  return join(getDataPath(), 'lexflow.db')
}

export function initDatabase(keyHex?: string): BetterSQLite3Database<DbSchema> {
  const dbPath = getDbFilePath()
  logger.info('DB_OPEN', keyHex ? `${dbPath} (cifrato)` : dbPath)

  const sqlite = new Database(dbPath)

  // Cifratura a riposo (S14.2): con better-sqlite3-multiple-ciphers la chiave va
  // impostata come raw key PRIMA di ogni altra operazione. `keyHex` è una chiave
  // a 32 byte in esadecimale, derivata dalla password (PBKDF2 contesto 'key').
  if (keyHex) sqlite.pragma(`key="x'${keyHex}'"`)

  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  // better-sqlite3-multiple-ciphers è un drop-in di better-sqlite3 con API identica.
  // Il cast è necessario perché drizzle-orm tipizza il parametro su better-sqlite3 direttamente.
  sqliteHandle = sqlite as unknown as BetterSqlite3.Database
  db = drizzle(sqliteHandle, { schema })
  return db
}

// Ri-cifra il DB sulla connessione viva (S14.2). `keyHex` = attiva/cambia la
// cifratura con quella chiave; `null` = rimuove la cifratura (torna in chiaro).
// Il rekey riscrive tutte le pagine: si svuota prima il WAL e si passa a
// journal DELETE per sicurezza, poi si ripristina WAL.
export function applyRekey(keyHex: string | null): void {
  if (!sqliteHandle) throw new Error('Database non inizializzato.')
  sqliteHandle.pragma('wal_checkpoint(TRUNCATE)')
  sqliteHandle.pragma('journal_mode = DELETE')
  if (keyHex) sqliteHandle.pragma(`rekey="x'${keyHex}'"`)
  else sqliteHandle.pragma("rekey=''")
  sqliteHandle.pragma('journal_mode = WAL')
}

// Svuota il WAL nel file DB principale, così una copia del solo `lexflow.db`
// è consistente (usato dal backup, S11.3). Il DB gira in WAL mode.
export function checkpointDb(): void {
  sqliteHandle?.pragma('wal_checkpoint(TRUNCATE)')
}

export function getDb(): BetterSQLite3Database<DbSchema> {
  if (!db) throw new Error('Database non inizializzato. Chiamare initDatabase() prima.')
  return db
}

// True se il DB è già aperto. Serve al boot condizionale con lock (S14.1): finché
// l'app è bloccata il DB non è aperto, quindi scheduler e backup-alla-chiusura
// devono diventare no-op invece di lanciare "Database non inizializzato".
export function isDbOpen(): boolean {
  return db !== null
}
