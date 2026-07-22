import { useMemo, useState } from 'react'
import type { TransitionListItem } from '../../../../shared/ipc'
import { useAllTransitions, useSetTransitionActive, useReorderTransitions, useDeleteTransition } from './useTransitions'
import { useAllPhases } from '../phases/usePhases'
import { TransitionFormModal } from './TransitionFormModal'
import { ipcErrorMessage } from '../../../utils/ipcError'
import { AlertModal } from '../../../components/ui/AlertModal'
import { ConfirmModal } from '../../../components/ui/ConfirmModal'

// ---------- Styles ----------

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
  color: 'var(--color-on-accent)',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer'
}

const groupHeaderStyle: React.CSSProperties = {
  padding: '8px 20px',
  background: 'var(--color-bg)',
  borderBottom: '1px solid var(--color-border)',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px'
}

const thStyle: React.CSSProperties = {
  padding: '8px 14px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '11px',
  color: 'var(--color-text-secondary)',
  background: 'var(--color-bg)',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap'
}

const tdStyle: React.CSSProperties = {
  padding: '9px 14px',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'middle'
}

const actionsCellStyle: React.CSSProperties = {
  ...tdStyle,
  whiteSpace: 'nowrap',
  textAlign: 'right'
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

const editBtnStyle: React.CSSProperties = { ...iconBtnStyle, color: 'var(--color-accent)' }
const deactivateBtnStyle: React.CSSProperties = { ...iconBtnStyle, color: 'var(--color-destructive)' }
const activateBtnStyle: React.CSSProperties = { ...iconBtnStyle, color: 'var(--color-success)' }

const loadingStyle: React.CSSProperties = {
  padding: '32px 20px',
  textAlign: 'center',
  color: 'var(--color-text-muted)',
  fontSize: '13px'
}

const emptyStyle: React.CSSProperties = {
  padding: '24px 20px',
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

const badgeBase: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 7px',
  borderRadius: '10px',
  fontSize: '11px',
  fontWeight: 600,
  marginRight: '4px'
}

// ---------- Badge ----------

function Badge({
  children,
  bg,
  color
}: {
  children: React.ReactNode
  bg: string
  color: string
}): React.JSX.Element {
  return <span style={{ ...badgeBase, background: bg, color }}>{children}</span>
}

// ---------- Destination label ----------

function destinationLabel(t: TransitionListItem): string {
  if (t.isResume) return '↩ fase di provenienza'
  if (t.toPhaseId == null) return '—'
  if (t.toPhaseId === t.fromPhaseId) return '(resta nella fase)'
  return t.toPhaseDisplayName ?? '—'
}

// ---------- Group type ----------

interface TransitionGroup {
  fromPhaseId: number
  fromPhaseDisplayName: string
  fromPhaseOrder: number
  transitions: TransitionListItem[]
}

// ---------- Component ----------

export function TransitionsSection(): React.JSX.Element {
  const { data: transitions, isLoading: tLoading, error: tError } = useAllTransitions()
  const { data: phases, isLoading: pLoading } = useAllPhases()
  const setActiveMutation = useSetTransitionActive()
  const reorderMutation = useReorderTransitions()
  const deleteMutation = useDeleteTransition()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTransition, setEditTransition] = useState<TransitionListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TransitionListItem | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [inlineError, setInlineError] = useState<string | null>(null)

  function handleConfirmDelete(): void {
    if (!deleteTarget) return
    deleteMutation.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => setDeleteTarget(null),
        onError: (err) => { setDeleteTarget(null); setAlertMessage(ipcErrorMessage(err)) },
      }
    )
  }

  const isLoading = tLoading || pLoading

  const groups = useMemo<TransitionGroup[]>(() => {
    if (!transitions) return []
    const map = new Map<number, TransitionGroup>()
    for (const t of transitions) {
      if (!map.has(t.fromPhaseId)) {
        map.set(t.fromPhaseId, {
          fromPhaseId: t.fromPhaseId,
          fromPhaseDisplayName: t.fromPhaseDisplayName,
          fromPhaseOrder: t.fromPhaseOrder,
          transitions: []
        })
      }
      map.get(t.fromPhaseId)!.transitions.push(t)
    }
    return Array.from(map.values()).sort((a, b) => a.fromPhaseOrder - b.fromPhaseOrder)
  }, [transitions])

  function handleMoveUp(groupTransitions: TransitionListItem[], idx: number): void {
    if (idx === 0) return
    const prev = groupTransitions[idx - 1]
    const curr = groupTransitions[idx]
    setInlineError(null)
    reorderMutation.mutate(
      [
        { id: curr.id, order: prev.order },
        { id: prev.id, order: curr.order }
      ],
      { onError: (err) => setInlineError(ipcErrorMessage(err)) }
    )
  }

  function handleMoveDown(groupTransitions: TransitionListItem[], idx: number): void {
    if (idx === groupTransitions.length - 1) return
    const curr = groupTransitions[idx]
    const next = groupTransitions[idx + 1]
    setInlineError(null)
    reorderMutation.mutate(
      [
        { id: curr.id, order: next.order },
        { id: next.id, order: curr.order }
      ],
      { onError: (err) => setInlineError(ipcErrorMessage(err)) }
    )
  }

  function handleToggleActive(t: TransitionListItem): void {
    setInlineError(null)
    const action = t.isActive ? 'disattivare' : 'attivare'
    const label = t.buttonLabel || '(automatica)'
    if (!window.confirm(`Vuoi ${action} la transizione "${label}"?`)) return
    setActiveMutation.mutate(
      { id: t.id, isActive: !t.isActive },
      { onError: (err) => setInlineError(ipcErrorMessage(err)) }
    )
  }

  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <span style={sectionTitleStyle}>Transizioni del workflow</span>
        <button style={btnPrimaryStyle} onClick={() => setCreateOpen(true)}>
          + Aggiungi transizione
        </button>
      </div>

      {isLoading && <div style={loadingStyle}>Caricamento transizioni…</div>}

      {!isLoading && tError && (
        <div style={errorBoxStyle}>
          Impossibile caricare le transizioni:{' '}
          {tError instanceof Error ? tError.message : 'Errore sconosciuto'}
        </div>
      )}

      {!isLoading && !tError && groups.length === 0 && (
        <div style={emptyStyle}>Nessuna transizione configurata.</div>
      )}

      {!isLoading && !tError && groups.length > 0 && (
        <>
          {groups.map((group) => (
            <div key={group.fromPhaseId}>
              <div style={groupHeaderStyle}>{group.fromPhaseDisplayName}</div>

              {group.transitions.length === 0 ? (
                <div style={emptyStyle}>Nessuna transizione per questa fase.</div>
              ) : (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Etichetta</th>
                      <th style={thStyle}>Destinazione</th>
                      <th style={thStyle}>Flag</th>
                      <th style={thStyle}>Stato</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.transitions.map((t, idx) => (
                      <tr
                        key={t.id}
                        style={{ background: t.isActive ? 'inherit' : 'var(--color-bg)' }}
                      >
                        <td style={tdStyle}>
                          <span
                            style={{
                              color: t.isActive ? 'var(--color-text)' : 'var(--color-text-muted)'
                            }}
                          >
                            {t.buttonLabel || (
                              <em style={{ color: 'var(--color-text-muted)' }}>(automatica)</em>
                            )}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--color-text-secondary)' }}>
                          {destinationLabel(t)}
                        </td>
                        <td style={tdStyle}>
                          {t.isRepeatable && (
                            <Badge bg="var(--badge-custom-bg)" color="var(--badge-custom-text)">
                              Ripetibile
                            </Badge>
                          )}
                          {t.isAutomatic && (
                            <Badge bg="var(--badge-initial-bg)" color="var(--badge-initial-text)">
                              Automatica
                            </Badge>
                          )}
                          {t.isResume && (
                            <Badge bg="var(--badge-final-bg)" color="var(--badge-final-text)">
                              Ripresa
                            </Badge>
                          )}
                        </td>
                        <td style={tdStyle}>
                          {t.isActive ? (
                            <Badge bg="var(--badge-active-bg)" color="var(--badge-active-text)">
                              Attiva
                            </Badge>
                          ) : (
                            <Badge bg="var(--badge-inactive-bg)" color="var(--badge-inactive-text)">
                              Inattiva
                            </Badge>
                          )}
                        </td>
                        <td style={actionsCellStyle}>
                          <button
                            style={editBtnStyle}
                            onClick={() => setEditTransition(t)}
                            title="Modifica"
                          >
                            Modifica
                          </button>
                          <button
                            style={idx === 0 ? iconBtnDisabledStyle : iconBtnStyle}
                            disabled={idx === 0 || reorderMutation.isPending}
                            onClick={() => handleMoveUp(group.transitions, idx)}
                            title="Sposta su"
                          >
                            ▲
                          </button>
                          <button
                            style={
                              idx === group.transitions.length - 1
                                ? iconBtnDisabledStyle
                                : iconBtnStyle
                            }
                            disabled={
                              idx === group.transitions.length - 1 || reorderMutation.isPending
                            }
                            onClick={() => handleMoveDown(group.transitions, idx)}
                            title="Sposta giù"
                          >
                            ▼
                          </button>
                          <button
                            style={t.isActive ? deactivateBtnStyle : activateBtnStyle}
                            onClick={() => handleToggleActive(t)}
                            disabled={setActiveMutation.isPending}
                            title={t.isActive ? 'Disattiva' : 'Attiva'}
                          >
                            {t.isActive ? 'Disattiva' : 'Attiva'}
                          </button>
                          <button
                            style={{ ...editBtnStyle, color: 'var(--color-destructive)' }}
                            onClick={() => setDeleteTarget(t)}
                            disabled={deleteMutation.isPending}
                            title="Elimina"
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </>
      )}

      {inlineError && <div style={inlineErrorStyle}>{inlineError}</div>}

      {alertMessage && (
        <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Elimina transizione"
          message={<>Vuoi eliminare la transizione «{deleteTarget.buttonLabel || '—'}»? Verranno eliminati anche i campi collegati a questa transizione. L&apos;operazione è irreversibile.</>}
          confirmLabel={deleteMutation.isPending ? 'Eliminazione…' : 'Elimina'}
          pending={deleteMutation.isPending}
          destructive
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {(createOpen || editTransition) && phases && (
        <TransitionFormModal
          mode={editTransition ? 'edit' : 'create'}
          transition={editTransition ?? undefined}
          phases={phases}
          onClose={() => {
            setCreateOpen(false)
            setEditTransition(null)
          }}
        />
      )}
    </div>
  )
}
