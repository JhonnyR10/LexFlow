import { useState } from 'react'
import type { PhaseListItem, PhaseCategory } from '../../../../shared/ipc'
import { useAllPhases, useSetPhaseActive, useReorderPhases } from './usePhases'
import { PhaseFormModal } from './PhaseFormModal'
import { ipcErrorMessage } from '../../../utils/ipcError'

const CATEGORY_LABELS: Record<PhaseCategory, string> = {
  deposited: 'Depositata',
  awaiting_decree: 'In attesa di decreto',
  awaiting_integration: 'In attesa di integrazione',
  decree_received: 'Decreto ricevuto',
  awaiting_correction: 'In attesa di correzione',
  awaiting_appeal: 'In attesa di impugnazione',
  awaiting_liquidation: 'In attesa di liquidazione',
  awaiting_integration_scp: 'In attesa di integrazione SCP',
  liquidated: 'Liquidata',
  closed: 'Chiusa',
  refused: 'Rifiutata',
  suspended: 'Sospesa',
  annulled: 'Annullata',
  custom: 'Personalizzata'
}

const sectionStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: '10px',
  border: '1px solid var(--color-border)',
  overflow: 'hidden'
}

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid var(--color-border)'
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--color-text)'
}

const btnPrimaryStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: 'var(--color-accent)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer'
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px'
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '12px',
  color: 'var(--color-text-secondary)',
  background: 'var(--color-bg)',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap'
}

const tdStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'middle'
}

const stateCellStyle: React.CSSProperties = {
  ...tdStyle,
  padding: '10px 12px'
}

const actionsCellStyle: React.CSSProperties = {
  ...tdStyle,
  whiteSpace: 'nowrap'
}

const iconBtnStyle: React.CSSProperties = {
  padding: '3px 8px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: '5px',
  fontSize: '12px',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
  marginRight: '4px'
}

const iconBtnDisabledStyle: React.CSSProperties = {
  ...iconBtnStyle,
  opacity: 0.35,
  cursor: 'not-allowed'
}

const editBtnStyle: React.CSSProperties = {
  ...iconBtnStyle,
  color: 'var(--color-accent)'
}

const deactivateBtnStyle: React.CSSProperties = {
  ...iconBtnStyle,
  color: 'var(--color-destructive)'
}

const activateBtnStyle: React.CSSProperties = {
  ...iconBtnStyle,
  color: 'var(--color-success)'
}

const emptyStyle: React.CSSProperties = {
  padding: '40px 20px',
  textAlign: 'center',
  color: 'var(--color-text-muted)',
  fontSize: '13px'
}

const loadingStyle: React.CSSProperties = {
  padding: '32px 20px',
  textAlign: 'center',
  color: 'var(--color-text-muted)',
  fontSize: '13px'
}

const errorBoxStyle: React.CSSProperties = {
  margin: '16px 20px',
  padding: '10px 14px',
  background: 'var(--color-error-bg)',
  border: '1px solid var(--color-error-border)',
  borderRadius: '6px',
  color: 'var(--color-error)',
  fontSize: '13px'
}

const inlineErrorStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: 'var(--color-error-bg)',
  borderTop: '1px solid var(--color-error-border)',
  color: 'var(--color-error)',
  fontSize: '13px'
}

function Badge({
  children,
  bg,
  color
}: {
  children: React.ReactNode
  bg: string
  color: string
}): React.JSX.Element {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        background: bg,
        color
      }}
    >
      {children}
    </span>
  )
}

