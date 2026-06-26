import { registerAppHandlers } from './modules/app/controller'
import { registerConfigHandlers } from './modules/config/controller'
import { registerAnagraficheHandlers } from './modules/anagrafiche/controller'
import { registerPracticesHandlers } from './modules/practices/controller'
import { registerDocumentsHandlers } from './modules/documents/controller'
import { registerDashboardHandlers } from './modules/dashboard/controller'
import { registerSettingsHandlers } from './modules/settings/controller'
import { registerBackupHandlers } from './modules/backup/controller'
import { registerResetHandlers } from './modules/reset/controller'

export function bootstrap(): void {
  registerAppHandlers()
  registerConfigHandlers()
  registerAnagraficheHandlers()
  registerPracticesHandlers()
  registerDocumentsHandlers()
  registerDashboardHandlers()
  registerSettingsHandlers()
  registerBackupHandlers()
  registerResetHandlers()
}
