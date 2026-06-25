import React from 'react'
import { useAvailableTransitions } from './usePractices'
import { TransitionFormModal } from './TransitionFormModal'
import type { AvailableTransition } from '../../../shared/ipc'

// S5.2 — Pulsanti dinamici = transizioni configurate dalla fase corrente.
// S5.3 — Il click apre il form dinamico della transizione: la compilazione e il
// salvataggio (TransitionRecord + HistoryEvent + cambio fase) avvengono lì.
// Nessun pulsante hard-coded: l'elenco arriva dal motore di workflow.

const mutedNote: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  fontStyle: 'italic',
  margin: 0,
}

function TransitionButton({
  transition,
  onClick,
}: {
  transition: AvailableTransition
  onClick: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid var(--color-accent)',
        background: 'var(--color-accent)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {transition.buttonLabel}
    </button>
  )
}

export function WorkflowActions({
  practiceId,
  isFinal,
}: {
  practiceId: number
  isFinal: boolean
}): React.JSX.Element {
  const [active, setActive] = React.useState<AvailableTransition | null>(null)
  const { data: transitions, isLoading, isError } = useAvailableTransitions(
    isFinal ? null : practiceId,
  )

  if (isFinal) {
    return <p style={mutedNote}>Pratica in fase finale: nessuna azione di avanzamento disponibile.</p>
  }

  if (isLoading) {
    return <p style={mutedNote}>Caricamento azioni…</p>
  }

  if (isError) {
    return (
      <p style={{ ...mutedNote, color: 'var(--color-error)', fontStyle: 'normal' }}>
        Errore nel caricamento delle azioni disponibili.
      </p>
    )
  }

  const items = transitions ?? []

  if (items.length === 0) {
    return <p style={mutedNote}>Nessuna azione disponibile per questa fase.</p>
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {items.map(t => (
          <TransitionButton key={t.id} transition={t} onClick={() => setActive(t)} />
        ))}
      </div>
      {active && (
        <TransitionFormModal
          practiceId={practiceId}
          transition={active}
          onClose={() => setActive(null)}
          onDone={() => setActive(null)}
        />
      )}
    </div>
  )
}
