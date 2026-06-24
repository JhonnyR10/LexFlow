import type {
  ProfessionistaListItem,
  CreateProfessionistaInput,
  UpdateProfessionistaInput,
  SetProfessionistaActiveInput
} from '../../../shared/ipc'
import {
  findAllProfessionisti,
  findProfessionistaById,
  insertProfessionista,
  updateProfessionistaFields,
  setProfessionistaIsActive
} from './repository'
import { NotFoundError, ValidationError } from '../../errors/AppError'

function buildDenominazione(cognome: string, nome: string, raw: string | null | undefined): string {
  const trimmed = (raw ?? '').trim()
  return trimmed.length > 0 ? trimmed : `${cognome.trim()} ${nome.trim()}`.trim()
}

function validateEmail(value: string | null, fieldName: string): void {
  if (!value) return
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new ValidationError(`${fieldName} non è un indirizzo email valido`)
  }
}

function validateCodiceFiscale(value: string | null): void {
  if (!value) return
  if (!/^[A-Za-z0-9]{11}$|^[A-Za-z0-9]{16}$/.test(value)) {
    throw new ValidationError(
      'Codice fiscale (16 caratteri) o P.IVA (11 cifre): solo lettere e numeri'
    )
  }
}

export function listProfessionisti(): ProfessionistaListItem[] {
  return findAllProfessionisti()
}

export function createProfessionista(input: CreateProfessionistaInput): ProfessionistaListItem {
  if (!input.nome.trim()) throw new ValidationError('Il nome è obbligatorio')
  if (!input.cognome.trim()) throw new ValidationError('Il cognome è obbligatorio')

  const denominazione = buildDenominazione(input.cognome, input.nome, input.denominazione)
  validateCodiceFiscale(input.codiceFiscale)
  validateEmail(input.email, 'Email')
  validateEmail(input.pec, 'PEC')

  return insertProfessionista({
    nome:          input.nome.trim(),
    cognome:       input.cognome.trim(),
    denominazione,
    codiceFiscale: input.codiceFiscale?.trim() || null,
    email:         input.email?.trim() || null,
    pec:           input.pec?.trim() || null,
    telefono:      input.telefono?.trim() || null,
    ruolo:         input.ruolo?.trim() || null,
    note:          input.note?.trim() || null,
    isActive:      true
  })
}

export function updateProfessionista(input: UpdateProfessionistaInput): ProfessionistaListItem {
  const existing = findProfessionistaById(input.id)
  if (!existing) throw new NotFoundError(`Professionista ${input.id} non trovato`)

  if (!input.nome.trim()) throw new ValidationError('Il nome è obbligatorio')
  if (!input.cognome.trim()) throw new ValidationError('Il cognome è obbligatorio')

  const denominazione = buildDenominazione(input.cognome, input.nome, input.denominazione)
  validateCodiceFiscale(input.codiceFiscale)
  validateEmail(input.email, 'Email')
  validateEmail(input.pec, 'PEC')

  return updateProfessionistaFields(input.id, {
    nome:          input.nome.trim(),
    cognome:       input.cognome.trim(),
    denominazione,
    codiceFiscale: input.codiceFiscale?.trim() || null,
    email:         input.email?.trim() || null,
    pec:           input.pec?.trim() || null,
    telefono:      input.telefono?.trim() || null,
    ruolo:         input.ruolo?.trim() || null,
    note:          input.note?.trim() || null,
    isActive:      input.isActive
  })
}

export function setProfessionistaActive(
  input: SetProfessionistaActiveInput
): { success: true } {
  const existing = findProfessionistaById(input.id)
  if (!existing) throw new NotFoundError(`Professionista ${input.id} non trovato`)

  // TODO: aggiungere guard "non disattivare se collegato a pratiche attive"
  // quando la tabella practices sarà disponibile (E4).
  setProfessionistaIsActive(input.id, input.isActive)
  return { success: true }
}
