import { useMemo, useState } from 'react'
import type { FieldDefListItem, FieldType, ListFieldsFilter } from '../../../../shared/ipc'
import { useFields, useCreateField, useSetFieldActive, useReorderFields, useDeleteField } from './useFields'
import { useAllTransitions } from '../transitions/useTransitions'
import { useMenuSets } from '../menus/useMenus'
import { FieldFormModal } from './FieldFormModal'
import { ipcErrorMessage } from '../../../utils/ipcError'
import { AlertModal } from '../../../components/ui/AlertModal'
import { ConfirmModal } from '../../../components/ui/ConfirmModal'

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  testo_breve: 'Testo breve',
  testo_lungo: 'Testo lungo',
  numero: 'Numero',
  importo: 'Importo',
  data: 'Data',
  menu: 'Menu a tendina',
  si_no: 'Sì / No',
  note: 'Note',
  file: 'File',
  pec: 'PEC (destinatari)'
}

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

const headerActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center'
}

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  padding: '12px 20px',
  borderBottom: '1px solid var(--color-border)',
  background: 'var(--color-bg)'
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '5px 14px',
  borderRadius: '6px',
  border: active ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
  background: active ? 'var(--color-accent)' : 'var(--color-surface)',
  color: active ? '#fff' : 'var(--color-text)',
  fontSize: '13px',
  fontWeight: active ? 600 : 400,
  cursor: 'pointer'
})

const transitionSelectorStyle: React.CSSProperties = {
  padding: '12px 20px',
  borderBottom: '1px solid var(--color-border)',
  background: 'var(--color-bg)'
}

const selectStyle: React.CSSProperties = {
  padding: '7px 10px',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '13px',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  outline: 'none',
  cursor: 'pointer',
  minWidth: '320px'
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
const deactivateBtnStyle: React.CSSProperties = {
  ...iconBtnStyle,
  color: 'var(--color-destructive)'
}
const activateBtnStyle: React.CSSProperties = { ...iconBtnStyle, color: 'var(--color-success)' }
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

const btnSecondaryStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '13px',
  cursor: 'pointer'
}

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

// ---------- FieldsTable ----------

interface FieldsTableProps {
  fields: FieldDefListItem[]
  scope: 'general' | 'transition'
  transitionId: number | null
  onEdit: (f: FieldDefListItem) => void
  onMoveUp: (idx: number) => void
  onMoveDown: (idx: number) => void
  onToggleActive: (f: FieldDefListItem) => void
  onDelete: (f: FieldDefListItem) => void
  isReordering: boolean
  isTogglingId: number | null
}

