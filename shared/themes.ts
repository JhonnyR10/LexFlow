// Temi dell'interfaccia (S11.1). Fonte di verità unica condivisa da main (validazione),
// renderer (selettore + applicazione) e shared/ipc (tipi). I colori semantici
// (alert/errori/azioni distruttive) NON fanno parte dei temi: vivono in :root e non
// sono mai ridichiarati nei blocchi tema (CLAUDE.md regola 8, docs/06-ui-ux.md §Temi).

export const THEME_KEYS = ['light', 'dark', 'pastel', 'deep-dark', 'mustard-grey'] as const

export type ThemeKey = (typeof THEME_KEYS)[number]

export const DEFAULT_THEME: ThemeKey = 'light'

export interface ThemeDef {
  key: ThemeKey
  label: string
}

export const THEMES: ThemeDef[] = [
  { key: 'light', label: 'Chiaro' },
  { key: 'dark', label: 'Scuro' },
  { key: 'pastel', label: 'Pastello' },
  { key: 'deep-dark', label: 'Deep dark' },
  { key: 'mustard-grey', label: 'Grigio senape' }
]

export function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === 'string' && (THEME_KEYS as readonly string[]).includes(value)
}
