import type {
  ProfessionistaListItem,
  CreateProfessionistaInput,
  UpdateProfessionistaInput,
  SetProfessionistaActiveInput,
  CollaboratoreListItem,
  CreateCollaboratoreInput,
  UpdateCollaboratoreInput,
  SetCollaboratoreActiveInput,
  DeleteByIdInput,
  DeleteResponse
} from '../../../shared/ipc'
import {
  findAllProfessionisti,
  findProfessionistaById,
  insertProfessionista,
  updateProfessionistaFields,
  setProfessionistaIsActive,
  findAllCollaboratori,
  findCollaboratoreById,
  insertCollaboratore,
  updateCollaboratoreFields,
  setCollaboratoreIsActive,
  countActivePracticesByProfessionista,
  countActivePracticesByCollaboratore,
  countAnyPracticesByProfessionista,
  countAnyPracticesByCollaboratore,
  deleteProfessionistaRow,
  deleteCollaboratoreRow
} from './repository'
import { ConflictError, NotFoundError, ValidationError } from '../../errors/AppError'

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

  // Guard di blocco: la disattivazione è vietata se referenziato da pratiche attive
  // (non cestinate). La riattivazione è sempre permessa.
  if (!input.isActive) {
    const usageCount = countActivePracticesByProfessionista(input.id)
    if (usageCount > 0) {
      throw new ConflictError(
        `Impossibile disattivare: ${usageCount} pratica/e attiva/e ` +
          `usano questo professionista.`
      )
    }
  }

  setProfessionistaIsActive(input.id, input.isActive)
  return { success: true }
}

// ---------- Collaboratori ----------

export function listCollaboratori(): CollaboratoreListItem[] {
  return findAllCollaboratori()
}

export function createCollaboratore(input: CreateCollaboratoreInput): CollaboratoreListItem {
  if (!input.nome.trim()) throw new ValidationError('Il nome è obbligatorio')
  if (!input.cognome.trim()) throw new ValidationError('Il cognome è obbligatorio')

  const denominazione = buildDenominazione(input.cognome, input.nome, input.denominazione)

  return insertCollaboratore({
    nome:          input.nome.trim(),
    cognome:       input.cognome.trim(),
    denominazione,
    codiceInterno: input.codiceInterno?.trim() || null,
    note:          input.note?.trim() || null,
    isActive:      true
  })
}

export function updateCollaboratore(input: UpdateCollaboratoreInput): CollaboratoreListItem {
  const existing = findCollaboratoreById(input.id)
  if (!existing) throw new NotFoundError(`Collaboratore ${input.id} non trovato`)

  if (!input.nome.trim()) throw new ValidationError('Il nome è obbligatorio')
  if (!input.cognome.trim()) throw new ValidationError('Il cognome è obbligatorio')

  const denominazione = buildDenominazione(input.cognome, input.nome, input.denominazione)

  return updateCollaboratoreFields(input.id, {
    nome:          input.nome.trim(),
    cognome:       input.cognome.trim(),
    denominazione,
    codiceInterno: input.codiceInterno?.trim() || null,
    note:          input.note?.trim() || null,
    isActive:      input.isActive
  })
}

export function setCollaboratoreActive(
  input: SetCollaboratoreActiveInput
): { success: true } {
  const existing = findCollaboratoreById(input.id)
  if (!existing) throw new NotFoundError(`Collaboratore ${input.id} non trovato`)

  // Guard di blocco: la disattivazione è vietata se referenziato da pratiche attive
  // (non cestinate). La riattivazione è sempre permessa.
  if (!input.isActive) {
    const usageCount = countActivePracticesByCollaboratore(input.id)
    if (usageCount > 0) {
      throw new ConflictError(
        `Impossibile disattivare: ${usageCount} pratica/e attiva/e ` +
          `usano questo collaboratore.`
      )
    }
  }

  setCollaboratoreIsActive(input.id, input.isActive)
  return { success: true }
}

// ---------- Eliminazione fisica (C-002) ----------
// Consentita solo se non referenziato da ALCUNA pratica (attiva o cestinata).

export function deleteProfessionista(input: DeleteByIdInput): DeleteResponse {
  const existing = findProfessionistaById(input.id)
  if (!existing) throw new NotFoundError(`Professionista ${input.id} non trovato`)
  if (countAnyPracticesByProfessionista(input.id) > 0) {
    throw new ConflictError('Professionista collegato a una o più pratiche (anche nel cestino): impossibile eliminarlo.')
  }
  deleteProfessionistaRow(input.id)
  return { success: true }
}

export function deleteCollaboratore(input: DeleteByIdInput): DeleteResponse {
  const existing = findCollaboratoreById(input.id)
  if (!existing) throw new NotFoundError(`Collaboratore ${input.id} non trovato`)
  if (countAnyPracticesByCollaboratore(input.id) > 0) {
    throw new ConflictError('Collaboratore collegato a una o più pratiche (anche nel cestino): impossibile eliminarlo.')
  }
  deleteCollaboratoreRow(input.id)
  return { success: true }
}
