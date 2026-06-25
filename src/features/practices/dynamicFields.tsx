import React from 'react'
import { getMenuOptionsBySetId } from './menuHelpers'
import type { FieldDefListItem, MenuSetListItem } from '../../../shared/ipc'

// Campi dinamici condivisi tra il form Nuova pratica (campi generali, S4.2) e il
// form di transizione (campi per transizione, S5.3). Estratti qui per evitare
// duplicazione di logica di rendering e visibilità condizionale.

// ---- Stili (copie locali: i componenti restano autonomi e visivamente identici) ----
const fieldStyle: React.CSSProperties = { marginBottom: '12px' }
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 500,
  marginBottom: '4px', color: 'var(--color-text)'
}
const requiredDot: React.CSSProperties = { color: 'var(--color-error)', marginLeft: '2px' }
const hintStyle: React.CSSProperties = {
  fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px'
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)',
  borderRadius: '6px', fontSize: '13px', color: 'var(--color-text)',
  background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box'
}
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }
const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', minHeight: '72px', fontFamily: 'inherit'
}
const pecRowStyle: React.CSSProperties = {
  display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px'
}
const btnSmallStyle: React.CSSProperties = {
  padding: '4px 10px', border: '1px solid var(--color-border)', borderRadius: '5px',
  fontSize: '12px', cursor: 'pointer', background: 'var(--color-bg)', color: 'var(--color-text)',
  flexShrink: 0
}

// ---- Blocco indirizzi PEC ----
interface PecBlockProps {
  addresses: string[]
  onChange: (addresses: string[]) => void
}

export function PecBlock({ addresses, onChange }: PecBlockProps): React.JSX.Element {
  const list = addresses.length > 0 ? addresses : ['']

  const update = (i: number, val: string): void => {
    const next = [...list]
    next[i] = val
    onChange(next)
  }
  const add = (): void => onChange([...list, ''])
  const remove = (i: number): void => {
    if (list.length === 1) { onChange([]); return }
    onChange(list.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      {list.map((addr, i) => (
        <div key={i} style={pecRowStyle}>
          <input
            style={{ ...inputStyle, marginBottom: 0 }}
            type="email"
            placeholder="indirizzo@esempio.it"
            value={addr}
            onChange={e => update(i, e.target.value)}
          />
          <button type="button" style={btnSmallStyle} onClick={() => remove(i)}>−</button>
        </div>
      ))}
      <button type="button" style={btnSmallStyle} onClick={add}>+ Aggiungi indirizzo</button>
    </div>
  )
}

// ---- Componente campo dinamico ----
interface DynamicFieldProps {
  field: FieldDefListItem
  value: unknown
  onChange: (key: string, value: unknown) => void
  allFields: FieldDefListItem[]
  customValues: Record<string, unknown>
  menuSets: MenuSetListItem[]
}

export function DynamicField({ field, value, onChange, allFields, customValues, menuSets }: DynamicFieldProps): React.JSX.Element | null {
  // Visibilità condizionale
  if (field.conditionalOnFieldId != null && field.conditionalValue != null) {
    const controller = allFields.find(f => f.id === field.conditionalOnFieldId)
    if (controller) {
      const controllerValue = customValues[controller.key]
      if (controllerValue !== field.conditionalValue) return null
    }
  }

  const strVal = typeof value === 'string' ? value : ''
  const numVal = typeof value === 'number' ? value : ''
  const boolVal = typeof value === 'boolean' ? value : false

  const lbl = (
    <label style={labelStyle}>
      {field.label}
      {field.required && <span style={requiredDot}>*</span>}
    </label>
  )

  switch (field.type) {
    case 'testo_breve':
      return (
        <div style={fieldStyle}>
          {lbl}
          <input style={inputStyle} type="text" value={strVal}
            onChange={e => onChange(field.key, e.target.value)} />
        </div>
      )
    case 'testo_lungo':
    case 'note':
      return (
        <div style={fieldStyle}>
          {lbl}
          <textarea style={textareaStyle} value={strVal}
            onChange={e => onChange(field.key, e.target.value)} />
        </div>
      )
    case 'numero':
    case 'importo':
      return (
        <div style={fieldStyle}>
          {lbl}
          <input style={inputStyle} type="number" step={field.type === 'importo' ? '0.01' : '1'}
            value={numVal} onChange={e => onChange(field.key, e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
      )
    case 'data':
      return (
        <div style={fieldStyle}>
          {lbl}
          <input style={inputStyle} type="date" value={strVal}
            onChange={e => onChange(field.key, e.target.value)} />
        </div>
      )
    case 'menu': {
      const opts = getMenuOptionsBySetId(menuSets, field.menuSetId)
      return (
        <div style={fieldStyle}>
          {lbl}
          <select style={selectStyle} value={strVal}
            onChange={e => onChange(field.key, e.target.value)}>
            <option value="">— seleziona —</option>
            {opts.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )
    }
    case 'si_no':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <input type="checkbox" id={`dyn-${field.key}`} checked={boolVal}
            onChange={e => onChange(field.key, e.target.checked)} />
          <label htmlFor={`dyn-${field.key}`} style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
            {field.label}
            {field.required && <span style={requiredDot}>*</span>}
          </label>
        </div>
      )
    case 'pec':
      return (
        <div style={fieldStyle}>
          {lbl}
          <PecBlock
            addresses={(value as string[] | undefined) ?? []}
            onChange={addresses => onChange(field.key, addresses)}
          />
        </div>
      )
    case 'file':
      return (
        <div style={fieldStyle}>
          {lbl}
          <p style={hintStyle}>Upload file disponibile in E7.</p>
        </div>
      )
    default:
      return null
  }
}
