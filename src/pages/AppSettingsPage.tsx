import { useState } from 'react'
import { DEFAULT_THEME, THEMES, type ThemeKey } from '../../shared/themes'
import {
  useAppSettings,
  useOpenDataFolder,
  useUpdateTheme,
} from '../features/settings/useSettings'
import { useExportBackup, useRestoreBackup } from '../features/settings/useBackup'
import { RestoreBackupModal } from '../features/settings/RestoreBackupModal'

const wrapperStyle: React.CSSProperties = {
  padding: '32px 36px',
}

const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '4px',
}

const subtitleStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '14px',
  marginBottom: '24px',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '4px',
}

const sectionHintStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '13px',
  marginBottom: '16px',
}

const messageStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '14px',
}

const errorStyle: React.CSSProperties = {
  color: 'var(--color-error)',
  fontSize: '14px',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '14px',
}

function cardStyle(selected: boolean): React.CSSProperties {
  return {
    textAlign: 'left',
    background: 'var(--color-surface)',
    border: selected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
    borderRadius: '10px',
    padding: selected ? '11px' : '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  }
}

const previewStyle: React.CSSProperties = {
  display: 'flex',
  height: '52px',
  borderRadius: '6px',
  overflow: 'hidden',
  border: '1px solid var(--color-border)',
}

const labelRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
}

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--color-text)',
}

const currentBadgeStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--color-accent)',
}

const dataSectionStyle: React.CSSProperties = {
  marginTop: '36px',
}

const pathBoxStyle: React.CSSProperties = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  fontSize: '13px',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '10px 12px',
  wordBreak: 'break-all',
  marginBottom: '12px',
}

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
}

const actionButtonStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '8px 14px',
  cursor: 'pointer',
}

const copiedFeedbackStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-accent)',
  fontWeight: 500,
}

// Swatch rappresentativi per l'anteprima di ciascun tema (coerenti con le
// palette di global.css). Servono solo a dare un'idea visiva nella card.
const PREVIEW: Record<ThemeKey, { sidebar: string; bg: string; surface: string; accent: string }> = {
  light: { sidebar: '#1e293b', bg: '#f1f5f9', surface: '#ffffff', accent: '#4f46e5' },
  dark: { sidebar: '#020617', bg: '#0f172a', surface: '#1e293b', accent: '#6366f1' },
  pastel: { sidebar: '#6b5d4f', bg: '#faf5f0', surface: '#fffdfb', accent: '#c97b5a' },
  'deep-dark': { sidebar: '#060608', bg: '#000000', surface: '#0c0c0e', accent: '#8b5cf6' },
  'mustard-grey': { sidebar: '#3a382f', bg: '#ebe9e4', surface: '#f7f6f2', accent: '#c79a2b' },
}

function ThemePreview({ theme }: { theme: ThemeKey }): React.JSX.Element {
  const c = PREVIEW[theme]
  return (
    <div style={previewStyle} aria-hidden>
      <div style={{ width: '28%', background: c.sidebar }} />
      <div style={{ flex: 1, background: c.bg, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            background: c.surface,
            borderRadius: '3px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '12px',
            bottom: '12px',
            width: '20px',
            height: '8px',
            background: c.accent,
            borderRadius: '2px',
          }}
        />
      </div>
    </div>
  )
}

