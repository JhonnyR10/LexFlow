import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePracticeDetail, useMoveToTrash, useRestoreFromTrash } from '../features/practices/usePractices'
import { WorkflowActions } from '../features/practices/WorkflowActions'
import { ModificaPraticaModal } from '../features/practices/ModificaPraticaModal'
import { MoveToTrashModal } from '../features/practices/MoveToTrashModal'
import { RestoreFromTrashModal } from '../features/practices/RestoreFromTrashModal'
import { ipcErrorMessage } from '../utils/ipcError'
import { DocumentsSection } from '../features/documents/DocumentsSection'
import { useFields } from '../features/config/fields/useFields'
import { useMenuSets } from '../features/config/menus/useMenus'
import { computeImportoDifferences } from '../features/practices/importoCalc'
import {
  availableTimelineCategories,
  emptyTimelineFilter,
  filterTimeline,
  hasActiveTimelineFilter,
  type TimelineCategoryKey,
  type TimelineFilterState,
} from '../features/practices/timelineFilters'
import { daysSinceDeposit } from '../../shared/giorniDeposito'
import type {
  PracticeDetail,
  PracticeDetailHistoryItem,
  FieldDefListItem,
  MenuSetListItem,
} from '../../shared/ipc'

// ---------- Helper di formato ----------

const ABSENT = 'Non presente'
const NOT_CALCULABLE = 'Non calcolabile'
const DEPOSITO_ASSENTE = 'Data deposito non presente'

// S8.3: giorni dalla data deposito, stesso calcolo puro degli alert (S8.2).
function formatGiorniDeposito(dataDeposito: string | null): string {
  const days = daysSinceDeposit(dataDeposito)
  return days === null ? DEPOSITO_ASSENTE : String(days)
}

function formatDate(iso: string | null): string {
  if (!iso) return ABSENT
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function formatDateTime(iso: string): string {
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(dt)
}

function formatImporto(value: number | null): string {
  if (value == null) return ABSENT
  return new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
  }).format(value)
}

function textOrAbsent(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim()
  return trimmed.length > 0 ? trimmed : ABSENT
}

// S6.2: differenze importi. Operando mancante → "Non calcolabile" (mai NaN).
function formatImportoCalc(value: number | null): string {
  return value == null ? NOT_CALCULABLE : formatImporto(value)
}

function formatPercentuale(value: number | null): string {
  if (value == null) return NOT_CALCULABLE
  return `${new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 1, maximumFractionDigits: 1,
  }).format(value)} %`
}

// ---------- Risoluzione valori campi personalizzati ----------

function resolveCustomValue(
  field: FieldDefListItem,
  raw: unknown,
  menuSets: MenuSetListItem[],
): string {
  if (raw == null || raw === '') return ABSENT

  switch (field.type) {
    case 'si_no':
      return raw === true || raw === 'true' || raw === 1 ? 'Sì' : 'No'
    case 'importo':
      return typeof raw === 'number' ? formatImporto(raw) : String(raw)
    case 'data':
      return typeof raw === 'string' ? formatDate(raw) : String(raw)
    case 'menu': {
      const set = menuSets.find(s => s.id === field.menuSetId)
      const option = set?.options.find(o => o.value === String(raw))
      return option?.label ?? String(raw)
    }
    default:
      return String(raw)
  }
}

// ---------- Componenti presentazionali ----------

function PhaseBadge({ name, isFinal }: { name: string | null; isFinal: boolean }): React.JSX.Element {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
      fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
      background: isFinal ? 'var(--badge-final-bg)' : 'var(--badge-initial-bg)',
      color: isFinal ? 'var(--badge-final-text)' : 'var(--badge-initial-text)',
    }}>
      {name ?? '—'}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <section style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: '10px', padding: '20px 24px', marginBottom: '16px',
    }}>
      <h2 style={{
        fontSize: '13px', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.04em', color: 'var(--color-text-secondary)', margin: '0 0 16px',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function FieldGrid({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '14px 24px',
    }}>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  const isAbsent = value === ABSENT || value === NOT_CALCULABLE || value === DEPOSITO_ASSENTE
  return (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--color-text-muted)', marginBottom: '3px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', color: isAbsent ? 'var(--color-text-muted)' : 'var(--color-text)', fontStyle: isAbsent ? 'italic' : 'normal' }}>
        {value}
      </div>
    </div>
  )
}

// ---------- Differenze importi (S6.2) ----------

