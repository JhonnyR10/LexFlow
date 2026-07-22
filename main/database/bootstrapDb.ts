import { initDatabase, isDbOpen } from './connection'
import { runMigrations } from './migrations'
import { runSeed } from './seed'

// Apertura del DB centralizzata: init connessione + migrazioni + seed, nell'ordine.
// Idempotente: no-op se il DB è già aperto. È riusata da due punti (S14.1):
//   - main/app.ts, ramo boot con lock disattivo (comportamento MVP invariato);
//   - modules/security/service.ts, handler `security:unlock` (apertura differita
//     dopo la verifica della password).
export function openAndInitDatabase(keyHex?: string): void {
  if (isDbOpen()) return
  initDatabase(keyHex)
  runMigrations()
  runSeed()
}
