import type { GenerateCodiceIstanzaInput, GenerateCodiceIstanzaResponse } from '../../../shared/ipc'
import { countPracticesByYear, existsCodiceIstanza, getSiglaCodice } from './repository'
import { ValidationError } from '../../errors/AppError'

// Genera il prossimo codice istanza disponibile.
// Formato: AAAAMMGG_SIGLA_NNN (es. 20260624_NP_001).
// Usata per pre-riempire il campo nel form (S4.2).
// IMPORTANTE: il codice definitivo deve essere rigenerato/verificato dentro la
// transazione di insert della pratica in S4.2, per evitare race condition tra
// la preview e il salvataggio (anche se in mono-utente il rischio è minimo).
export function generateCodiceIstanza(
  input: GenerateCodiceIstanzaInput
): GenerateCodiceIstanzaResponse {
  const { dataUdienza } = input

  const year = parseInt(dataUdienza.slice(0, 4), 10)
  if (isNaN(year)) throw new ValidationError('dataUdienza non valida')

  const dateStr = dataUdienza.replace(/-/g, '')  // YYYYMMDD
  const sigla = getSiglaCodice()
  const existing = countPracticesByYear(year)

  let n = existing + 1
  let candidate = buildCode(dateStr, sigla, n)

  // Loop di sicurezza: in mono-utente sincrono non si verifica mai,
  // ma garantisce unicità assoluta anche in caso di codici già presenti per altri motivi.
  while (existsCodiceIstanza(candidate)) {
    n++
    candidate = buildCode(dateStr, sigla, n)
  }

  return { codice: candidate }
}

function buildCode(dateStr: string, sigla: string, n: number): string {
  return `${dateStr}_${sigla}_${String(n).padStart(3, '0')}`
}
