import { useState } from 'react'
import { z } from 'zod'
import { FIELD_TYPES, PEC_CONTEXTS } from '../../../../shared/ipc'
import type { FieldDefListItem, FieldType, MenuSetListItem, PecContext } from '../../../../shared/ipc'
import { useCreateField, useUpdateField } from './useFields'
import { ipcErrorMessage } from '../../../utils/ipcError'

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

const fieldTypeZod = z.enum(FIELD_TYPES as [FieldType, ...FieldType[]])
const pecContextZod = z.enum(PEC_CONTEXTS as [PecContext, ...PecContext[]])

const PEC_CONTEXT_LABELS: Record<PecContext, string> = {
  deposito: 'Deposito',
  scp: 'SCP',
  altro: 'Altro'
}

const formSchema = z
  .object({
    label: z.string().min(1, "L'etichetta è obbligatoria").max(100, 'Massimo 100 caratteri'),
    type: fieldTypeZod,
    required: z.boolean(),
    visibleInTable: z.boolean(),
    usableInFilter: z.boolean(),
    includeInExport: z.boolean(),
    menuSetId: z.number().int().positive().nullable(),
    pecContext: pecContextZod.nullable(),
    conditionalOnFieldId: z.number().int().positive().nullable(),
    conditionalValue: z.string().nullable()
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'pec' && data.pecContext != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pecContext'],
        message: 'Il contesto PEC è consentito solo per i campi di tipo PEC'
      })
    }
    if (data.type === 'menu' && data.menuSetId == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['menuSetId'],
        message: 'Seleziona un menu set per i campi di tipo menu'
      })
    }
    if (data.type !== 'menu' && data.type !== 'pec' && data.menuSetId != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['menuSetId'],
        message: 'Il menu set è consentito solo per campi di tipo menu'
      })
    }
    if (data.type === 'pec' && data.menuSetId != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['menuSetId'],
        message: 'Il menu set non è consentito per i campi di tipo PEC'
      })
    }
    if ((data.conditionalOnFieldId == null) !== (data.conditionalValue == null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['conditionalOnFieldId'],
        message: 'Seleziona sia il campo controllore sia il valore, oppure lascia entrambi vuoti'
      })
    }
  })

interface Props {
  mode: 'create' | 'edit'
  scope: 'general' | 'transition'
  transitionId: number | null
  field?: FieldDefListItem
  menuSets: MenuSetListItem[]
  containerFields: FieldDefListItem[]
  onClose: () => void
}

// ---------- Styles ----------

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'var(--color-overlay)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}

const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: '10px',
  padding: '28px 32px',
  width: '520px',
  maxWidth: '95vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 8px 32px var(--color-shadow)'
}

const titleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  marginBottom: '20px',
  color: 'var(--color-text)'
}

const fieldStyle: React.CSSProperties = { marginBottom: '16px' }

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '5px',
  color: 'var(--color-text)'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '13px',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  outline: 'none',
  boxSizing: 'border-box'
}

const readonlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  background: 'var(--color-bg)',
  color: 'var(--color-text-secondary)',
  cursor: 'default'
}

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

const hintStyle: React.CSSProperties = {
  marginTop: '4px',
  fontSize: '11px',
  color: 'var(--color-text-muted)'
}

const warnStyle: React.CSSProperties = {
  marginTop: '4px',
  fontSize: '11px',
  color: 'var(--color-warning)'
}

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px'
}

const toggleLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-text)',
  cursor: 'pointer'
}

const toggleLabelDisabledStyle: React.CSSProperties = {
  ...toggleLabelStyle,
  color: 'var(--color-text-muted)',
  cursor: 'default'
}

const errorStyle: React.CSSProperties = {
  marginBottom: '14px',
  padding: '8px 12px',
  background: 'var(--color-error-bg)',
  border: '1px solid var(--color-error-border)',
  borderRadius: '6px',
  color: 'var(--color-error)',
  fontSize: '13px'
}

const footerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
  marginTop: '20px',
  paddingTop: '16px',
  borderTop: '1px solid var(--color-border)'
}

const btnPrimaryStyle: React.CSSProperties = {
  padding: '8px 18px',
  background: 'var(--color-accent)',
  color: 'var(--color-on-accent)',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer'
}

const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '13px',
  cursor: 'pointer'
}

const sectionNoteStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--color-text-muted)',
  fontStyle: 'italic',
  marginBottom: '8px'
}

const conditionalSectionStyle: React.CSSProperties = {
  marginBottom: '16px',
  padding: '12px 14px',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  background: 'var(--color-bg)'
}

const conditionalSectionTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  marginBottom: '10px',
  color: 'var(--color-text)'
}

// ---------- Component ----------

export function FieldFormModal({
  mode,
  scope,
  transitionId,
  field,
  menuSets,
  containerFields,
  onClose
}: Props): React.JSX.Element {
  const isEdit = mode === 'edit' && field != null

  const [label, setLabel] = useState(isEdit ? field.label : '')
  const [type, setType] = useState<FieldType>(isEdit ? field.type : 'testo_breve')
  const [required, setRequired] = useState(isEdit ? field.required : false)
  const [visibleInTable, setVisibleInTable] = useState(isEdit ? field.visibleInTable : false)
  const [usableInFilter, setUsableInFilter] = useState(isEdit ? field.usableInFilter : false)
  const [includeInExport, setIncludeInExport] = useState(isEdit ? field.includeInExport : false)
  const [menuSetId, setMenuSetId] = useState<number | null>(isEdit ? field.menuSetId : null)
  const [pecContext, setPecContext] = useState<PecContext | null>(isEdit ? field.pecContext : null)

  const [conditionalEnabled, setConditionalEnabled] = useState(
    isEdit ? field.conditionalOnFieldId != null : false
  )
  const [conditionalOnFieldId, setConditionalOnFieldId] = useState<number | null>(
    isEdit ? field.conditionalOnFieldId : null
  )
  const [conditionalValue, setConditionalValue] = useState<string | null>(
    isEdit ? field.conditionalValue : null
  )

  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useCreateField()
  const updateMutation = useUpdateField()
  const isPending = createMutation.isPending || updateMutation.isPending

  const setsWithActiveOptions = menuSets.filter((s) => s.options.some((o) => o.isActive))
  const selectedSet = menuSets.find((s) => s.id === menuSetId)
  const selectedSetHasNoActiveOptions =
    selectedSet != null && !selectedSet.options.some((o) => o.isActive)

  // Menu fields in same container (for controller selection), excluding self if edit
  const availableControllers = containerFields.filter(
    (f) =>
      f.type === 'menu' &&
      f.isActive &&
      (mode === 'create' || f.id !== field?.id)
  )
  const hasMenuControllers = availableControllers.length > 0

  const selectedController = availableControllers.find((f) => f.id === conditionalOnFieldId)
  const controllerMenuSet = selectedController
    ? menuSets.find((ms) => ms.id === selectedController.menuSetId)
    : undefined
  const controllerActiveOptions = controllerMenuSet?.options.filter((o) => o.isActive) ?? []

  function handleTypeChange(newType: FieldType): void {
    setType(newType)
    if (newType !== 'menu') setMenuSetId(null)
    if (newType !== 'pec') setPecContext(null)
  }

  function handleConditionalToggle(enabled: boolean): void {
    setConditionalEnabled(enabled)
    if (!enabled) {
      setConditionalOnFieldId(null)
      setConditionalValue(null)
    }
  }

  function handleControllerChange(id: number | null): void {
    setConditionalOnFieldId(id)
    setConditionalValue(null)
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    setFormError(null)

    const effectiveConditionalOnFieldId = conditionalEnabled ? conditionalOnFieldId : null
    const effectiveConditionalValue = conditionalEnabled ? conditionalValue : null

    const result = formSchema.safeParse({
      label,
      type,
      required,
      visibleInTable,
      usableInFilter,
      includeInExport,
      menuSetId,
      pecContext: type === 'pec' ? pecContext : null,
      conditionalOnFieldId: effectiveConditionalOnFieldId,
      conditionalValue: effectiveConditionalValue
    })

    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'Dati non validi')
      return
    }

    if (isEdit) {
      updateMutation.mutate(
        { id: field.id, ...result.data },
        {
          onSuccess: () => onClose(),
          onError: (err) => setFormError(ipcErrorMessage(err))
        }
      )
    } else {
      createMutation.mutate(
        { scope, transitionId, ...result.data },
        {
          onSuccess: () => onClose(),
          onError: (err) => setFormError(ipcErrorMessage(err))
        }
      )
    }
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={dialogStyle}>
        <h2 style={titleStyle}>{isEdit ? 'Modifica campo' : 'Nuovo campo'}</h2>

        <form onSubmit={handleSubmit}>
          {/* Etichetta */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="ff-label">
              Etichetta *
            </label>
            <input
              id="ff-label"
              style={inputStyle}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Es. Data udienza"
              autoFocus={!isEdit}
            />
          </div>

          {/* Key (solo lettura in modifica) */}
          {isEdit && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Chiave tecnica</label>
              <input style={readonlyInputStyle} value={field.key} readOnly />
              <div style={hintStyle}>Immutabile dopo la creazione</div>
            </div>
          )}

          {/* Tipo */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="ff-type">
              Tipo *
            </label>
            <select
              id="ff-type"
              style={selectStyle}
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as FieldType)}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {FIELD_TYPE_LABELS[t]}
                  {t === 'pec' ? '' : ''}
                </option>
              ))}
            </select>
            {type === 'pec' && (
              <div style={hintStyle}>
                Blocco multi-destinatario PEC — mostrato in base alla condizione configurata sotto.
              </div>
            )}
          </div>

          {/* Contesto PEC (solo se type='pec') */}
          {type === 'pec' && (
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="ff-pecContext">
                Contesto PEC
              </label>
              <select
                id="ff-pecContext"
                style={selectStyle}
                value={pecContext ?? ''}
                onChange={(e) => setPecContext(e.target.value ? (e.target.value as PecContext) : null)}
              >
                <option value="">Automatico (dalla fase di destinazione)</option>
                {PEC_CONTEXTS.map((c) => (
                  <option key={c} value={c}>
                    {PEC_CONTEXT_LABELS[c]}
                  </option>
                ))}
              </select>
              <div style={hintStyle}>
                Classifica i destinatari PEC raccolti da questo campo. «Automatico» deriva il contesto
                dalla fase di destinazione della transizione.
              </div>
            </div>
          )}

          {/* Menu set (solo se type='menu') */}
          {type === 'menu' && (
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="ff-menuSet">
                Menu set *
              </label>
              <select
                id="ff-menuSet"
                style={selectStyle}
                value={menuSetId ?? ''}
                onChange={(e) => setMenuSetId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— Seleziona un menu —</option>
                {setsWithActiveOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
                {menuSets
                  .filter((s) => !s.options.some((o) => o.isActive))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} (nessuna opzione attiva)
                    </option>
                  ))}
              </select>
              {selectedSetHasNoActiveOptions && (
                <div style={warnStyle}>
                  Attenzione: il menu set selezionato non ha opzioni attive. Il campo non mostrerà
                  scelte disponibili.
                </div>
              )}
              {setsWithActiveOptions.length === 0 && (
                <div style={warnStyle}>
                  Nessun menu set con opzioni attive. Aggiungine uno nella sezione Menu a tendina.
                </div>
              )}
            </div>
          )}

          {/* Flag */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ ...labelStyle, marginBottom: '8px' }}>Opzioni</label>

            {scope === 'transition' && (
              <div style={sectionNoteStyle}>
                I flag di visibilità (tabella/filtri/export) sono rilevanti soprattutto per i campi
                generali.
              </div>
            )}

            <div style={toggleRowStyle}>
              <input
                type="checkbox"
                id="ff-required"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              />
              <label style={toggleLabelStyle} htmlFor="ff-required">
                Obbligatorio
              </label>
            </div>

            <div style={toggleRowStyle}>
              <input
                type="checkbox"
                id="ff-visibleInTable"
                checked={visibleInTable}
                onChange={(e) => setVisibleInTable(e.target.checked)}
              />
              <label style={toggleLabelStyle} htmlFor="ff-visibleInTable">
                Visibile in tabella
              </label>
            </div>

            <div style={toggleRowStyle}>
              <input
                type="checkbox"
                id="ff-usableInFilter"
                checked={usableInFilter}
                onChange={(e) => setUsableInFilter(e.target.checked)}
              />
              <label style={toggleLabelStyle} htmlFor="ff-usableInFilter">
                Usabile nei filtri
              </label>
            </div>

            <div style={toggleRowStyle}>
              <input
                type="checkbox"
                id="ff-includeInExport"
                checked={includeInExport}
                onChange={(e) => setIncludeInExport(e.target.checked)}
              />
              <label style={toggleLabelStyle} htmlFor="ff-includeInExport">
                Includi nell&apos;export
              </label>
            </div>
          </div>

          {/* Visibilità condizionale */}
          <div style={conditionalSectionStyle}>
            <div style={conditionalSectionTitleStyle}>Visibilità condizionale</div>

            <div style={toggleRowStyle}>
              <input
                type="checkbox"
                id="ff-conditional"
                checked={conditionalEnabled}
                disabled={!hasMenuControllers}
                onChange={(e) => handleConditionalToggle(e.target.checked)}
              />
              <label
                style={hasMenuControllers ? toggleLabelStyle : toggleLabelDisabledStyle}
                htmlFor="ff-conditional"
              >
                Mostra solo a una condizione
              </label>
            </div>

            {!hasMenuControllers && (
              <div style={hintStyle}>
                Serve prima un campo di tipo menu a tendina in questo contenitore per usare una
                condizione.
              </div>
            )}

            {conditionalEnabled && hasMenuControllers && (
              <>
                <div style={{ ...fieldStyle, marginTop: '10px' }}>
                  <label style={labelStyle} htmlFor="ff-controller">
                    Campo controllore *
                  </label>
                  <select
                    id="ff-controller"
                    style={selectStyle}
                    value={conditionalOnFieldId ?? ''}
                    onChange={(e) =>
                      handleControllerChange(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">— Seleziona un campo menu —</option>
                    {availableControllers.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label} ({f.key})
                      </option>
                    ))}
                  </select>
                </div>

                {conditionalOnFieldId != null && (
                  <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="ff-condvalue">
                      Valore *
                    </label>
                    {controllerActiveOptions.length > 0 ? (
                      <select
                        id="ff-condvalue"
                        style={selectStyle}
                        value={conditionalValue ?? ''}
                        onChange={(e) =>
                          setConditionalValue(e.target.value || null)
                        }
                      >
                        <option value="">— Seleziona un valore —</option>
                        {controllerActiveOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label} ({o.value})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={warnStyle}>
                        Il campo controllore selezionato non ha opzioni attive.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {formError && <div style={errorStyle}>{formError}</div>}

          <div style={footerStyle}>
            <button type="button" style={btnSecondaryStyle} onClick={onClose} disabled={isPending}>
              Annulla
            </button>
            <button type="submit" style={btnPrimaryStyle} disabled={isPending}>
              {isPending ? 'Salvataggio…' : isEdit ? 'Salva modifiche' : 'Crea campo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
