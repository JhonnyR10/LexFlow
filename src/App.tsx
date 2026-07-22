import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ThemeApplier } from './components/theme/ThemeApplier'
import { Router } from './routes/Router'
import { LockScreen } from './features/security/LockScreen'
import { useSecurityState } from './features/security/useSecurity'

function App(): React.JSX.Element | null {
  const { data, isLoading } = useSecurityState()
  const [unlocked, setUnlocked] = useState(false)
  const queryClient = useQueryClient()

  // Finché non sappiamo se l'app è bloccata non montiamo nulla (evita un flash
  // dell'interfaccia prima dello sblocco). In errore si prosegue come non
  // bloccati: il caso di default (nessun lock) non deve restare fuori.
  if (isLoading) return null

  const locked = data?.locked === true && !unlocked
  if (locked) {
    return (
      <LockScreen
        onUnlocked={() => {
          // Il DB è appena stato aperto lato main: invalida ogni query così le
          // viste ripartono con dati freschi.
          setUnlocked(true)
          queryClient.invalidateQueries()
        }}
      />
    )
  }

  return (
    <>
      <ThemeApplier />
      <Router />
    </>
  )
}

export default App
