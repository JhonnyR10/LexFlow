import { ThemeApplier } from './components/theme/ThemeApplier'
import { Router } from './routes/Router'

function App(): React.JSX.Element {
  return (
    <>
      <ThemeApplier />
      <Router />
    </>
  )
}

export default App
