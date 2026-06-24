import { PhasesSection } from '../features/config/phases/PhasesSection'
import { TransitionsSection } from '../features/config/transitions/TransitionsSection'
import { FieldsSection } from '../features/config/fields/FieldsSection'
import { MenusSection } from '../features/config/menus/MenusSection'

const pageStyle: React.CSSProperties = {
  padding: '28px 32px',
  maxWidth: '1100px'
}

const pageTitleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: 'var(--color-text)',
  marginBottom: '24px'
}

const comingSoonStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: '10px',
  border: '1px solid var(--color-border)',
  padding: '16px 20px',
  color: 'var(--color-text-muted)',
  fontSize: '13px',
  fontStyle: 'italic'
}

const sectionGapStyle: React.CSSProperties = {
  marginBottom: '24px'
}

export function InstanceSettingsPage(): React.JSX.Element {
  return (
    <div style={pageStyle}>
      <h1 style={pageTitleStyle}>Impostazioni istanze</h1>

      <div style={sectionGapStyle}>
        <PhasesSection />
      </div>

      <div style={sectionGapStyle}>
        <TransitionsSection />
      </div>

      <div style={sectionGapStyle}>
        <FieldsSection />
      </div>

      <div style={sectionGapStyle}>
        <MenusSection />
      </div>

      <div style={sectionGapStyle}>
        <div style={comingSoonStyle}>Anagrafiche (Professionisti e Collaboratori) — in arrivo (S2)</div>
      </div>
    </div>
  )
}
