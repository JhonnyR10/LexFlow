import React from 'react'
import { useActivePractices } from './usePractices'
import {
  type PracticeFilters,
  type FilterOption,
  emptyFilters,
  hasActiveFilters,
  derivePhaseOptions,
  deriveCollaboratoreOptions,
  deriveProfessionistaOptions,
} from './practiceFilters'

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  marginBottom: '4px',
}

const controlStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '13px',
  boxSizing: 'border-box',
}

function SelectFilter({
  label, value, options, onChange,
}: {
  label: string
  value: number | null
  options: FilterOption[]
  onChange: (v: number | null) => void
}): React.JSX.Element {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        style={controlStyle}
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
      >
        <option value="">Tutti</option>
        {options.map(o => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export function PraticheFilters({
  filters, onChange,
}: {
  filters: PracticeFilters
  onChange: (next: PracticeFilters) => void
}): React.JSX.Element {
  const { data: practices } = useActivePractices()
  const all = practices ?? []

  const phaseOptions = derivePhaseOptions(all)
  const collaboratoreOptions = deriveCollaboratoreOptions(all)
  const professionistaOptions = deriveProfessionistaOptions(all)

  const set = <K extends keyof PracticeFilters>(key: K, value: PracticeFilters[K]): void => {
    onChange({ ...filters, [key]: value })
  }

  const parseNumber = (raw: string): number | null => {
    if (raw.trim() === '') return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '12px',
      alignItems: 'end',
      padding: '16px',
      marginBottom: '16px',
      background: 'var(--color-bg-subtle, #f8fafc)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
    }}>
      <SelectFilter
        label="Fase"
        value={filters.phaseId}
        options={phaseOptions}
        onChange={v => set('phaseId', v)}
      />
      <SelectFilter
        label="Collaboratore"
        value={filters.collaboratoreId}
        options={collaboratoreOptions}
        onChange={v => set('collaboratoreId', v)}
      />
      <SelectFilter
        label="Professionista"
        value={filters.professionistaId}
        options={professionistaOptions}
        onChange={v => set('professionistaId', v)}
      />
      <div>
        <label style={labelStyle}>Deposito dal</label>
        <input
          type="date"
          style={controlStyle}
          value={filters.dataDepositoFrom ?? ''}
          onChange={e => set('dataDepositoFrom', e.target.value === '' ? null : e.target.value)}
        />
      </div>
      <div>
        <label style={labelStyle}>Deposito al</label>
        <input
          type="date"
          style={controlStyle}
          value={filters.dataDepositoTo ?? ''}
          onChange={e => set('dataDepositoTo', e.target.value === '' ? null : e.target.value)}
        />
      </div>
      <div>
        <label style={labelStyle}>Importo da (€)</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          style={controlStyle}
          value={filters.importoMin ?? ''}
          onChange={e => set('importoMin', parseNumber(e.target.value))}
        />
      </div>
      <div>
        <label style={labelStyle}>Importo a (€)</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          style={controlStyle}
          value={filters.importoMax ?? ''}
          onChange={e => set('importoMax', parseNumber(e.target.value))}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => onChange(emptyFilters)}
          disabled={!hasActiveFilters(filters)}
          style={{
            width: '100%',
            padding: '7px 10px',
            background: 'var(--color-surface)',
            color: hasActiveFilters(filters) ? 'var(--color-text)' : 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '13px',
            cursor: hasActiveFilters(filters) ? 'pointer' : 'default',
          }}
        >
          Azzera filtri
        </button>
      </div>
    </div>
  )
}
