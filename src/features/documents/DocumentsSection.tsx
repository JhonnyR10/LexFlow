import React, { useState } from 'react'
import { documentsApi } from '../../api/documents'
import { useDocuments, useUploadDocument, useDeleteDocument } from './useDocuments'
import type { DocumentItem, DocumentKind } from '../../../shared/ipc'

const KIND_ORDER: readonly { kind: DocumentKind; label: string }[] = [
  { kind: 'decreto', label: 'Decreto' },
  { kind: 'fattura', label: 'Fattura' },
]

function formatSize(bytes: number | null): string {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function formatDateTime(iso: string): string {
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(dt)
}

const buttonStyle: React.CSSProperties = {
  padding: '5px 12px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '12px',
  fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
}

const dangerButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  // Colore distruttivo semantico fisso (regola 8): non cambia col tema.
  color: '#b91c1c', borderColor: '#f1b0b0',
}

function DocumentRow({
  label,
  kind,
  doc,
  isTrashed,
  busy,
  onUpload,
  onDelete,
}: {
  label: string
  kind: DocumentKind
  doc: DocumentItem | undefined
  isTrashed: boolean
  busy: boolean
  onUpload: (kind: DocumentKind) => void
  onDelete: (id: number) => void
}): React.JSX.Element {
  const [opening, setOpening] = useState(false)

  const handleOpen = async (): Promise<void> => {
    if (!doc) return
    setOpening(true)
    try {
      await documentsApi.open({ id: doc.id })
    } finally {
      setOpening(false)
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
      padding: '12px 0', borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--color-text-muted)', marginBottom: '3px' }}>
          {label}
        </div>
        {doc ? (
          <div style={{ fontSize: '14px', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doc.originalName}
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
              {formatDateTime(doc.createdAt)}{doc.size != null ? ` · ${formatSize(doc.size)}` : ''}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Non presente
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {doc && (
          <button type="button" style={buttonStyle} onClick={handleOpen} disabled={opening}>
            {opening ? 'Apertura…' : 'Apri'}
          </button>
        )}
        {!isTrashed && (
          <>
            <button type="button" style={buttonStyle} onClick={() => onUpload(kind)} disabled={busy}>
              {doc ? 'Sostituisci' : 'Carica'}
            </button>
            {doc && (
              <button type="button" style={dangerButtonStyle} onClick={() => onDelete(doc.id)} disabled={busy}>
                Elimina
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function DocumentsSection({
  practiceId,
  isTrashed,
}: {
  practiceId: number
  isTrashed: boolean
}): React.JSX.Element {
  const { data: documents, isLoading, isError } = useDocuments(practiceId)
  const upload = useUploadDocument(practiceId)
  const remove = useDeleteDocument(practiceId)

  const sectionStyle: React.CSSProperties = {
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: '10px', padding: '20px 24px', marginBottom: '16px',
  }
  const titleStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.04em', color: 'var(--color-text-secondary)', margin: '0 0 8px',
  }

  const handleUpload = (kind: DocumentKind): void => {
    // L'annullamento del dialog ({ canceled: true }) non è un errore: nessuna azione.
    upload.mutate({ practiceId, kind })
  }

  const handleDelete = (id: number): void => {
    if (!window.confirm('Eliminare definitivamente questo documento?')) return
    remove.mutate({ id })
  }

  const busy = upload.isPending || remove.isPending
  const hasError = upload.isError || remove.isError

  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>Documenti</h2>

      {isLoading && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '8px 0 0' }}>
          Caricamento documenti…
        </p>
      )}

      {isError && !isLoading && (
        <div style={{
          padding: '12px', background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
          borderRadius: '8px', fontSize: '13px', color: 'var(--color-error)', marginTop: '8px',
        }}>
          Errore nel caricamento dei documenti. Riprova.
        </div>
      )}

      {!isLoading && !isError && (
        <div>
          {KIND_ORDER.map(({ kind, label }) => (
            <DocumentRow
              key={kind}
              label={label}
              kind={kind}
              doc={(documents ?? []).find(d => d.kind === kind)}
              isTrashed={isTrashed}
              busy={busy}
              onUpload={handleUpload}
              onDelete={handleDelete}
            />
          ))}
          {hasError && (
            <p style={{ fontSize: '13px', color: 'var(--color-error)', marginTop: '10px' }}>
              Operazione non riuscita. Riprova.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
