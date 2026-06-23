import Database from 'better-sqlite3-multiple-ciphers'
import type BetterSqlite3 from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import * as schema from './schema'
import { logger } from '../utils/logger'

type DbSchema = typeof schema

let db: BetterSQLite3Database<DbSchema> | null = null

export function initDatabase(): BetterSQLite3Database<DbSchema> {
  const dbPath = join(app.getPath('userData'), 'lexflow.db')
  logger.info('DB_OPEN', dbPath)

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  // better-sqlite3-multiple-ciphers è un drop-in di better-sqlite3 con API identica.
  // Il cast è necessario perché drizzle-orm tipizza il parametro su better-sqlite3 direttamente.
  // In futuro, per abilitare la cifratura: sqlite.pragma("key = '<chiave>'") prima di questa riga,
  // leggendo la chiave da AppSettings.security.encryptionEnabled.
  db = drizzle(sqlite as unknown as BetterSqlite3.Database, { schema })
  return db
}

export function getDb(): BetterSQLite3Database<DbSchema> {
  if (!db) throw new Error('Database non inizializzato. Chiamare initDatabase() prima.')
  return db
}
