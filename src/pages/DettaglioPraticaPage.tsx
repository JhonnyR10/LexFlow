import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePracticeDetail } from '../features/practices/usePractices'
import { useFields } from '../features/config/fields/useFields'
import { useMenuSets } from '../features/config/menus/useMenus'
import type {
  PracticeDetail,
  PracticeDetailHistoryItem,
  FieldDefListItem,
  MenuSetListItem,
} from '../../shared/ipc'

// ---------- Helper di formato ----------

const ABSENT = 'Non presente'

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
  const isAbsent = value === ABSENT
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

function TimelineSection({ history }: { history: PracticeDetailHistoryItem[] }): React.JSX.Element {
  if (history.length === 0) {
    return (
      <Section title="Storico">
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
          Nessun evento registrato.
        </p>
      </Section>
    )
  }

  return (
    <Section title="Storico">
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {history.map((e, i) => (
          <li
            key={e.id}
            style={{
              display: 'flex', gap: '12px', paddingBottom: i === history.length - 1 ? 0 : '14px',
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
      <div style={{ marginBottom: '24px' }}>
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

      {/* Dati generali */}
      <Section title="Dati generali">
        <FieldGrid>
          <Field label="Tipologia attività" value={textOrAbsent(practice.tipologiaAttivita)} />
          <Field label="Data udienza" value={formatDate(practice.dataUdienza)} />
          <Field label="Competenza" value={textOrAbsent(practice.competenza)} />
          <Field label="Autorità giudiziaria" value={textOrAbsent(practice.autoritaGiudiziaria)} />
          <Field
            label="Data deposito"
            value={practice.dataDeposito ? formatDate(practice.dataDeposito) : 'Data deposito non presente'}
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
          <Field label="Concesso" value={ABSENT} />
          <Field label="Fatturato" value={ABSENT} />
          <Field label="Liquidato" value={ABSENT} />
        </FieldGrid>
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
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: '14px 0 0' }}>
          Le azioni di avanzamento (pulsanti delle transizioni) saranno disponibili nella prossima storia (S5.2).
        </p>
      </Section>

      {/* Storico */}
      <TimelineSection history={practice.history} />

      {/* Documenti */}
      <Section title="Documenti">
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
          Gestione documenti (decreto, fattura) disponibile in E7.
        </p>
      </Section>
    </div>
  )
}
