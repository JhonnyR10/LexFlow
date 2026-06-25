import type { MenuSetListItem, MenuOptionListItem } from '../../../shared/ipc'

// Helper puri per estrarre le opzioni attive di un menu set, condivisi dai form
// (Nuova pratica e transizione). Tenuti fuori dai moduli-componente per non
// violare react-refresh/only-export-components.

export function getMenuOptions(menuSets: MenuSetListItem[], key: string): MenuOptionListItem[] {
  return menuSets.find(s => s.key === key)?.options.filter(o => o.isActive) ?? []
}

export function getMenuOptionsBySetId(menuSets: MenuSetListItem[], setId: number | null): MenuOptionListItem[] {
  if (setId == null) return []
  return menuSets.find(s => s.id === setId)?.options.filter(o => o.isActive) ?? []
}
