import { registerAppHandlers } from './modules/app/controller'
import { registerConfigHandlers } from './modules/config/controller'
import { registerAnagraficheHandlers } from './modules/anagrafiche/controller'
import { registerPracticesHandlers } from './modules/practices/controller'

export function bootstrap(): void {
  registerAppHandlers()
  registerConfigHandlers()
  registerAnagraficheHandlers()
  registerPracticesHandlers()
}
