import { useState } from 'react'
import type { CollaboratoreListItem } from '../../../../shared/ipc'
import { useAllCollaboratori, useSetCollaboratoreActive } from './useCollaboratori'
import { CollaboratoreFormModal } from './CollaboratoreFormModal'
import { ipcErrorMessage } from '../../../utils/ipcError'
import { AlertModal } from '../../../components/ui/AlertModal'

const sectionStyle: React.CSSProperties = {
  background: 'var(--color-surface)', borderRadius: '10px',
  border: '1px solid var(--color-border)', overflow: 'hidden'
}
const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 20px', borderBottom: '1px solid var(--color-border)'
}
const sectionTitleStyle: React.CSSProperties = {
  fontSize: '15px', fontWeight: 600, color: 'var(--color-text)'
}
const btnPrimaryStyle: React.CSSProperties = {
  padding: '6px 14px', background: 'var(--color-accent)', color: '#fff',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
}
const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontSize: '13px'
}
const thStyle: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px',
  color: 'var(--color-text-secondary)', background: 'var(--color-bg)',
  borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap'
}
const tdStyle: React.CSSProperties = {
  padding: '10px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle'
}
const actionsCellStyle: React.CSSProperties = { ...tdStyle, whiteSpace: 'nowrap', textAlign: 'right' }
const iconBtnStyle: React.CSSProperties = {
  padding: '3px 8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)',
  borderRadius: '5px', fontSize: '12px', cursor: 'pointer',
  color: 'var(--color-text-secondary)', marginRight: '4px'
}
const editBtnStyle: React.CSSProperties    = { ...iconBtnStyle, color: 'var(--color-accent)' }
const deactivateBtnStyle: React.CSSProperties = { ...iconBtnStyle, color: 'var(--color-destructive)' }
const activateBtnStyle: React.CSSProperties   = { ...iconBtnStyle, color: 'var(--color-success)' }
const emptyStyle: React.CSSProperties = {
  padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px'
}
const loadingStyle: React.CSSProperties = { ...emptyStyle, padding: '32px 20px' }
const errorBoxStyle: React.CSSProperties = {
  margin: '16px 20px', padding: '10px 14px', background: 'var(--color-error-bg)',
  border: '1px solid var(--color-error-border)', borderRadius: '6px',
  color: 'var(--color-error)', fontSize: '13px'
}

function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }): React.JSX.Element {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '12px',
      fontSize: '11px', fontWeight: 600, background: bg, color
    }}>
      {children}
    </span>
  )
}

export function CollaboratoriSection(): React.JSX.Element {
  const { data: collaboratori, isLoading, error } = useAllCollaboratori()
  const setActiveMutation = useSetCollaboratoreActive()

  const [createOpen,  setCreateOpen]  = useState(false)
  const [editItem,    setEditItem]    = useState<CollaboratoreListItem | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  function handleToggleActive(item: CollaboratoreListItem): void {
    setAlertMessage(null)
    const action = item.isActive ? 'disattivare' : 'attivare'
    if (!window.confirm(`Vuoi ${action} il collaboratore "${item.denominazione}"?`)) return
    setActiveMutation.mutate(
      { id: item.id, isActive: !item.isActive },
      { onError: (err) => setAlertMessage(ipcErrorMessage(err)) }
    )
  }

  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <span style={sectionTitleStyle}>Collaboratori</span>
        <button style={btnPrimaryStyle} onClick={() => setCreateOpen(true)}>
          + Nuovo collaboratore
        </button>
      </div>

      {isLoading && <div style={loadingStyle}>Caricamento collaboratori…</div>}

      {!isLoading && error && (
        <div style={errorBoxStyle}>
          Impossibile caricare i collaboratori:{' '}
          {error instanceof Error ? error.message : 'Errore sconosciuto'}
        </div>
      )}

      {!isLoading && !error && collaboratori && collaboratori.length === 0 && (
        <div style={emptyStyle}>
          Nessun collaboratore. Creane uno con il pulsante in alto.
        </div>
      )}

      {!isLoading && !error && collaboratori && collaboratori.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Denominazione</th>
              <th style={thStyle}>Cod. interno</th>
              <th style={thStyle}>Stato</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {collaboratori.map((item) => (
              <tr key={item.id} style={{ background: item.isActive ? 'inherit' : 'var(--color-bg)' }}>
                <td style={tdStyle}>
                  <span style={{ color: item.isActive ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: 500 }}>
                    {item.denominazione}
                  </span>
                  {item.nome !== item.denominazione && (
                    <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      ({item.cognome} {item.nome})
                    </span>
                  )}
                </td>
                <td style={tdStyle}>
                  <span style={{ color: item.codiceInterno ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {item.codiceInterno ?? '—'}
                  </span>
                </td>
                <td style={tdStyle}>
                  {item.isActive ? (
                    <Badge bg="var(--badge-active-bg)" color="var(--badge-active-text)">Attivo</Badge>
                  ) : (
                    <Badge bg="var(--badge-inactive-bg)" color="var(--badge-inactive-text)">Inattivo</Badge>
                  )}
                </td>
                <td style={actionsCellStyle}>
                  <button style={editBtnStyle} onClick={() => setEditItem(item)} title="Modifica">
                    Modifica
                  </button>
                  <button
                    style={item.isActive ? deactivateBtnStyle : activateBtnStyle}
                    onClick={() => handleToggleActive(item)}
                    disabled={setActiveMutation.isPending}
                    title={item.isActive ? 'Disattiva' : 'Attiva'}
                  >
                    {item.isActive ? 'Disattiva' : 'Attiva'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {alertMessage && (
        <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}

      {(createOpen || editItem) && (
        <CollaboratoreFormModal
          mode={editItem ? 'edit' : 'create'}
          collaboratore={editItem ?? undefined}
          onClose={() => {
            setCreateOpen(false)
            setEditItem(null)
          }}
        />
      )}
    </div>
  )
}
