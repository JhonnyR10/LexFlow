import React from 'react'
import { Link } from 'react-router-dom'
import { useReportSummary } from '../features/report/useReport'
import { ipcErrorMessage } from '../utils/ipcError'
import type {
  ReportByEntityItem,
  ReportByPhaseItem,
  ReportDocumentsCoverage,
  ReportTotals,
} from '../../shared/ipc'

const wrapperStyle: React.CSSProperties = {
  padding: '32px 36px',
  maxWidth: '900px',
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

const linkStyle: React.CSSProperties = {
  color: 'var(--color-accent)',
  fontWeight: 500,
  textDecoration: 'none',
}

const messageStyle: React.CSSProperties = { fontSize: '14px', color: 'var(--color-text-secondary)' }
const errorStyle: React.CSSProperties = { fontSize: '14px', color: 'var(--color-error)' }

const sectionStyle: React.CSSProperties = { marginTop: '28px' }
const sectionTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '10px',
}

const cardsRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '12px',
}

const statCardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  padding: '14px 16px',
}

const statLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)',
  marginBottom: '6px',
}

const statValueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--color-text)',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  color: 'var(--color-text-secondary)',
  fontWeight: 600,
  padding: '8px 10px',
  borderBottom: '1px solid var(--color-border)',
}

const thNumStyle: React.CSSProperties = { ...thStyle, textAlign: 'right' }

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-text)',
}

const tdNumStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right' }

function formatImporto(value: number | null): string {
  if (value == null) return 'Non presente'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
}

function StatCard({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div style={statCardStyle}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
    </div>
  )
}

function TotalsSection({ totals }: { totals: ReportTotals }): React.JSX.Element {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Totali importi</h2>
      <div style={cardsRowStyle}>
        <StatCard label="Pratiche attive" value={String(totals.practicesCount)} />
        <StatCard label="Richiesto" value={formatImporto(totals.importoRichiesto)} />
        <StatCard label="Concesso" value={formatImporto(totals.importoConcesso)} />
        <StatCard label="Fatturato" value={formatImporto(totals.importoFatturato)} />
        <StatCard label="Liquidato" value={formatImporto(totals.importoLiquidato)} />
      </div>
    </section>
  )
}

function PhaseSection({ items }: { items: ReportByPhaseItem[] }): React.JSX.Element {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Per stato (fase)</h2>
      {items.length === 0 ? (
        <p style={messageStyle}>Nessuna pratica attiva.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Fase</th>
              <th style={thNumStyle}>Pratiche</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.phaseId}>
                <td style={tdStyle}>{p.displayName}</td>
                <td style={tdNumStyle}>{p.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function EntitySection({
  title,
  items,
}: {
  title: string
  items: ReportByEntityItem[]
}): React.JSX.Element {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {items.length === 0 ? (
        <p style={messageStyle}>Nessuna pratica attiva.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Nominativo</th>
              <th style={thNumStyle}>Pratiche</th>
              <th style={thNumStyle}>Concesso</th>
              <th style={thNumStyle}>Liquidato</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id ?? 'unassigned'}>
                <td style={tdStyle}>{e.denominazione}</td>
                <td style={tdNumStyle}>{e.count}</td>
                <td style={tdNumStyle}>{formatImporto(e.importoConcesso)}</td>
                <td style={tdNumStyle}>{formatImporto(e.importoLiquidato)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function DocumentsSection({ doc }: { doc: ReportDocumentsCoverage }): React.JSX.Element {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Copertura documenti</h2>
      <div style={cardsRowStyle}>
        <StatCard label="Con decreto" value={`${doc.withDecreto} / ${doc.practicesCount}`} />
        <StatCard label="Senza decreto" value={String(doc.withoutDecreto)} />
        <StatCard label="Con fattura" value={`${doc.withFattura} / ${doc.practicesCount}`} />
        <StatCard label="Senza fattura" value={String(doc.withoutFattura)} />
      </div>
    </section>
  )
}

export function ReportPage(): React.JSX.Element {
  const { data, isLoading, isError, error } = useReportSummary()

  return (
    <div style={wrapperStyle}>
      <h1 style={titleStyle}>Report</h1>
      <p style={subtitleStyle}>
        Riepiloghi delle pratiche attive (il cestino è escluso). Per esportare le pratiche filtrate usa{' '}
        <Link to="/pratiche" style={linkStyle}>Pratiche → Esporta CSV</Link>.
      </p>

      {isLoading ? (
        <p style={messageStyle}>Caricamento…</p>
      ) : isError ? (
        <p style={errorStyle}>Errore nel caricamento del report: {ipcErrorMessage(error)}</p>
      ) : data && data.totals.practicesCount === 0 ? (
        <p style={messageStyle}>
          {'Nessuna pratica attiva da riepilogare. Crea una pratica in '}
          <Link to="/pratiche" style={linkStyle}>Pratiche</Link>.
        </p>
      ) : data ? (
        <>
          <TotalsSection totals={data.totals} />
          <PhaseSection items={data.byPhase} />
          <EntitySection title="Per collaboratore" items={data.byCollaboratore} />
          <EntitySection title="Per professionista" items={data.byProfessionista} />
          <DocumentsSection doc={data.documents} />
        </>
      ) : null}
    </div>
  )
}
