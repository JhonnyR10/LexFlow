import React from 'react'
import { Link } from 'react-router-dom'
import { useAskAssistant } from '../features/assistant/useAssistant'
import { ipcErrorMessage } from '../utils/ipcError'
import type { AssistantAnswer } from '../../shared/ipc'

const wrapperStyle: React.CSSProperties = {
  padding: '32px 36px',
  maxWidth: '820px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  boxSizing: 'border-box',
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
  marginBottom: '20px',
}

const threadStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  paddingBottom: '12px',
}

const questionStyle: React.CSSProperties = {
  alignSelf: 'flex-end',
  maxWidth: '80%',
  background: 'var(--color-accent-light)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '9px 13px',
  fontSize: '14px',
}

const answerStyle: React.CSSProperties = {
  alignSelf: 'flex-start',
  maxWidth: '92%',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '12px 14px',
}

const answerTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--color-text)',
  whiteSpace: 'pre-wrap',
  margin: 0,
  lineHeight: 1.5,
}

const errorTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--color-error)',
  margin: 0,
}

const pendingStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  fontStyle: 'italic',
  margin: 0,
}

const itemsListStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: '10px 0 0',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
}

const itemLinkStyle: React.CSSProperties = {
  color: 'var(--color-accent)',
  fontWeight: 600,
  textDecoration: 'none',
}

const itemDetailStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '13px',
}

const chipsRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '12px',
}

const chipStyle: React.CSSProperties = {
  background: 'var(--color-bg-subtle)',
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  padding: '6px 12px',
  fontSize: '13px',
  color: 'var(--color-text)',
  cursor: 'pointer',
}

const introStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '16px 18px',
}

const introTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  margin: 0,
  lineHeight: 1.5,
}

const formStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginTop: '14px',
  borderTop: '1px solid var(--color-border)',
  paddingTop: '14px',
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  padding: '10px 12px',
  fontSize: '14px',
  color: 'var(--color-text)',
}

const submitStyle: React.CSSProperties = {
  background: 'var(--color-accent)',
  color: 'var(--color-on-accent)',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 18px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
}

const submitDisabledStyle: React.CSSProperties = {
  ...submitStyle,
  opacity: 0.55,
  cursor: 'not-allowed',
}

type ExchangeStatus = 'pending' | 'done' | 'error'

interface Exchange {
  id: number
  question: string
  status: ExchangeStatus
  answer: AssistantAnswer | null
  error: string | null
}

const INTRO_SUGGESTIONS: string[] = [
  'Quante pratiche attive ci sono?',
  'Quali pratiche sono ferme da troppo tempo?',
  'A quali pratiche mancano dei documenti?',
  'Ci sono scadenze imminenti o scadute?',
  'Qual è il totale concesso e liquidato?',
]

function AnswerBlock({
  answer,
  onSuggestion,
}: {
  answer: AssistantAnswer
  onSuggestion: (q: string) => void
}): React.JSX.Element {
  return (
    <div style={answerStyle}>
      <p style={answerTextStyle}>{answer.text}</p>

      {answer.items.length > 0 && (
        <ul style={itemsListStyle}>
          {answer.items.map((it) => (
            <li key={it.practiceId}>
              <Link to={`/pratiche/${it.practiceId}`} style={itemLinkStyle}>
                {it.codiceIstanza} — {it.nomeIstanza}
              </Link>
              {it.detail && <span style={itemDetailStyle}> · {it.detail}</span>}
            </li>
          ))}
        </ul>
      )}

      {answer.suggestions.length > 0 && (
        <div style={chipsRowStyle}>
          {answer.suggestions.map((s) => (
            <button key={s} type="button" style={chipStyle} onClick={() => onSuggestion(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function AssistantPage(): React.JSX.Element {
  const [input, setInput] = React.useState('')
  const [exchanges, setExchanges] = React.useState<Exchange[]>([])
  const nextId = React.useRef(1)
  const threadEndRef = React.useRef<HTMLDivElement>(null)
  const ask = useAskAssistant()

  React.useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [exchanges])

  function submitQuery(raw: string): void {
    const question = raw.trim()
    if (question.length === 0 || ask.isPending) return

    const id = nextId.current++
    setExchanges((prev) => [
      ...prev,
      { id, question, status: 'pending', answer: null, error: null },
    ])
    setInput('')

    ask.mutate(question, {
      onSuccess: (answer) => {
        setExchanges((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: 'done', answer } : e))
        )
      },
      onError: (error) => {
        setExchanges((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, status: 'error', error: ipcErrorMessage(error) } : e
          )
        )
      },
    })
  }

  function onSubmit(e: React.FormEvent): void {
    e.preventDefault()
    submitQuery(input)
  }

  const canSubmit = input.trim().length > 0 && !ask.isPending

  return (
    <div style={wrapperStyle}>
      <h1 style={titleStyle}>Assistente</h1>
      <p style={subtitleStyle}>
        Fai una domanda sui dati in archivio (le pratiche nel cestino sono escluse). L&apos;assistente
        risponde solo con dati presenti: non inventa.
      </p>

      <div style={threadStyle}>
        {exchanges.length === 0 ? (
          <div style={introStyle}>
            <p style={introTextStyle}>
              Posso rispondere su conteggi per fase, pratiche ferme o più vecchie, documenti
              mancanti, scadenze e totali degli importi. Prova con:
            </p>
            <div style={chipsRowStyle}>
              {INTRO_SUGGESTIONS.map((s) => (
                <button key={s} type="button" style={chipStyle} onClick={() => submitQuery(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          exchanges.map((ex) => (
            <React.Fragment key={ex.id}>
              <div style={questionStyle}>{ex.question}</div>
              {ex.status === 'pending' && (
                <div style={answerStyle}>
                  <p style={pendingStyle}>Sto verificando…</p>
                </div>
              )}
              {ex.status === 'error' && (
                <div style={answerStyle}>
                  <p style={errorTextStyle}>Errore: {ex.error}</p>
                </div>
              )}
              {ex.status === 'done' && ex.answer && (
                <AnswerBlock answer={ex.answer} onSuggestion={submitQuery} />
              )}
            </React.Fragment>
          ))
        )}
        <div ref={threadEndRef} />
      </div>

      <form style={formStyle} onSubmit={onSubmit}>
        <input
          style={inputStyle}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scrivi una domanda…"
          maxLength={500}
          aria-label="Domanda per l'assistente"
        />
        <button type="submit" style={canSubmit ? submitStyle : submitDisabledStyle} disabled={!canSubmit}>
          Chiedi
        </button>
      </form>
    </div>
  )
}
