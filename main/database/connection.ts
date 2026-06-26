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

export function initDatabase(): BetterSQLite3Database<DbSchema> {
  const dbPath = getDbFilePath()
  logger.info('DB_OPEN', dbPath)

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  // better-sqlite3-multiple-ciphers è un drop-in di better-sqlite3 con API identica.
  // Il cast è necessario perché drizzle-orm tipizza il parametro su better-sqlite3 direttamente.
  // In futuro, per abilitare la cifratura: sqlite.pragma("key = '<chiave>'") prima di questa riga,
  // leggendo la chiave da AppSettings.security.encryptionEnabled.
  sqliteHandle = sqlite as unknown as BetterSqlite3.Database
  db = drizzle(sqliteHandle, { schema })
  return db
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