export function AppSettingsPage(): React.JSX.Element {
  const { data, isLoading, isError, error } = useAppSettings()
  const updateTheme = useUpdateTheme()
  const openDataFolder = useOpenDataFolder()
  const exportBackup = useExportBackup()
  const restoreBackup = useRestoreBackup()
  const [copied, setCopied] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)

  const current = data?.theme ?? DEFAULT_THEME

  function handleSelect(theme: ThemeKey): void {
    if (theme === current) return
    // La mutation persiste e, in onSuccess, aggiorna la cache ['settings'];
    // ThemeApplier reagisce al nuovo valore e applica data-theme su <html>.
    // L'IPC è locale e sincrono lato DB: il cambio è praticamente istantaneo.
    updateTheme.mutate({ theme })
  }

  async function handleCopyPath(): Promise<void> {
    if (!data?.dataPath) return
    // Copia la stringa del percorso (non i file) negli appunti.
    await navigator.clipboard.writeText(data.dataPath)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  function handleConfirmRestore(): void {
    // Al successo l'app si riavvia (gestito dal main); chiudiamo comunque la modale.
    restoreBackup.mutate(undefined, { onSettled: () => setRestoreOpen(false) })
  }

  return (
    <div style={wrapperStyle}>
      <h1 style={titleStyle}>Impostazioni app</h1>
      <p style={subtitleStyle}>{"Preferenze dell'applicazione."}</p>

      <h2 style={sectionTitleStyle}>Tema</h2>
      <p style={sectionHintStyle}>
        {"Cambia l'aspetto dell'interfaccia. I colori di avvisi, errori e azioni distruttive restano sempre riconoscibili, in qualsiasi tema."}
      </p>

      {isLoading ? (
        <p style={messageStyle}>Caricamento…</p>
      ) : isError ? (
        <p style={errorStyle}>
          Errore nel caricamento delle impostazioni: {error?.message ?? 'errore sconosciuto'}
        </p>
      ) : (
        <>
          <div style={gridStyle}>
            {THEMES.map((t) => {
              const selected = t.key === current
              return (
                <button
                  key={t.key}
                  type="button"
                  style={cardStyle(selected)}
                  onClick={() => handleSelect(t.key)}
                  disabled={updateTheme.isPending}
                  aria-pressed={selected}
                >
                  <ThemePreview theme={t.key} />
                  <div style={labelRowStyle}>
                    <span style={labelStyle}>{t.label}</span>
                    {selected && <span style={currentBadgeStyle}>Attivo</span>}
                  </div>
                </button>
              )
            })}
          </div>
          {updateTheme.isError && (
            <p style={{ ...errorStyle, marginTop: '12px' }}>
              Impossibile salvare il tema: {updateTheme.error?.message ?? 'errore sconosciuto'}
            </p>
          )}
        </>
      )}

      <section style={dataSectionStyle}>
        <h2 style={sectionTitleStyle}>Percorso dati</h2>
        <p style={sectionHintStyle}>
          {'Cartella in cui LexFlow conserva il database e i documenti. Per spostare i dati su un altro PC usa Backup e ripristino.'}
        </p>

        {isLoading ? (
          <p style={messageStyle}>Caricamento…</p>
        ) : isError ? (
          <p style={errorStyle}>
            Errore nel caricamento del percorso dati: {error?.message ?? 'errore sconosciuto'}
          </p>
        ) : (
          <>
            <div style={pathBoxStyle}>{data?.dataPath ?? 'Non disponibile'}</div>
            <div style={buttonRowStyle}>
              <button type="button" style={actionButtonStyle} onClick={handleCopyPath}>
                Copia percorso
              </button>
              <button
                type="button"
                style={actionButtonStyle}
                onClick={() => openDataFolder.mutate()}
                disabled={openDataFolder.isPending}
              >
                Apri cartella
              </button>
              {copied && <span style={copiedFeedbackStyle}>Copiato negli appunti</span>}
            </div>
            {openDataFolder.isError && (
              <p style={{ ...errorStyle, marginTop: '12px' }}>
                Impossibile aprire la cartella: {openDataFolder.error?.message ?? 'errore sconosciuto'}
              </p>
            )}
            {openDataFolder.data?.success === false && (
              <p style={{ ...errorStyle, marginTop: '12px' }}>
                Impossibile aprire la cartella dati.
              </p>
            )}
          </>
        )}
      </section>

      <section style={dataSectionStyle}>
        <h2 style={sectionTitleStyle}>Backup e ripristino</h2>
        <p style={sectionHintStyle}>
          {'Esporta un archivio completo (database e documenti) o ripristina i dati da un backup. Il ripristino sovrascrive i dati correnti e riavvia l’app.'}
        </p>

        <div style={buttonRowStyle}>
          <button
            type="button"
            style={actionButtonStyle}
            onClick={() => exportBackup.mutate()}
            disabled={exportBackup.isPending}
          >
            {exportBackup.isPending ? 'Esportazione…' : 'Esporta backup…'}
          </button>
          <button
            type="button"
            style={actionButtonStyle}
            onClick={() => setRestoreOpen(true)}
            disabled={restoreBackup.isPending}
          >
            Ripristina da backup…
          </button>
        </div>

        {exportBackup.data?.canceled === false && exportBackup.data.path && (
          <p style={{ ...messageStyle, marginTop: '12px' }}>
            Backup creato: {exportBackup.data.path}
          </p>
        )}
        {exportBackup.isError && (
          <p style={{ ...errorStyle, marginTop: '12px' }}>
            Impossibile creare il backup: {exportBackup.error?.message ?? 'errore sconosciuto'}
          </p>
        )}
        {restoreBackup.isError && (
          <p style={{ ...errorStyle, marginTop: '12px' }}>
            Impossibile ripristinare il backup: {restoreBackup.error?.message ?? 'errore sconosciuto'}
          </p>
        )}
      </section>

      {restoreOpen && (
        <RestoreBackupModal
          pending={restoreBackup.isPending}
          onConfirm={handleConfirmRestore}
          onClose={() => setRestoreOpen(false)}
        />
      )}
    </div>
  )
}
