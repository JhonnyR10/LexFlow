import { useEffect } from 'react'
import { DEFAULT_THEME } from '../../../shared/themes'
import { useAppSettings } from '../../features/settings/useSettings'

// Applica il tema corrente impostando `data-theme` su <html>; il CSS fa il resto
// (override dei soli token di base/sidebar; i token semantici restano in :root).
// Componente senza UI: legge la query e riflette il valore. Finché la query non ha
// risposto resta il default chiaro di :root, quindi non scrive nulla.
export function ThemeApplier(): null {
  const { data } = useAppSettings()
  const theme = data?.theme ?? DEFAULT_THEME

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return null
}
