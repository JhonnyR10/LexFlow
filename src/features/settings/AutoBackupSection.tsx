import React, { useState } from 'react'
import type { BackupConfig, BackupTrigger } from '../../../shared/ipc'
import {
  useBackupConfig,
  useChangeBackupFolder,
  useOpenBackupFolder,
  useUpdateBackupConfig,
} from './useBackup'

const sectionStyle: React.CSSProperties = { marginTop: '36px' }
const titleStyle: React.CSSProperties = {
  fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px',
}
const hintStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px',
}
const messageStyle: React.CSSProperties = { color: 'var(--color-text-secondary)', fontSize: '14px' }
const errorStyle: React.CSSProperties = { color: 'var(--color-error)', fontSize: '14px' }
const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap',
}
const labelStyle: React.CSSProperties = { fontSize: '14px', color: 'var(--color-text)' }
const numberInputStyle: React.CSSProperties = {
  width: '72px', padding: '6px 8px', fontSize: '13px',
  background: 'var(--color-surface)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px',
}
const pathBoxStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: '13px', color: 'var(--color-text)', background: 'var(--color-surface)',
  border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 12px',
  wordBreak: 'break-all', marginBottom: '12px',
}
const buttonStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 500, color: 'var(--color-text)',
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: '8px', padding: '8px 14px', cursor: 'pointer',
}
const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle, color: '#fff', background: 'var(--color-accent)', border: 'none',
}

interface FormState {
  autoEnabled: boolean
  onClose: boolean
  interval: boolean
  intervalHours: string
  retentionCount: string
}

function fromConfig(c: BackupConfig): FormState {
  return {
    autoEnabled: c.autoEnabled,
    onClose: c.trigger === 'onClose' || c.trigger === 'both',
    interval: c.trigger === 'interval' || c.trigger === 'both',
    intervalHours: String(c.intervalHours),
    retentionCount: String(c.retentionCount),
  }
}

function formatLastBackup(iso: string | null): string {
  if (!iso) return 'mai'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? 'mai' : d.toLocaleString('it-IT')
}

export function AutoBackupSection(): React.JSX.Element {
  const { data, isLoading, isError, error } = useBackupConfig()
  const updateConfig = useUpdateBackupConfig()
  const changeFolder = useChangeBackupFolder()
  const openFolder = useOpenBackupFolder()

  const [form, setForm] = useState<FormState | null>(null)
  const [syncedFrom, setSyncedFrom] = useState<BackupConfig | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Sincronizza il form con la config quando cambia (primo caricamento + dopo ogni
  // salvataggio). Pattern React "set state during render" guardato dal confronto di
  // riferimento (TanStack Query mantiene lo stesso ref se i dati non cambiano).
  if (data && data !== syncedFrom) {
    setSyncedFrom(data)
    setForm(fromConfig(data))
  }

  function handleSave(): void {
    if (!form) return
    const hrs = Number(form.intervalHours)
    const ret = Number(form.retentionCount)
    if (!Number.isInteger(hrs) || hrs < 1) {
      setFormError("L'intervallo dev'essere un numero di ore ≥ 1.")
      return
    }
    if (!Number.isInteger(ret) || ret < 1) {
      setFormError('Il numero di copie da tenere dev’essere ≥ 1.')
      return
    }
    setFormError(null)
    // Se abilitato ma nessun trigger scelto, ricade su "alla chiusura".
    const trigger: BackupTrigger =
      form.onClose && form.interval ? 'both' : form.interval ? 'interval' : 'onClose'
    updateConfig.mutate({
      autoEnabled: form.autoEnabled,
      trigger,
      intervalHours: hrs,
      retentionCount: ret,
    })
  }

  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>Backup automatico</h2>
      <p style={hintStyle}>
        {'Crea automaticamente un archivio di backup alla chiusura e/o a intervalli regolari, mantenendo solo le copie più recenti.'}
      </p>

      {isLoading || !form ? (
        <p style={messageStyle}>Caricamento…</p>
      ) : isError ? (
        <p style={errorStyle}>
          Errore nel caricamento della configurazione: {error?.message ?? 'errore sconosciuto'}
        </p>
      ) : (
        <>
          <div style={rowStyle}>
            <label style={labelStyle}>
              <input
                type="checkbox"
                checked={form.autoEnabled}
                onChange={(e) => setForm({ ...form, autoEnabled: e.target.checked })}
              />{' '}
              Backup automatico attivo
            </label>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Quando:</span>
            <label style={labelStyle}>
              <input
                type="checkbox"
                checked={form.onClose}
                disabled={!form.autoEnabled}
                onChange={(e) => setForm({ ...form, onClose: e.target.checked })}
              />{' '}
              alla chiusura
            </label>
            <label style={labelStyle}>
              <input
                type="checkbox"
                checked={form.interval}
                disabled={!form.autoEnabled}
                onChange={(e) => setForm({ ...form, interval: e.target.checked })}
              />{' '}
              a intervallo
            </label>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Ogni</span>
            <input
              type="number"
              min={1}
              style={numberInputStyle}
              value={form.intervalHours}
              disabled={!form.autoEnabled || !form.interval}
              onChange={(e) => setForm({ ...form, intervalHours: e.target.value })}
            />
            <span style={labelStyle}>ore</span>
            <span style={{ ...labelStyle, marginLeft: '16px' }}>Tieni</span>
            <input
              type="number"
              min={1}
              style={numberInputStyle}
              value={form.retentionCount}
              disabled={!form.autoEnabled}
              onChange={(e) => setForm({ ...form, retentionCount: e.target.value })}
            />
            <span style={labelStyle}>copie</span>
          </div>

          <div style={pathBoxStyle}>{data?.backupPath ?? ''}</div>
          <div style={rowStyle}>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => changeFolder.mutate()}
              disabled={changeFolder.isPending}
            >
              Cambia cartella…
            </button>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => openFolder.mutate()}
              disabled={openFolder.isPending}
            >
              Apri cartella
            </button>
            <span style={{ ...messageStyle, marginLeft: '8px' }}>
              Ultimo backup: {formatLastBackup(data?.lastBackupAt ?? null)}
            </span>
          </div>

          <div style={rowStyle}>
            <button
              type="button"
              style={primaryButtonStyle}
              onClick={handleSave}
              disabled={updateConfig.isPending}
            >
              {updateConfig.isPending ? 'Salvataggio…' : 'Salva impostazioni'}
            </button>
            {updateConfig.isSuccess && !updateConfig.isPending && (
              <span style={{ ...messageStyle, color: 'var(--color-accent)' }}>Salvato</span>
            )}
          </div>

          {formError && <p style={errorStyle}>{formError}</p>}
          {updateConfig.isError && (
            <p style={errorStyle}>
              Impossibile salvare: {updateConfig.error?.message ?? 'errore sconosciuto'}
            </p>
          )}
          {openFolder.data?.success === false && (
            <p style={errorStyle}>Impossibile aprire la cartella dei backup.</p>
          )}
        </>
      )}
    </section>
  )
}
