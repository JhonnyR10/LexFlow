import { useState } from 'react'
import type { MenuSetListItem, MenuOptionListItem } from '../../../../shared/ipc'
import { useMenuSets, useSetMenuOptionActive, useReorderMenuOptions, useDeleteMenuSet, useDeleteMenuOption } from './useMenus'
import { MenuSetFormModal } from './MenuSetFormModal'
import { MenuOptionFormModal } from './MenuOptionFormModal'
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

const bodyStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  minHeight: '200px'
}

const setListStyle: React.CSSProperties = {
  width: '280px',
  minWidth: '220px',
  borderRight: '1px solid var(--color-border)',
  flexShrink: 0
}

const optionPaneStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '300px'
}

const setItemStyle = (selected: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '10px 16px',
  cursor: 'pointer',
  borderBottom: '1px solid var(--color-border)',
  background: selected ? 'var(--color-accent-light)' : 'transparent',
  borderLeft: selected ? '3px solid var(--color-accent)' : '3px solid transparent'
})

const setLabelStyle = (selected: boolean): React.CSSProperties => ({
  fontSize: '13px',
  fontWeight: selected ? 600 : 400,
  color: 'var(--color-text)'
})

const setMetaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '2px'
}

const setKeyStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--color-text-muted)',
  fontFamily: 'monospace'
}

const optionCountStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--color-text-muted)',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '0 6px'
}

const paneHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  borderBottom: '1px solid var(--color-border)',
  background: 'var(--color-bg)'
}

const paneHeaderTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--color-text-secondary)'
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px'
}

const thStyle: React.CSSProperties = {
  padding: '7px 12px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '11px',
  color: 'var(--color-text-secondary)',
  background: 'var(--color-bg)',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap'
}

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'middle'
}

const actionsCellStyle: React.CSSProperties = {
  ...tdStyle,
  whiteSpace: 'nowrap',
  textAlign: 'right'
}

const btnPrimaryStyle: React.CSSProperties = {
  padding: '5px 12px',
  background: 'var(--color-accent)',
  color: 'var(--color-on-accent)',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer'
}

const iconBtnStyle: React.CSSProperties = {
  padding: '2px 7px',
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
  padding: '24px 16px',
  textAlign: 'center',
  color: 'var(--color-text-muted)',
  fontSize: '13px'
}

const errorBoxStyle: React.CSSProperties = {
  margin: '16px',
  padding: '10px 14px',
  background: 'var(--color-error-bg)',
  border: '1px solid var(--color-error-border)',
  borderRadius: '6px',
  color: 'var(--color-error)',
  fontSize: '13px'
}

const inlineErrorStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: 'var(--color-error-bg)',
  borderTop: '1px solid var(--color-error-border)',
  color: 'var(--color-error)',
  fontSize: '13px'
}

const inlineNoteStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: 'var(--color-bg)',
  borderTop: '1px solid var(--color-border)',
  color: 'var(--color-text-secondary)',
  fontSize: '13px'
}

const noSelectionStyle: React.CSSProperties = {
  padding: '40px 20px',
  textAlign: 'center',
  color: 'var(--color-text-muted)',
  fontSize: '13px',
  fontStyle: 'italic'
}

const badgeBase: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 7px',
  borderRadius: '10px',
  fontSize: '11px',
  fontWeight: 600
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
  return <span style={{ ...badgeBase, background: bg, color }}>{children}</span>
}

// ---------- Component ----------

