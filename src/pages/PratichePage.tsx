import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NuovaPraticaModal } from '../features/practices/NuovaPraticaModal'
import { PraticheTable } from '../features/practices/PraticheTable'
import { PraticheFilters } from '../features/practices/PraticheFilters'
import {
  type PracticeFilters as PracticeFiltersType,
  filtersFromSearchParams,
  filterPractices,
} from '../features/practices/practiceFilters'
import { useActivePractices } from '../features/practices/usePractices'
import { useExportCsv } from '../features/practices/useExportCsv'
import { practicesToCsv, buildCsvFileName } from '../features/practices/practicesCsv'
import { ipcErrorMessage } from '../utils/ipcError'

export function PratichePage(): React.JSX.Element {
  const [searchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  // Filtri inizializzati una volta dalla query string (deep-link "Vedi pratiche"
  // dalla Dashboard, S8.4); poi gestiti dalla barra filtri.
  const [filters, setFilters] = useState<PracticeFiltersType>(() => filtersFromSearchParams(searchParams))
  const [lastCreated, setLastCreated] = useState<{ id: number; codice: string } | null>(null)

  const { data: practices } = useActivePractices()
  const exportCsv = useExportCsv()

  // Stesso insieme della tabella (ricerca + filtri): l'export rispetta la vista.
  const exportable = filterPractices(practices ?? [], search, filters)

  const handleCreated = (id: number, codiceIstanza: string): void => {
    setLastCreated({ id, codice: codiceIstanza })
    setModalOpen(false)
  }

  const handleExportCsv = (): void => {
    if (exportable.length === 0) return
    exportCsv.mutate({
      content: practicesToCsv(exportable),
      suggestedName: buildCsvFileName(),
    })
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
          Pratiche
        </h1>
        <button
          style={{
            padding: '8px 18px', background: 'var(--color-accent)', color: 'var(--color-on-accent)',
            border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
          }}
          onClick={() => { setLastCreated(null); setModalOpen(true) }}
        >
          + Nuova pratica
        </button>
      </div>

      {lastCreated && (
        <div style={{
          padding: '12px 16px', background: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)',
          borderRadius: '8px', fontSize: '13px', color: 'var(--color-success)', marginBottom: '20px'
        }}>
          Pratica <strong>{lastCreated.codice}</strong> creata con successo.
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca per codice, nome, soggetti, autorità, note…"
            aria-label="Cerca pratiche"
            style={{
              width: '100%', padding: '8px 32px 8px 12px',
              background: 'var(--color-surface)', color: 'var(--color-text)',
              border: '1px solid var(--color-border)', borderRadius: '6px',
              fontSize: '13px', boxSizing: 'border-box',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Azzera ricerca"
              style={{
                position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1, padding: '2px',
              }}
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={exportable.length === 0 || exportCsv.isPending}
          title={exportable.length === 0 ? 'Nessuna pratica da esportare' : 'Esporta le pratiche filtrate in CSV'}
          style={{
            padding: '8px 16px', cursor: exportable.length === 0 ? 'default' : 'pointer',
            background: 'var(--color-surface)', color: 'var(--color-text)',
            border: '1px solid var(--color-border)', borderRadius: '6px',
            fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap',
            opacity: exportable.length === 0 || exportCsv.isPending ? 0.6 : 1,
          }}
        >
          {exportCsv.isPending ? 'Esportazione…' : `Esporta CSV (${exportable.length})`}
        </button>
      </div>

      {exportCsv.data?.canceled === false && exportCsv.data.path && (
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
          CSV esportato: {exportCsv.data.path}
        </div>
      )}
      {exportCsv.isError && (
        <div style={{
          padding: '10px 14px', marginBottom: '12px', borderRadius: '8px',
          background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
          color: 'var(--color-error)', fontSize: '13px',
        }}>
          Impossibile esportare il CSV: {ipcErrorMessage(exportCsv.error)}
        </div>
      )}

      <PraticheFilters filters={filters} onChange={setFilters} />

      <PraticheTable searchTerm={search} filters={filters} />

      {modalOpen && (
        <NuovaPraticaModal
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
