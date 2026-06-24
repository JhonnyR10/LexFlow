const wrapperStyle: React.CSSProperties = {
  padding: '32px 36px'
}

const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '12px'
}

const bodyStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '14px'
}

interface Props {
  title: string
  description?: string
}

export function PlaceholderSection({ title, description }: Props): React.JSX.Element {
  return (
    <div style={wrapperStyle}>
      <h1 style={titleStyle}>{title}</h1>
      <p style={bodyStyle}>{description ?? 'Sezione in costruzione.'}</p>
    </div>
  )
}
