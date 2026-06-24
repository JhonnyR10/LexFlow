import type {
  GenerateCodiceIstanzaInput,
  GenerateCodiceIstanzaResponse,
  CreatePracticeInput,
  CreatePracticeResponse,
  PracticesListResponse,
  GetPracticeInput,
  GetPracticeResponse,
  PracticeDetailHistoryItem,
  ListAvailableTransitionsInput,
  PracticesListAvailableTransitionsResponse,
} from '../../../shared/ipc'
import {
  countPracticesByYear,
  existsCodiceIstanza,
  getSiglaCodice,
  findInitialPhase,
  findAutomaticTransitionFromPhase,
  insertPractice,
  updatePracticeCurrentPhase,
  insertHistoryEvent,
  insertPecRecipients,
  findAllActivePractices,
  findAvailableTransitionsFromPhase,
  findPracticeDetailById,
  findPhaseNameMap,
  findHistoryEventsByPractice,
  findPecDepositoAddresses,
} from './repository'
import { getDb } from '../../database/connection'
import { ValidationError, NotFoundError } from '../../errors/AppError'

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

export function listActivePractices(): PracticesListResponse {
  return findAllActivePractices()
}

function parseCustomValues(raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    // payload non valido: trattato come vuoto, mai propagato come errore alla UI
  }
  return {}
}

export function getPracticeDetail(input: GetPracticeInput): GetPracticeResponse {
  const row = findPracticeDetailById(input.id)
  if (!row) {
    throw new NotFoundError('Pratica non trovata')
  }

  const p = row.practice
  const phaseNames = findPhaseNameMap()

  const history: PracticeDetailHistoryItem[] = findHistoryEventsByPractice(p.id).map(e => ({
    id:        e.id,
    timestamp: e.timestamp,
    type:      e.type,
    title:     e.title,
    fromPhaseDisplayName: e.fromPhaseId != null ? (phaseNames.get(e.fromPhaseId) ?? null) : null,
    toPhaseDisplayName:   e.toPhaseId != null ? (phaseNames.get(e.toPhaseId) ?? null) : null,
    note:      e.note ?? null,
  }))

  return {
    id:                  p.id,
    codiceIstanza:       p.codiceIstanza,
    nomeIstanza:         p.nomeIstanza,
    tipologiaAttivita:   p.tipologiaAttivita ?? null,
    dataUdienza:         p.dataUdienza ?? null,
    competenza:          p.competenza ?? null,
    autoritaGiudiziaria: p.autoritaGiudiziaria ?? null,
    dataDeposito:        p.dataDeposito ?? null,
    modalitaDeposito:    p.modalitaDeposito ?? null,
    importoRichiesto:    p.importoRichiesto ?? null,
    note:                p.note ?? null,
    customValues:        parseCustomValues(p.customValues),
    currentPhase: {
      id:          p.currentPhaseId,
      key:         row.currentPhaseKey,
      displayName: row.currentPhaseDisplayName,
      category:    row.currentPhaseCategory,
      isFinal:     row.currentPhaseIsFinal ?? false,
    },
    previousPhaseDisplayName: p.previousPhaseId != null ? (phaseNames.get(p.previousPhaseId) ?? null) : null,
    collaboratoreId:             p.collaboratoreId ?? null,
    collaboratoreDenominazione:  row.collaboratoreDenominazione,
    professionistaId:            p.professionistaId ?? null,
    professionistaDenominazione: row.professionistaDenominazione,
    pecDepositoDestinatari:      findPecDepositoAddresses(p.id),
    history,
    isTrashed:  p.isTrashed,
    createdAt:  p.createdAt,
    updatedAt:  p.updatedAt,
  }
}

