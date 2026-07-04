import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { join } from 'path'
import { app } from 'electron'
import { getDb } from './connection'
import { logger } from '../utils/logger'

export function runMigrations(): void {
  const db = getDb()

  // In sviluppo: le migrazioni sono in <project-root>/drizzle/ (2 livelli sopra out/main/).
  // In produzione: la cartella drizzle/ è impacchettata via `extraResources` in
  // electron-builder.yml → disponibile in process.resourcesPath/drizzle.
  const migrationsFolder = app.isPackaged
    ? join(process.resourcesPath, 'drizzle')
    : join(__dirname, '../../drizzle')

  logger.info('DB_MIGRATE_START', migrationsFolder)
  migrate(db, { migrationsFolder })
  logger.info('DB_MIGRATE_DONE')
}
