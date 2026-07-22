import React, { useState } from 'react'
import type { AlertConfig } from '../../../shared/ipc'
import { ipcErrorMessage } from '../../utils/ipcError'
import { useAlertConfig, useUpdateAlertConfig } from './useSettings'

// Config avvisi Dashboard (S11.5). Per livello: toggle abilita + soglia giorni.
// I pallini colore usano i token semantici FISSI (regola 8): non cambiano tema.

const sectionStyle: React.CSSProperties = { marginTop: '36px' }
const titleStyle: React.CSSProperties = {
  fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px',
}
const hintStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px',
}
const messageStyle: React.CSSProperties = { color: 'var(--color-text-secondary)', fontSize: '14px' }
const errorStyle: React.CSSProperties = { color: 'var(--color-error)', fontSize: '14px' }
const successStyle: React.CSSProperties = { color: 'var(--color-success)', fontSize: '13px', marginTop: '10px' }

const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap',
}
const dotStyle = (color: string): React.CSSProperties => ({
  width: '12px', height: '12px', borderRadius: '50%', background: color, flexShrink: 0,
})
const levelLabelStyle: React.CSSProperties = { fontSize: '14px', color: 'var(--color-text)', minWidth: '96px' }
const labelStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--color-text-secondary)' }
const numberInputStyle: React.CSSProperties = {
  width: '72px', padding: '6px 8px', fontSize: '13px',
  background: 'var(--color-surface)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px',
}
const primaryButtonStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 500, color: 'var(--color-on-accent)',
  background: 'var(--color-accent)', border: 'none', borderRadius: '8px',
  padding: '8px 14px', cursor: 'pointer', marginTop: '4px',
}

type LevelKey = 'yellow' | 'orange' | 'red'
interface LevelForm { enabled: boolean; thresholdDays: string }
type FormState = Record<LevelKey, LevelForm>

const LEVELS: { key: LevelKey; label: string; color: string }[] = [
  { key: 'yellow', label: 'Giallo', color: 'var(--color-warning-yellow)' },
  { key: 'orange', label: 'Arancione', color: 'var(--color-warning-orange)' },
  { key: 'red', label: 'Rosso', color: 'var(--color-warning-red)' },
]

function fromConfig(c: AlertConfig): FormState {
  return {
    yellow: { enabled: c.yellow.enabled, thresholdDays: String(c.yellow.thresholdDays) },
    orange: { enabled: c.orange.enabled, thresholdDays: String(c.orange.thresholdDays) },
    red: { enabled: c.red.enabled, thresholdDays: String(c.red.thresholdDays) },
  }
}

export function AlertConfigSection(): React.JSX.Element {
  const { data, isLoading, isError, error } = useAlertConfig()
  const updateConfig = useUpdateAlertConfig()

  const [form, setForm] = useState<FormState | null>(null)
  const [syncedFrom, setSyncedFrom] = useState<AlertConfig | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Sync form↔query (primo caricamento + dopo salvataggio), guardato dal ref.
  if (data && data !== syncedFrom) {
    setSyncedFrom(data)
    setForm(fromConfig(data))
  }

  function setLevel(key: LevelKey, patch: Partial<LevelForm>): void {
    setForm((f) => (f ? { ...f, [key]: { ...f[key], ...patch } } : f))
  }

  function handleSave(): void {
    if (!form) return
    const nums = {
      yellow: Number(form.yellow.thresholdDays),
      orange: Number(form.orange.thresholdDays),
      red: Number(form.red.thresholdDays),
    }
    for (const { key, label } of LEVELS) {
      if (!Number.isInteger(nums[key]) || nums[key] <= 0) {
        setFormError(`La soglia «${label}» deve essere un numero di giorni positivo.`)
        return
      }
    }
    if (!(nums.yellow < nums.orange && nums.orange < nums.red)) {
      setFormError('Le soglie devono essere crescenti: giallo < arancione < rosso.')
      return
    }
    setFormError(null)
    updateConfig.mutate({
      yellow: { enabled: form.yellow.enabled, thresholdDays: nums.yellow },
      orange: { enabled: form.orange.enabled, thresholdDays: nums.orange },
      red: { enabled: form.red.enabled, thresholdDays: nums.red },
    })
  }

  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>Avvisi Dashboard</h2>
      <p style={hintStyle}>
        {'Attiva o disattiva ciascun livello di avviso e imposta dopo quanti giorni dalla data deposito una pratica ferma vi rientra. L’avviso compare al livello più alto attivo la cui soglia è superata.'}
      </p>

      {isLoading ? (
        <p style={messageStyle}>Caricamento…</p>
      ) : isError ? (
        <p style={errorStyle}>Errore nel caricamento: {ipcErrorMessage(error)}</p>
      ) : form ? (
        <>
          {LEVELS.map((lvl) => (
            <div key={lvl.key} style={rowStyle}>
              <span style={dotStyle(lvl.color)} aria-hidden />
              <span style={levelLabelStyle}>{lvl.label}</span>
              <label style={labelStyle}>
                <input
                  type="checkbox"
                  checked={form[lvl.key].enabled}
                  onChange={(e) => setLevel(lvl.key, { enabled: e.target.checked })}
                />{' '}
                Attivo
              </label>
              <label style={labelStyle}>oltre</label>
              <input
                type="number"
                min={1}
                style={numberInputStyle}
                value={form[lvl.key].thresholdDays}
                onChange={(e) => setLevel(lvl.key, { thresholdDays: e.target.value })}
                aria-label={`Soglia giorni ${lvl.label}`}
              />
              <label style={labelStyle}>giorni</label>
            </div>
          ))}

          <button
            type="button"
            style={primaryButtonStyle}
            onClick={handleSave}
            disabled={updateConfig.isPending}
          >
            {updateConfig.isPending ? 'Salvataggio…' : 'Salva avvisi'}
          </button>

          {formError && <p style={{ ...errorStyle, marginTop: '10px' }}>{formError}</p>}
          {updateConfig.isError && (
            <p style={{ ...errorStyle, marginTop: '10px' }}>{ipcErrorMessage(updateConfig.error)}</p>
          )}
          {updateConfig.isSuccess && !formError && (
            <p style={successStyle}>Impostazioni avvisi salvate.</p>
          )}
        </>
      ) : null}
    </section>
  )
}
