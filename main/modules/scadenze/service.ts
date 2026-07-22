import type {
  CreateScadenzaInput,
  DeleteScadenzaInput,
  DeleteScadenzaResponse,
  ListScadenzeInput,
  ListScadenzeResponse,
  ScadenzaItem,
  UpdateScadenzaInput,
} from '../../../shared/ipc'
import { ConflictError, NotFoundError, ValidationError } from '../../errors/AppError'
import type { ScadenzaRow } from '../../database/schema'
import {
  deleteScadenzaRow,
  findPracticeRef,
  findScadenzaById,
  findScadenzeByPractice,
  insertHistoryEvent,
  insertScadenza,
  updateScadenzaRow,
} from './repository'

function toItem(r: ScadenzaRow): ScadenzaItem {
  return {
    id:           r.id,
    practiceId:   r.practiceId,
    descrizione:  r.descrizione,
    dataScadenza: r.dataScadenza,
    completata:   r.completata,
    completataAt: r.completataAt ?? null,
    createdAt:    r.createdAt,
  }
}

function assertValidInput(descrizione: string, dataScadenza: string): void {
  if (descrizione.trim().length === 0) {
    throw new ValidationError('La descrizione della scadenza è obbligatoria.')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataScadenza) || Number.isNaN(Date.parse(dataScadenza))) {
    throw new ValidationError('La data della scadenza non è valida.')
  }
}

// Guard cestino (come i documenti): nessuna mutazione su pratica cestinata.
function assertPracticeEditable(practiceId: number): void {
  const ref = findPracticeRef(practiceId)
  if (!ref) throw new NotFoundError('Pratica non trovata')
  if (ref.isTrashed) {
    throw new ConflictError('La pratica è nel cestino: le scadenze non sono modificabili.')
  }
}

function writeEvent(practiceId: number, type: string, title: string, note: string): void {
  insertHistoryEvent({
    practiceId,
    timestamp: new Date().toISOString(),
    type,
    title,
    fromPhaseId: null,
    toPhaseId: null,
    note,
    payload: '{}',
  })
}

export function listScadenze(input: ListScadenzeInput): ListScadenzeResponse {
  return findScadenzeByPractice(input.practiceId).map(toItem)
}

export function createScadenza(input: CreateScadenzaInput): ScadenzaItem {
  assertPracticeEditable(input.practiceId)
  assertValidInput(input.descrizione, input.dataScadenza)

  const id = insertScadenza({
    practiceId:   input.practiceId,
    descrizione:  input.descrizione.trim(),
    dataScadenza: input.dataScadenza,
    completata:   false,
    completataAt: null,
    createdAt:    new Date().toISOString(),
  })
  writeEvent(input.practiceId, 'scadenza_added', 'Scadenza aggiunta', input.descrizione.trim())

  const row = findScadenzaById(id)
  if (!row) throw new NotFoundError('Scadenza non trovata')
  return toItem(row)
}

export function updateScadenza(input: UpdateScadenzaInput): ScadenzaItem {
  const existing = findScadenzaById(input.id)
  if (!existing) throw new NotFoundError('Scadenza non trovata')
  assertPracticeEditable(existing.practiceId)
  assertValidInput(input.descrizione, input.dataScadenza)

  // Transizione di completamento (false → true): setta completataAt e scrive
  // l'evento. Il completamento inverso azzera completataAt (nessun evento).
  const nowCompleting = !existing.completata && input.completata
  const completataAt = input.completata
    ? existing.completataAt ?? new Date().toISOString()
    : null

  updateScadenzaRow(input.id, {
    descrizione:  input.descrizione.trim(),
    dataScadenza: input.dataScadenza,
    completata:   input.completata,
    completataAt,
  })

  if (nowCompleting) {
    writeEvent(existing.practiceId, 'scadenza_completed', 'Scadenza completata', input.descrizione.trim())
  }

  const row = findScadenzaById(input.id)
  if (!row) throw new NotFoundError('Scadenza non trovata')
  return toItem(row)
}

export function deleteScadenza(input: DeleteScadenzaInput): DeleteScadenzaResponse {
  const existing = findScadenzaById(input.id)
  if (!existing) return { deleted: false }
  assertPracticeEditable(existing.practiceId)

  deleteScadenzaRow(input.id)
  writeEvent(existing.practiceId, 'scadenza_removed', 'Scadenza eliminata', existing.descrizione)
  return { deleted: true }
}
