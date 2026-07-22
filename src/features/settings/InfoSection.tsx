import { useAppInfo } from './useAppInfo'
import { useSecurityConfig } from '../security/useSecurity'
import { useActivePractices, useTrashedPractices } from '../practices/usePractices'
import { ipcErrorMessage } from '../../utils/ipcError'

// Info app / stato sistema (S11.6). Sola lettura: versione, runtime, percorsi,
// stato sicurezza (riuso security:getConfig, E14) e conteggi archivio (riuso
// degli hook pratiche esistenti — nessun IPC dedicato ai conteggi).

const sectionStyle: React.CSSProperties = { marginTop: '36px' }

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '4px',
}

const hintStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '13px',
  marginBottom: '16px',
}

const messageStyle: React.CSSProperties = { fontSize: '14px', color: 'var(--color-text-secondary)' }
const errorStyle: React.CSSProperties = { fontSize: '14px', color: 'var(--color-error)' }

const groupTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--color-text)',
  margin: '16px 0 6px',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  padding: '6px 0',
  borderBottom: '1px solid var(--color-border)',
  fontSize: '13px',
}

const keyStyle: React.CSSProperties = { color: 'var(--color-text-secondary)' }
const valStyle: React.CSSProperties = { color: 'var(--color-text)', fontWeight: 500, textAlign: 'right' }

const pathBoxStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  fontSize: '12px',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '8px 10px',
  wordBreak: 'break-all',
  marginTop: '4px',
}

function platformLabel(p: string): string {
  if (p === 'darwin') return 'macOS'
  if (p === 'win32') return 'Windows'
  if (p === 'linux') return 'Linux'
  return p
}

function Row({ k, v }: { k: string; v: string }): React.JSX.Element {
  return (
    <div style={rowStyle}>
      <span style={keyStyle}>{k}</span>
      <span style={valStyle}>{v}</span>
    </div>
  )
}

export function InfoSection(): React.JSX.Element {
  const { data, isLoading, isError, error } = useAppInfo()
  const security = useSecurityConfig()
  const active = useActivePractices()
  const trashed = useTrashedPractices()

  const securityLabel = security.data
    ? `Lock ${security.data.lockEnabled ? 'attivo' : 'non attivo'} · Cifratura ${
        security.data.encrypted ? 'attiva' : 'non attiva'
      }`
    : '…'
  const activeCount = active.data ? String(active.data.length) : '…'
  const trashedCount = trashed.data ? String(trashed.data.length) : '…'

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Info app</h2>
      <p style={hintStyle}>Versione, ambiente di esecuzione e stato del sistema.</p>

      {isLoading ? (
        <p style={messageStyle}>Caricamento…</p>
      ) : isError ? (
        <p style={errorStyle}>Errore nel caricamento delle informazioni: {ipcErrorMessage(error)}</p>
      ) : data ? (
        <>
          <p style={groupTitleStyle}>Applicazione</p>
          <Row k="Versione" v={data.appVersion} />
          <Row k="Sistema" v={`${platformLabel(data.platform)} (${data.arch})`} />

          <p style={groupTitleStyle}>Runtime</p>
          <Row k="Electron" v={data.electron} />
          <Row k="Chromium" v={data.chrome} />
          <Row k="Node" v={data.node} />
          <Row k="V8" v={data.v8} />

          <p style={groupTitleStyle}>Stato</p>
          <Row k="Sicurezza" v={securityLabel} />
          <Row k="Pratiche attive" v={activeCount} />
          <Row k="Pratiche nel cestino" v={trashedCount} />

          <p style={groupTitleStyle}>Percorsi</p>
          <div style={keyStyle}>Dati</div>
          <div style={pathBoxStyle}>{data.dataPath}</div>
          <div style={{ ...keyStyle, marginTop: '10px' }}>Backup</div>
          <div style={pathBoxStyle}>{data.backupPath}</div>
        </>
      ) : null}
    </section>
  )
}
