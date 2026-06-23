import { registerAppHandlers } from './modules/app/controller'
import { registerConfigHandlers } from './modules/config/controller'

export function bootstrap(): void {
  registerAppHandlers()
  registerConfigHandlers()
}
