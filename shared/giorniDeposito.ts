// Calcolo condiviso dell'anzianità da deposito (giorni interi).
// Fonte di verità unica usata sia dagli alert Dashboard (S8.2, main service)
// sia dal display nel dettaglio pratica (S8.3, renderer).

export const MS_PER_DAY = 24 * 60 * 60 * 1000

// Giorni interi (>= 0) tra oggi (data locale) e la data deposito ISO YYYY-MM-DD.
// null se la data è assente o non parsabile.
export function daysSinceDeposit(dataDeposito: string | null): number | null {
  if (!dataDeposito) return null
  const deposito = new Date(`${dataDeposito}T00:00:00`)
  if (Number.isNaN(deposito.getTime())) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.floor((today.getTime() - deposito.getTime()) / MS_PER_DAY)
  return diff < 0 ? 0 : diff
}