function FieldsTable({
  fields,
  scope,
  transitionId,
  onEdit,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onDelete,
  isReordering,
  isTogglingId
}: FieldsTableProps): React.JSX.Element {
  if (fields.length === 0) {
    const ctx = scope === 'general' ? 'generali' : 'per questa transizione'
    return (
      <div style={emptyStyle}>
        Nessun campo configurabile {ctx}. Aggiungine uno con il pulsante &ldquo;+ Aggiungi
        campo&rdquo;.
      </div>
    )
  }

  void transitionId

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Etichetta</th>
          <th style={thStyle}>Tipo</th>
          <th style={thStyle}>Chiave</th>
          <th style={thStyle}>Badge</th>
          <th style={thStyle}>Stato</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Azioni</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((f, idx) => (
          <tr key={f.id} style={{ background: f.isActive ? 'inherit' : 'var(--color-bg)' }}>
            <td style={tdStyle}>
              <span
                style={{ color: f.isActive ? 'var(--color-text)' : 'var(--color-text-muted)' }}
              >
                {f.label}
              </span>
            </td>
            <td style={{ ...tdStyle, color: 'var(--color-text-secondary)' }}>
              {FIELD_TYPE_LABELS[f.type]}
              {f.menuSetLabel && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                  {' '}
                  ({f.menuSetLabel})
                </span>
              )}
            </td>
            <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
              {f.key}
            </td>
            <td style={tdStyle}>
              {f.type === 'pec' && (
                <Badge bg="#dbeafe" color="#1d4ed8">
                  PEC
                </Badge>
              )}
              {f.conditionalOnFieldId != null && (
                <Badge bg="#fef3c7" color="#92400e">
                  se {f.conditionalOnFieldLabel ?? `#${f.conditionalOnFieldId}`} ={' '}
                  {f.conditionalValue}
                </Badge>
              )}
              {f.required && (
                <Badge bg="var(--badge-initial-bg)" color="var(--badge-initial-text)">
                  Obbligatorio
                </Badge>
              )}
            </td>
            <td style={tdStyle}>
              {f.isActive ? (
                <Badge bg="var(--badge-active-bg)" color="var(--badge-active-text)">
                  Attivo
                </Badge>
              ) : (
                <Badge bg="var(--badge-inactive-bg)" color="var(--badge-inactive-text)">
                  Inattivo
                </Badge>
              )}
            </td>
            <td style={actionsCellStyle}>
              <button style={editBtnStyle} onClick={() => onEdit(f)} title="Modifica">
                Modifica
              </button>
              <button
                style={idx === 0 ? iconBtnDisabledStyle : iconBtnStyle}
                disabled={idx === 0 || isReordering}
                onClick={() => onMoveUp(idx)}
                title="Sposta su"
              >
                ▲
              </button>
              <button
                style={idx === fields.length - 1 ? iconBtnDisabledStyle : iconBtnStyle}
                disabled={idx === fields.length - 1 || isReordering}
                onClick={() => onMoveDown(idx)}
                title="Sposta giù"
              >
                ▼
              </button>
              <button
                style={f.isActive ? deactivateBtnStyle : activateBtnStyle}
                onClick={() => onToggleActive(f)}
                disabled={isTogglingId === f.id}
                title={f.isActive ? 'Disattiva' : 'Attiva'}
              >
                {f.isActive ? 'Disattiva' : 'Attiva'}
              </button>
              <button
                style={{ ...editBtnStyle, color: 'var(--color-destructive)' }}
                onClick={() => onDelete(f)}
                title="Elimina"
              >
                Elimina
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ---------- Main component ----------

export function FieldsSection(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'general' | 'transition'>('general')
  const [selectedTransitionId, setSelectedTransitionId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editField, setEditField] = useState<FieldDefListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FieldDefListItem | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [pecNote, setPecNote] = useState<string | null>(null)
  const deleteMutation = useDeleteField()

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

  const { data: transitions, isLoading: tLoading } = useAllTransitions()
  const { data: menuSets, isLoading: msLoading } = useMenuSets()

  const fieldsFilter: ListFieldsFilter | undefined = useMemo(() => {
    if (activeTab === 'general') return { scope: 'general' }
    if (selectedTransitionId != null) return { scope: 'transition', transitionId: selectedTransitionId }
    return undefined
  }, [activeTab, selectedTransitionId])

  const fieldsEnabled = activeTab === 'general' || selectedTransitionId != null

  const {
    data: fields,
    isLoading: fLoading,
    error: fError
  } = useFields(fieldsFilter, fieldsEnabled)

  const setActiveMutation = useSetFieldActive()
  const reorderMutation = useReorderFields()
  const createMutation = useCreateField()

  const transitionGroups = useMemo(() => {
    if (!transitions) return []
    const map = new Map<
      number,
      { phaseId: number; phaseDisplayName: string; phaseOrder: number; items: typeof transitions }
    >()
    for (const t of transitions) {
      if (!map.has(t.fromPhaseId)) {
        map.set(t.fromPhaseId, {
          phaseId: t.fromPhaseId,
          phaseDisplayName: t.fromPhaseDisplayName,
          phaseOrder: t.fromPhaseOrder,
          items: []
        })
      }
      map.get(t.fromPhaseId)!.items.push(t)
    }
    return Array.from(map.values()).sort((a, b) => a.phaseOrder - b.phaseOrder)
  }, [transitions])

  function handleMoveUp(idx: number): void {
    if (!fields || idx === 0) return
    const prev = fields[idx - 1]
    const curr = fields[idx]
    setInlineError(null)
    reorderMutation.mutate(
      [
        { id: curr.id, order: prev.order },
        { id: prev.id, order: curr.order }
      ],
      { onError: (err) => setInlineError(ipcErrorMessage(err)) }
    )
  }

  function handleMoveDown(idx: number): void {
    if (!fields || idx === fields.length - 1) return
    const curr = fields[idx]
    const next = fields[idx + 1]
    setInlineError(null)
    reorderMutation.mutate(
      [
        { id: curr.id, order: next.order },
        { id: next.id, order: curr.order }
      ],
      { onError: (err) => setInlineError(ipcErrorMessage(err)) }
    )
  }

  function handleToggleActive(f: FieldDefListItem): void {
    const action = f.isActive ? 'disattivare' : 'attivare'
    if (!window.confirm(`Vuoi ${action} il campo "${f.label}"?`)) return
    setInlineError(null)
    setPecNote(null)
    setTogglingId(f.id)
    setActiveMutation.mutate(
      { id: f.id, isActive: !f.isActive },
      {
        onSuccess: (res) => {
          setTogglingId(null)
          if (res.warning) setPecNote(res.warning)
        },
        onError: (err) => {
          setTogglingId(null)
          setInlineError(ipcErrorMessage(err))
        }
      }
    )
  }

  // Convenience: add PEC conditional block in one click
  function handleAddPecBlock(): void {
    if (!fields || !menuSets || selectedTransitionId == null) return
    setPecNote(null)
    setInlineError(null)

    // Find an active menu field in this container
    const menuFields = fields.filter((f) => f.type === 'menu' && f.isActive)
    if (menuFields.length === 0) {
      setPecNote(
        'Nessun campo menu a tendina trovato in questa transizione. Aggiungi prima un campo menu (es. "Modalità invio") con un\'opzione il cui valore indichi PEC.'
      )
      return
    }

    // Find the first menu field whose set has an active option with value='pec' (case-insensitive)
    // or label='pec' (case-insensitive)
    let targetFieldId: number | null = null
    let targetValue: string | null = null

    for (const mf of menuFields) {
      if (mf.menuSetId == null) continue
      const ms = menuSets.find((s) => s.id === mf.menuSetId)
      if (!ms) continue
      const pecOption = ms.options.find(
        (o) =>
          o.isActive &&
          (o.value.toLowerCase() === 'pec' || o.label.toLowerCase() === 'pec')
      )
      if (pecOption) {
        targetFieldId = mf.id
        targetValue = pecOption.value
        break
      }
    }

    if (targetFieldId == null || targetValue == null) {
      setPecNote(
        'Nessun campo menu ha un\'opzione con valore o etichetta "pec". ' +
          'Aggiungi prima un\'opzione PEC al menu set del campo modalità, poi riprova.'
      )
      return
    }

    createMutation.mutate(
      {
        scope: 'transition',
        transitionId: selectedTransitionId,
        label: 'Destinatari PEC',
        type: 'pec',
        required: false,
        visibleInTable: false,
        usableInFilter: false,
        includeInExport: false,
        menuSetId: null,
        pecContext: null,
        conditionalOnFieldId: targetFieldId,
        conditionalValue: targetValue
      },
      {
        onSuccess: () =>
          setPecNote('Campo PEC aggiunto con la condizione impostata automaticamente.'),
        onError: (err) => setInlineError(ipcErrorMessage(err))
      }
    )
  }

  const modalScope: 'general' | 'transition' = activeTab
  const modalTransitionId = activeTab === 'transition' ? selectedTransitionId : null

  const showModal = (createOpen || editField != null) && menuSets != null

  const showAddField = activeTab === 'general' || selectedTransitionId != null
  const showPecButton =
    activeTab === 'transition' && selectedTransitionId != null && !createMutation.isPending

  return (
    <div style={sectionStyle}>
      {/* Header */}
      <div style={sectionHeaderStyle}>
        <span style={sectionTitleStyle}>Campi configurabili</span>
        <div style={headerActionsStyle}>
          {showPecButton && (
            <button
              style={btnSecondaryStyle}
              onClick={handleAddPecBlock}
              disabled={createMutation.isPending}
              title="Crea automaticamente un campo PEC condizionato al campo menu PEC di questa transizione"
            >
              + Blocco PEC condizionale
            </button>
          )}
          {showAddField && (
            <button style={btnPrimaryStyle} onClick={() => { setCreateOpen(true); setPecNote(null) }}>
              + Aggiungi campo
            </button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={tabBarStyle}>
        <button style={tabStyle(activeTab === 'general')} onClick={() => setActiveTab('general')}>
          Campi generali
        </button>
        <button
          style={tabStyle(activeTab === 'transition')}
          onClick={() => setActiveTab('transition')}
        >
          Campi per transizione
        </button>
      </div>

      {/* Transition selector (tab=transition only) */}
      {activeTab === 'transition' && (
        <div style={transitionSelectorStyle}>
          {tLoading ? (
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Caricamento transizioni…
            </span>
          ) : (
            <select
              style={selectStyle}
              value={selectedTransitionId ?? ''}
              onChange={(e) =>
                setSelectedTransitionId(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">— Seleziona una transizione —</option>
              {transitionGroups.map((group) => (
                <optgroup key={group.phaseId} label={group.phaseDisplayName}>
                  {group.items.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.buttonLabel || '(automatica)'}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </div>
      )}

      {/* PEC convenience note */}
      {pecNote && (
        <div
          style={{
            padding: '10px 20px',
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            fontSize: '12px'
          }}
        >
          {pecNote}
        </div>
      )}

      {/* Content */}
      {activeTab === 'transition' && selectedTransitionId == null ? (
        <div style={emptyStyle}>
          Seleziona una transizione per visualizzare e gestire i suoi campi.
        </div>
      ) : (
        <>
          {(fLoading || msLoading) && (
            <div style={loadingStyle}>Caricamento campi…</div>
          )}

          {!fLoading && fError && (
            <div style={errorBoxStyle}>
              Impossibile caricare i campi:{' '}
              {fError instanceof Error ? fError.message : 'Errore sconosciuto'}
            </div>
          )}

          {!fLoading && !fError && fields != null && (
            <FieldsTable
              fields={fields}
              scope={modalScope}
              transitionId={modalTransitionId}
              onEdit={(f) => setEditField(f)}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onToggleActive={handleToggleActive}
              onDelete={(f) => setDeleteTarget(f)}
              isReordering={reorderMutation.isPending}
              isTogglingId={togglingId}
            />
          )}
        </>
      )}

      {inlineError && <div style={inlineErrorStyle}>{inlineError}</div>}

      {alertMessage && (
        <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Elimina campo"
          message={<>Vuoi eliminare il campo «{deleteTarget.label}»? I valori già salvati nelle pratiche restano invariati. L&apos;operazione è irreversibile.</>}
          confirmLabel={deleteMutation.isPending ? 'Eliminazione…' : 'Elimina'}
          pending={deleteMutation.isPending}
          destructive
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {showModal && (
        <FieldFormModal
          mode={editField ? 'edit' : 'create'}
          scope={modalScope}
          transitionId={modalTransitionId}
          field={editField ?? undefined}
          menuSets={menuSets!}
          containerFields={fields ?? []}
          onClose={() => {
            setCreateOpen(false)
            setEditField(null)
          }}
        />
      )}
    </div>
  )
}