// Sottoblocco calcolato della sezione Importi. Valori derivati al volo (non
// persistiti); operando mancante → "Non calcolabile" (mai NaN).
function ImportiDifferences({ practice }: { practice: PracticeDetail }): React.JSX.Element {
  const d = computeImportoDifferences(practice)
  return (
    <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
        Differenze
      </div>
      <FieldGrid>
        <Field label="Riduzione (richiesto − concesso)" value={formatImportoCalc(d.riduzioneRichiestoConcesso)} />
        <Field label="% riduzione" value={formatPercentuale(d.percentualeRiduzione)} />
        <Field label="Concesso − fatturato" value={formatImportoCalc(d.diffConcessoFatturato)} />
        <Field label="Fatturato − liquidato" value={formatImportoCalc(d.diffFatturatoLiquidato)} />
        <Field label="Concesso − liquidato" value={formatImportoCalc(d.diffConcessoLiquidato)} />
      </FieldGrid>
    </div>
  )
}

// ---------- Sezioni della pratica ----------

function CustomFieldsSection({ practice }: { practice: PracticeDetail }): React.JSX.Element {
  const { data: fields } = useFields({ scope: 'general' })
  const { data: menuSets } = useMenuSets()

  const activeFields = (fields ?? []).filter(f => f.isActive)
  const sets = menuSets ?? []

  // Chiavi presenti in customValues ma senza definizione campo attiva (es. campo
  // poi disattivato/eliminato): le mostro comunque per non nascondere dati.
  const knownKeys = new Set(activeFields.map(f => f.key))
  const orphanKeys = Object.keys(practice.customValues).filter(k => !knownKeys.has(k))

  if (activeFields.length === 0 && orphanKeys.length === 0) {
    return (
      <Section title="Campi personalizzati">
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
          Nessun campo personalizzato generale configurato.
        </p>
      </Section>
    )
  }

  return (
    <Section title="Campi personalizzati">
      <FieldGrid>
        {activeFields.map(f => (
          <Field
            key={f.id}
            label={f.label}
            value={resolveCustomValue(f, practice.customValues[f.key], sets)}
          />
        ))}
        {orphanKeys.map(k => (
          <Field key={k} label={k} value={textOrAbsent(String(practice.customValues[k] ?? ''))} />
        ))}
      </FieldGrid>
    </Section>
  )
}

const timelineControlStyle: React.CSSProperties = {
  padding: '7px 10px', fontSize: '13px', borderRadius: '6px',
  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
  color: 'var(--color-text)',
}