export function PhasesSection(): React.JSX.Element {
  const { data: phases, isLoading, error } = useAllPhases()
  const setActiveMutation = useSetPhaseActive()
  const reorderMutation = useReorderPhases()

  const [createOpen, setCreateOpen] = useState(false)
  const [editPhase, setEditPhase] = useState<PhaseListItem | null>(null)
  const [inlineError, setInlineError] = useState<string | null>(null)

  function handleMoveUp(idx: number): void {
    if (!phases || idx === 0) return
    const prev = phases[idx - 1]
    const curr = phases[idx]
    setInlineError(null)
    reorderMutation.mutate(
      [
        { id: curr.id, order: prev.order },
        { id: prev.id, order: curr.order }
      ],
      {
        onError: (err) =>
          setInlineError(ipcErrorMessage(err))
      }
    )
  }

  function handleMoveDown(idx: number): void {
    if (!phases || idx === phases.length - 1) return
    const curr = phases[idx]
    const next = phases[idx + 1]
    setInlineError(null)
    reorderMutation.mutate(
      [
        { id: curr.id, order: next.order },
        { id: next.id, order: curr.order }
      ],
      {
        onError: (err) =>
          setInlineError(ipcErrorMessage(err))
      }
    )
  }

  function handleToggleActive(phase: PhaseListItem): void {
    setInlineError(null)
    const action = phase.isActive ? 'disattivare' : 'attivare'
    if (!window.confirm(`Vuoi ${action} la fase "${phase.displayName}"?`)) return

    setActiveMutation.mutate(
      { id: phase.id, isActive: !phase.isActive },
      {
        onError: (err) =>
          setInlineError(ipcErrorMessage(err))
      }
    )
  }

  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <span style={sectionTitleStyle}>Fasi del workflow</span>
        <button style={btnPrimaryStyle} onClick={() => setCreateOpen(true)}>
          + Aggiungi fase
        </button>
      </div>

      {isLoading && <div style={loadingStyle}>Caricamento fasi…</div>}

      {!isLoading && error && (
        <div style={errorBoxStyle}>
          Impossibile caricare le fasi:{' '}
          {error instanceof Error ? error.message : 'Errore sconosciuto'}
        </div>
      )}

      {!isLoading && !error && phases && phases.length === 0 && (
        <div style={emptyStyle}>Nessuna fase configurata.</div>
      )}

      {!isLoading && !error && phases && phases.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Categoria</th>
              <th style={thStyle}>Iniziale</th>
              <th style={thStyle}>Finale</th>
              <th style={thStyle}>Stato</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((phase, idx) => (
              <tr
                key={phase.id}
                style={{ background: phase.isActive ? 'inherit' : 'var(--color-bg)' }}
              >
                <td style={tdStyle}>
                  <span style={{ color: phase.isActive ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {phase.displayName}
                  </span>
                  <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {phase.key}
                  </span>
                </td>
                <td style={tdStyle}>{CATEGORY_LABELS[phase.category]}</td>
                <td style={stateCellStyle}>
                  {phase.isInitial && (
                    <Badge bg="var(--badge-initial-bg)" color="var(--badge-initial-text)">
                      Iniziale
                    </Badge>
                  )}
                </td>
                <td style={stateCellStyle}>
                  {phase.isFinal && (
                    <Badge bg="var(--badge-final-bg)" color="var(--badge-final-text)">
                      Finale
                    </Badge>
                  )}
                </td>
                <td style={stateCellStyle}>
                  {phase.isActive ? (
                    <Badge bg="var(--badge-active-bg)" color="var(--badge-active-text)">
                      Attiva
                    </Badge>
                  ) : (
                    <Badge bg="var(--badge-inactive-bg)" color="var(--badge-inactive-text)">
                      Inattiva
                    </Badge>
                  )}
                </td>
                <td style={{ ...actionsCellStyle, textAlign: 'right' }}>
                  <button style={editBtnStyle} onClick={() => setEditPhase(phase)} title="Modifica">
                    Modifica
                  </button>
                  <button
                    style={idx === 0 ? iconBtnDisabledStyle : iconBtnStyle}
                    disabled={idx === 0 || reorderMutation.isPending}
                    onClick={() => handleMoveUp(idx)}
                    title="Sposta su"
                  >
                    ▲
                  </button>
                  <button
                    style={idx === phases.length - 1 ? iconBtnDisabledStyle : iconBtnStyle}
                    disabled={idx === phases.length - 1 || reorderMutation.isPending}
                    onClick={() => handleMoveDown(idx)}
                    title="Sposta giù"
                  >
                    ▼
                  </button>
                  <button
                    style={phase.isActive ? deactivateBtnStyle : activateBtnStyle}
                    onClick={() => handleToggleActive(phase)}
                    disabled={setActiveMutation.isPending}
                    title={phase.isActive ? 'Disattiva' : 'Attiva'}
                  >
                    {phase.isActive ? 'Disattiva' : 'Attiva'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {inlineError && <div style={inlineErrorStyle}>{inlineError}</div>}

      {(createOpen || editPhase) && (
        <PhaseFormModal
          mode={editPhase ? 'edit' : 'create'}
          phase={editPhase ?? undefined}
          onClose={() => {
            setCreateOpen(false)
            setEditPhase(null)
          }}
        />
      )}
    </div>
  )
}