// Pulsanti di avanzamento (S5.2): transizioni configurate dalla fase corrente.
// Le transizioni invalide non esistono nel grafo, quindi non generano pulsanti
// (cfr. docs/03-workflow-engine.md). Una fase finale non ha azioni in uscita.
export function listAvailableTransitions(
  input: ListAvailableTransitionsInput
): PracticesListAvailableTransitionsResponse {
  const row = findPracticeDetailById(input.practiceId)
  if (!row) {
    throw new NotFoundError('Pratica non trovata')
  }

  if (row.currentPhaseIsFinal === true) {
    return []
  }

  return findAvailableTransitionsFromPhase(row.practice.currentPhaseId).map(t => ({
    id:                 t.id,
    buttonLabel:        t.buttonLabel,
    toPhaseId:          t.toPhaseId,
    toPhaseDisplayName: t.toPhaseDisplayName ?? null,
    isRepeatable:       t.isRepeatable,
    isResume:           t.isResume,
  }))
}

export function createPractice(input: CreatePracticeInput): CreatePracticeResponse {
  if (!input.dataUdienza) {
    throw new ValidationError('dataUdienza è obbligatoria')
  }

  const initialPhase = findInitialPhase()
  if (!initialPhase) {
    throw new NotFoundError('Nessuna fase iniziale configurata. Verificare le impostazioni workflow.')
  }

  const now = new Date().toISOString()
  const year = parseInt(input.dataUdienza.slice(0, 4), 10)
  const dateStr = input.dataUdienza.replace(/-/g, '')

  let result: CreatePracticeResponse

  getDb().transaction(() => {
    // Codice istanza: usa quello fornito se presente e unico, altrimenti rigenera
    let codice = input.codiceIstanza?.trim() || ''
    if (!codice || existsCodiceIstanza(codice)) {
      const sigla = getSiglaCodice()
      const existing = countPracticesByYear(year)
      let n = existing + 1
      codice = buildCode(dateStr, sigla, n)
      while (existsCodiceIstanza(codice)) {
        n++
        codice = buildCode(dateStr, sigla, n)
      }
    }

    const nomeIstanza = input.nomeIstanza?.trim() || `${dateStr}_NOTA_SPESE`

    const practiceId = insertPractice({
      codiceIstanza:       codice,
      nomeIstanza,
      collaboratoreId:     input.collaboratoreId ?? null,
      professionistaId:    input.professionistaId ?? null,
      tipologiaAttivita:   input.tipologiaAttivita ?? null,
      dataUdienza:         input.dataUdienza,
      competenza:          input.competenza ?? null,
      autoritaGiudiziaria: input.autoritaGiudiziaria ?? null,
      dataDeposito:        input.dataDeposito ?? null,
      modalitaDeposito:    input.modalitaDeposito ?? null,
      importoRichiesto:    input.importoRichiesto ?? null,
      note:                input.note ?? null,
      currentPhaseId:      initialPhase.id,
      customValues:        JSON.stringify(input.customValues ?? {}),
      createdAt:           now,
      updatedAt:           now,
    })

    insertHistoryEvent({
      practiceId,
      timestamp:   now,
      type:        'created',
      title:       'Pratica depositata',
      fromPhaseId: null,
      toPhaseId:   initialPhase.id,
      note:        null,
      payload:     JSON.stringify({ codiceIstanza: codice }),
    })

    // Esegui la transizione automatica dalla fase iniziale (depositata → in_attesa_decreto)
    const autoTransition = findAutomaticTransitionFromPhase(initialPhase.id)
    let currentPhaseId = initialPhase.id

    if (autoTransition?.toPhaseId != null) {
      updatePracticeCurrentPhase(practiceId, autoTransition.toPhaseId, now)
      insertHistoryEvent({
        practiceId,
        timestamp:   now,
        type:        'auto_transition',
        title:       'Pratica posta in attesa di decreto',
        fromPhaseId: initialPhase.id,
        toPhaseId:   autoTransition.toPhaseId,
        note:        null,
        payload:     '{}',
      })
      currentPhaseId = autoTransition.toPhaseId
    }

    // PEC deposito
    if (input.pecDestinatari && input.pecDestinatari.length > 0) {
      insertPecRecipients(practiceId, input.pecDestinatari, 'deposito')
    }

    result = { id: practiceId, codiceIstanza: codice, currentPhaseId }
  })

  return result!
}