function TimelineSection({ history }: { history: PracticeDetailHistoryItem[] }): React.JSX.Element {
  const [filter, setFilter] = useState<TimelineFilterState>(emptyTimelineFilter)

  // Nessun evento registrato: stato vuoto totale, senza barra filtri.
  if (history.length === 0) {
    return (
      <Section title="Storico">
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
          Nessun evento registrato.
        </p>
      </Section>
    )
  }

  const categories = availableTimelineCategories(history)
  const filtered = filterTimeline(history, filter)
  const active = hasActiveTimelineFilter(filter)

  return (
    <Section title="Storico">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
        <input
          type="text"
          value={filter.term}
          onChange={(ev) => setFilter((f) => ({ ...f, term: ev.target.value }))}
          placeholder="Cerca nello storico…"
          aria-label="Cerca nello storico"
          style={{ ...timelineControlStyle, flex: '1 1 200px', minWidth: '160px' }}
        />
        <select
          value={filter.category ?? ''}
          onChange={(ev) =>
            setFilter((f) => ({ ...f, category: ev.target.value === '' ? null : (ev.target.value as TimelineCategoryKey) }))
          }
          aria-label="Filtra per tipo di evento"
          style={timelineControlStyle}
        >
          <option value="">Tutti i tipi</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Da
          <input
            type="date"
            value={filter.from ?? ''}
            onChange={(ev) => setFilter((f) => ({ ...f, from: ev.target.value === '' ? null : ev.target.value }))}
            aria-label="Da data"
            style={timelineControlStyle}
          />
        </label>
        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          A
          <input
            type="date"
            value={filter.to ?? ''}
            onChange={(ev) => setFilter((f) => ({ ...f, to: ev.target.value === '' ? null : ev.target.value }))}
            aria-label="A data"
            style={timelineControlStyle}
          />
        </label>
        {active && (
          <button
            type="button"
            onClick={() => setFilter(emptyTimelineFilter)}
            style={{
              ...timelineControlStyle, cursor: 'pointer', background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Azzera
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
          Nessun evento corrisponde ai filtri.
        </p>
      ) : (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {filtered.map((e, i) => (
            <li
              key={e.id}
              style={{
                display: 'flex', gap: '12px', paddingBottom: i === filtered.length - 1 ? 0 : '14px',
                borderLeft: '2px solid var(--color-border)', marginLeft: '6px', paddingLeft: '16px',
                position: 'relative',
              }}
            >
              <span style={{
                position: 'absolute', left: '-7px', top: '4px', width: '12px', height: '12px',
                borderRadius: '50%', background: 'var(--color-accent)', border: '2px solid var(--color-surface)',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                  {e.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {formatDateTime(e.timestamp)}
                  {e.fromPhaseDisplayName && e.toPhaseDisplayName && (
                    <span> · {e.fromPhaseDisplayName} → {e.toPhaseDisplayName}</span>
                  )}
                  {!e.fromPhaseDisplayName && e.toPhaseDisplayName && (
                    <span> · {e.toPhaseDisplayName}</span>
                  )}
                </div>
                {e.note && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    {e.note}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Section>
  )
}

// ---------- Stati di pagina ----------

const pageStyle: React.CSSProperties = { padding: '32px', maxWidth: '960px' }

function BackLink(): React.JSX.Element {
  return (
    <div style={{ marginBottom: '20px' }}>
      <Link to="/pratiche" style={{ fontSize: '13px', color: 'var(--color-accent)', textDecoration: 'none' }}>
        ← Torna alle pratiche
      </Link>
    </div>
  )
}

export function DettaglioPraticaPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const numericId = id != null && /^\d+$/.test(id) ? Number(id) : null
  const { data: practice, isLoading, isError, error } = usePracticeDetail(numericId)
  const navigate = useNavigate()
  const moveToTrash = useMoveToTrash()
  const restore = useRestoreFromTrash()
  const [editing, setEditing] = useState(false)
  const [trashing, setTrashing] = useState(false)
  const [trashError, setTrashError] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  const handleMoveToTrash = (reason: string): void => {
    if (numericId == null) return
    setTrashError(null)
    moveToTrash.mutate(
      { ids: [numericId], reason },
      {
        onSuccess: () => {
          setTrashing(false)
          navigate('/pratiche')
        },
        onError: (e) => setTrashError(ipcErrorMessage(e)),
      }
    )
  }

  const handleRestore = (): void => {
    if (numericId == null) return
    setRestoreError(null)
    restore.mutate(
      { ids: [numericId] },
      {
        // Resta sul dettaglio: l'invalidazione di ['practice', id] ricarica la
        // vista, il banner sparisce e ricompaiono Modifica/azioni workflow.
        onSuccess: () => setRestoring(false),
        onError: (e) => setRestoreError(ipcErrorMessage(e)),
      }
    )
  }

  if (numericId == null) {
    return (
      <div style={pageStyle}>
        <BackLink />
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Identificativo pratica non valido.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <BackLink />
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Caricamento pratica…</p>
      </div>
    )
  }

  if (isError) {
    const notFound = (error as Error | undefined)?.message?.toLowerCase().includes('non trovata')
    return (
      <div style={pageStyle}>
        <BackLink />
        <div style={{
          padding: '16px', background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
          borderRadius: '8px', fontSize: '13px', color: 'var(--color-error)',
        }}>
          {notFound ? 'Pratica non trovata.' : 'Errore nel caricamento della pratica. Riprova.'}
        </div>
      </div>
    )
  }

  if (!practice) {
    return (
      <div style={pageStyle}>
        <BackLink />
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Pratica non trovata.</p>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <BackLink />

      {/* Intestazione */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              {practice.codiceIstanza}
            </h1>
            <PhaseBadge name={practice.currentPhase.displayName} isFinal={practice.currentPhase.isFinal} />
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {practice.nomeIstanza}
          </div>
        </div>
        {!practice.isTrashed && (
          <div style={{ flexShrink: 0, display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={{
                padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
                border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px',
                fontWeight: 500, cursor: 'pointer',
              }}
            >
              Modifica
            </button>
            <button
              type="button"
              onClick={() => { setTrashError(null); setTrashing(true) }}
              style={{
                padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-destructive)',
                border: '1px solid var(--color-destructive)', borderRadius: '6px', fontSize: '13px',
                fontWeight: 500, cursor: 'pointer',
              }}
            >
              Sposta nel cestino
            </button>
          </div>
        )}
      </div>

      {practice.isTrashed && (
        <div style={{
          marginBottom: '24px', padding: '12px 16px', borderRadius: '8px',
          background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
          color: 'var(--color-error)', fontSize: '13px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>
          <span>Questa pratica è nel cestino. Le azioni di modifica e avanzamento sono disabilitate.</span>
          <button
            type="button"
            onClick={() => { setRestoreError(null); setRestoring(true) }}
            style={{
              flexShrink: 0, padding: '6px 16px', background: 'var(--color-accent)', color: '#fff',
              border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            Ripristina
          </button>
        </div>
      )}

      {editing && (
        <ModificaPraticaModal
          practice={practice}
          onClose={() => setEditing(false)}
          onUpdated={() => setEditing(false)}
        />
      )}

      {trashing && (
        <MoveToTrashModal
          count={1}
          pending={moveToTrash.isPending}
          onConfirm={handleMoveToTrash}
          onClose={() => { if (!moveToTrash.isPending) setTrashing(false) }}
        />
      )}

      {trashError && (
        <div style={{
          marginBottom: '16px', padding: '10px 14px', borderRadius: '8px',
          background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
          color: 'var(--color-error)', fontSize: '13px',
        }}>
          {trashError}
        </div>
      )}

      {restoring && (
        <RestoreFromTrashModal
          count={1}
          pending={restore.isPending}
          onConfirm={handleRestore}
          onClose={() => { if (!restore.isPending) setRestoring(false) }}
        />
      )}

      {restoreError && (
        <div style={{
          marginBottom: '16px', padding: '10px 14px', borderRadius: '8px',
          background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
          color: 'var(--color-error)', fontSize: '13px',
        }}>
          {restoreError}
        </div>
      )}

      {/* Dati generali */}
      <Section title="Dati generali">
        <FieldGrid>
          <Field label="Tipologia attività" value={textOrAbsent(practice.tipologiaAttivita)} />
          <Field label="Data udienza" value={formatDate(practice.dataUdienza)} />
          <Field label="Competenza" value={textOrAbsent(practice.competenza)} />
          <Field label="Autorità giudiziaria" value={textOrAbsent(practice.autoritaGiudiziaria)} />
          <Field
            label="Data deposito"
            value={practice.dataDeposito ? formatDate(practice.dataDeposito) : DEPOSITO_ASSENTE}
          />
          <Field
            label="Giorni dalla data deposito"
            value={formatGiorniDeposito(practice.dataDeposito)}
          />
          <Field label="Modalità deposito" value={textOrAbsent(practice.modalitaDeposito)} />
        </FieldGrid>
        <div style={{ marginTop: '16px' }}>
          <Field label="Note" value={textOrAbsent(practice.note)} />
        </div>
        {practice.pecDepositoDestinatari.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <Field
              label="Destinatari PEC deposito"
              value={practice.pecDepositoDestinatari.join(', ')}
            />
          </div>
        )}
      </Section>

      {/* Soggetti */}
      <Section title="Soggetti">
        <FieldGrid>
          <Field label="Collaboratore" value={textOrAbsent(practice.collaboratoreDenominazione)} />
          <Field label="Professionista" value={textOrAbsent(practice.professionistaDenominazione)} />
        </FieldGrid>
      </Section>

      {/* Importi */}
      <Section title="Importi">
        <FieldGrid>
          <Field label="Richiesto" value={formatImporto(practice.importoRichiesto)} />
          <Field label="Concesso" value={formatImporto(practice.importoConcesso)} />
          <Field label="Fatturato" value={formatImporto(practice.importoFatturato)} />
          <Field label="Liquidato" value={formatImporto(practice.importoLiquidato)} />
        </FieldGrid>
        <ImportiDifferences practice={practice} />
      </Section>

      {/* Campi personalizzati */}
      <CustomFieldsSection practice={practice} />

      {/* Workflow */}
      <Section title="Workflow">
        <FieldGrid>
          <Field label="Fase corrente" value={textOrAbsent(practice.currentPhase.displayName)} />
          {practice.previousPhaseDisplayName && (
            <Field label="Fase di provenienza" value={practice.previousPhaseDisplayName} />
          )}
        </FieldGrid>
        {!practice.isTrashed && (
          <div style={{ marginTop: '18px' }}>
            <WorkflowActions practiceId={practice.id} isFinal={practice.currentPhase.isFinal} />
          </div>
        )}
      </Section>

      {/* Storico */}
      <TimelineSection history={practice.history} />

      {/* Documenti */}
      <DocumentsSection practiceId={practice.id} isTrashed={practice.isTrashed} />
    </div>
  )
}
