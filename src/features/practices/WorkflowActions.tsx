import React from 'react'
import { useAvailableTransitions } from './usePractices'
import type { AvailableTransition } from '../../../shared/ipc'

// S5.2 — Pulsanti dinamici = transizioni configurate dalla fase corrente.
// Nessun pulsante hard-coded: l'elenco arriva interamente dal motore di
// workflow (docs/03-workflow-engine.md). Il form di compilazione e il
// salvataggio della transizione sono implementati in S5.3: qui il click
// si limita a segnalare che l'azione sarà presto disponibile.

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
  const [pendingLabel, setPendingLabel] = React.useState<string | null>(null)
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
          <TransitionButton key={t.id} transition={t} onClick={() => setPendingLabel(t.buttonLabel)} />
        ))}
      </div>
      {pendingLabel && (
        <p style={{ ...mutedNote, marginTop: '12px' }}>
          «{pendingLabel}»: la compilazione e il salvataggio della transizione saranno disponibili nella prossima storia (S5.3).
        </p>
      )}
    </div>
  )
}
