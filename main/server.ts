import { registerAppHandlers } from './modules/app/controller'
import { registerConfigHandlers } from './modules/config/controller'
import { registerAnagraficheHandlers } from './modules/anagrafiche/controller'

export function bootstrap(): void {
  registerAppHandlers()
  registerConfigHandlers()
  registerAnagraficheHandlers()
}