export function MenusSection(): React.JSX.Element {
  const { data: menuSets, isLoading, error } = useMenuSets()
  const setActiveMutation = useSetMenuOptionActive()
  const reorderMutation = useReorderMenuOptions()
  const deleteSetMutation = useDeleteMenuSet()
  const deleteOptionMutation = useDeleteMenuOption()

  const [selectedSetId, setSelectedSetId] = useState<number | null>(null)
  const [createSetOpen, setCreateSetOpen] = useState(false)
  const [editSet, setEditSet] = useState<MenuSetListItem | null>(null)
  const [createOptionOpen, setCreateOptionOpen] = useState(false)
  const [editOption, setEditOption] = useState<MenuOptionListItem | null>(null)
  const [deleteSetTarget, setDeleteSetTarget] = useState<MenuSetListItem | null>(null)
  const [deleteOptionTarget, setDeleteOptionTarget] = useState<MenuOptionListItem | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [inlineNote, setInlineNote] = useState<string | null>(null)

  const selectedSet = menuSets?.find((s) => s.id === selectedSetId) ?? null

  function handleConfirmDeleteSet(): void {
    if (!deleteSetTarget) return
    const wasSelected = deleteSetTarget.id === selectedSetId
    deleteSetMutation.mutate(
      { id: deleteSetTarget.id },
      {
        onSuccess: () => { setDeleteSetTarget(null); if (wasSelected) setSelectedSetId(null) },
        onError: (err) => { setDeleteSetTarget(null); setAlertMessage(ipcErrorMessage(err)) },
      }
    )
  }

  function handleConfirmDeleteOption(): void {
    if (!deleteOptionTarget) return
    deleteOptionMutation.mutate(
      { id: deleteOptionTarget.id },
      {
        onSuccess: () => setDeleteOptionTarget(null),
        onError: (err) => { setDeleteOptionTarget(null); setAlertMessage(ipcErrorMessage(err)) },
      }
    )
  }

  function handleToggleOptionActive(opt: MenuOptionListItem): void {
    setInlineError(null)
    setInlineNote(null)
    const action = opt.isActive ? 'disattivare' : 'attivare'
    if (!window.confirm(`Vuoi ${action} l'opzione "${opt.label}"?`)) return
    setActiveMutation.mutate(
      { id: opt.id, isActive: !opt.isActive },
      {
        onSuccess: (res) => {
          if (res.warning) setInlineNote(res.warning)
        },
        onError: (err) => setInlineError(ipcErrorMessage(err))
      }
    )
  }

  function handleMoveUp(options: MenuOptionListItem[], idx: number): void {
    if (idx === 0) return
    const prev = options[idx - 1]
    const curr = options[idx]
    setInlineError(null)
    reorderMutation.mutate(
      [
        { id: curr.id, order: prev.order },
        { id: prev.id, order: curr.order }
      ],
      { onError: (err) => setInlineError(ipcErrorMessage(err)) }
    )
  }

  function handleMoveDown(options: MenuOptionListItem[], idx: number): void {
    if (idx === options.length - 1) return
    const curr = options[idx]
    const next = options[idx + 1]
    setInlineError(null)
    reorderMutation.mutate(
      [
        { id: curr.id, order: next.order },
        { id: next.id, order: curr.order }
      ],
      { onError: (err) => setInlineError(ipcErrorMessage(err)) }
    )
  }

  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <span style={sectionTitleStyle}>Menu a tendina</span>
        <button style={btnPrimaryStyle} onClick={() => setCreateSetOpen(true)}>
          + Nuovo set
        </button>
      </div>

      {isLoading && <div style={loadingStyle}>Caricamento menu…</div>}

      {!isLoading && error && (
        <div style={errorBoxStyle}>
          Impossibile caricare i menu:{' '}
          {error instanceof Error ? error.message : 'Errore sconosciuto'}
        </div>
      )}

      {!isLoading && !error && menuSets && (
        <div style={bodyStyle}>
          {/* Left: set list */}
          <div style={setListStyle}>
            {menuSets.length === 0 ? (
              <div style={emptyStyle}>Nessun menu configurato.</div>
            ) : (
              menuSets.map((s) => {
                const activeCount = s.options.filter((o) => o.isActive).length
                const isSelected = s.id === selectedSetId
                return (
                  <div
                    key={s.id}
                    style={setItemStyle(isSelected)}
                    onClick={() => {
                      setSelectedSetId(s.id)
                      setInlineError(null)
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <span style={setLabelStyle(isSelected)}>{s.label}</span>
                      <span style={{ display: 'flex', gap: '4px' }}>
                        <button
                          style={{ ...editBtnStyle, marginRight: 0, fontSize: '11px' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditSet(s)
                          }}
                          title="Rinomina"
                        >
                          Rinomina
                        </button>
                        <button
                          style={{ ...editBtnStyle, marginRight: 0, fontSize: '11px', color: 'var(--color-destructive)' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteSetTarget(s)
                          }}
                          title="Elimina menu"
                        >
                          Elimina
                        </button>
                      </span>
                    </div>
                    <div style={setMetaStyle}>
                      <span style={setKeyStyle}>{s.key}</span>
                      <span style={optionCountStyle}>{activeCount} opz. attive</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right: options pane */}
          <div style={optionPaneStyle}>
            {selectedSet === null ? (
              <div style={noSelectionStyle}>
                Seleziona un menu a sinistra per gestirne le opzioni.
              </div>
            ) : (
              <>
                <div style={paneHeaderStyle}>
                  <span style={paneHeaderTitleStyle}>
                    Opzioni di &ldquo;{selectedSet.label}&rdquo;
                  </span>
                  <button style={btnPrimaryStyle} onClick={() => setCreateOptionOpen(true)}>
                    + Nuova opzione
                  </button>
                </div>

                {selectedSet.options.length === 0 ? (
                  <div style={emptyStyle}>
                    Nessuna opzione. Aggiungine una con &ldquo;+ Nuova opzione&rdquo;.
                  </div>
                ) : (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Etichetta</th>
                        <th style={thStyle}>Valore tecnico</th>
                        <th style={thStyle}>Stato</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSet.options.map((opt, idx) => (
                        <tr
                          key={opt.id}
                          style={{ background: opt.isActive ? 'inherit' : 'var(--color-bg)' }}
                        >
                          <td style={tdStyle}>
                            <span
                              style={{
                                color: opt.isActive ? 'var(--color-text)' : 'var(--color-text-muted)'
                              }}
                            >
                              {opt.label}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {opt.value}
                          </td>
                          <td style={tdStyle}>
                            {opt.isActive ? (
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
                              onClick={() => setEditOption(opt)}
                              title="Modifica etichetta"
                            >
                              Modifica
                            </button>
                            <button
                              style={idx === 0 ? iconBtnDisabledStyle : iconBtnStyle}
                              disabled={idx === 0 || reorderMutation.isPending}
                              onClick={() => handleMoveUp(selectedSet.options, idx)}
                              title="Sposta su"
                            >
                              ▲
                            </button>
                            <button
                              style={
                                idx === selectedSet.options.length - 1
                                  ? iconBtnDisabledStyle
                                  : iconBtnStyle
                              }
                              disabled={
                                idx === selectedSet.options.length - 1 || reorderMutation.isPending
                              }
                              onClick={() => handleMoveDown(selectedSet.options, idx)}
                              title="Sposta giù"
                            >
                              ▼
                            </button>
                            <button
                              style={opt.isActive ? deactivateBtnStyle : activateBtnStyle}
                              onClick={() => handleToggleOptionActive(opt)}
                              disabled={setActiveMutation.isPending}
                              title={opt.isActive ? 'Disattiva' : 'Attiva'}
                            >
                              {opt.isActive ? 'Disattiva' : 'Attiva'}
                            </button>
                            <button
                              style={{ ...editBtnStyle, color: 'var(--color-destructive)' }}
                              onClick={() => setDeleteOptionTarget(opt)}
                              title="Elimina opzione"
                            >
                              Elimina
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {inlineError && <div style={inlineErrorStyle}>{inlineError}</div>}
            {inlineNote && <div style={inlineNoteStyle}>{inlineNote}</div>}
          </div>
        </div>
      )}

      {alertMessage && (
        <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}

      {deleteSetTarget && (
        <ConfirmModal
          title="Elimina menu"
          message={<>Vuoi eliminare il menu «{deleteSetTarget.label}» e tutte le sue {deleteSetTarget.options.length} opzioni? L&apos;operazione è irreversibile.</>}
          confirmLabel={deleteSetMutation.isPending ? 'Eliminazione…' : 'Elimina'}
          pending={deleteSetMutation.isPending}
          destructive
          onConfirm={handleConfirmDeleteSet}
          onClose={() => setDeleteSetTarget(null)}
        />
      )}

      {deleteOptionTarget && (
        <ConfirmModal
          title="Elimina opzione"
          message={<>Vuoi eliminare l&apos;opzione «{deleteOptionTarget.label}»? L&apos;operazione è irreversibile.</>}
          confirmLabel={deleteOptionMutation.isPending ? 'Eliminazione…' : 'Elimina'}
          pending={deleteOptionMutation.isPending}
          destructive
          onConfirm={handleConfirmDeleteOption}
          onClose={() => setDeleteOptionTarget(null)}
        />
      )}

      {createSetOpen && (
        <MenuSetFormModal
          mode="create"
          onClose={() => setCreateSetOpen(false)}
        />
      )}

      {editSet && (
        <MenuSetFormModal
          mode="edit"
          menuSet={editSet}
          onClose={() => setEditSet(null)}
        />
      )}

      {createOptionOpen && selectedSet && (
        <MenuOptionFormModal
          mode="create"
          menuSetId={selectedSet.id}
          onClose={() => setCreateOptionOpen(false)}
        />
      )}

      {editOption && selectedSet && (
        <MenuOptionFormModal
          mode="edit"
          menuSetId={selectedSet.id}
          option={editOption}
          onClose={() => setEditOption(null)}
        />
      )}
    </div>
  )
}
