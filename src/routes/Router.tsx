import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { PratichePage } from '../pages/PratichePage'
import { DettaglioPraticaPage } from '../pages/DettaglioPraticaPage'
import { ReportPage } from '../pages/ReportPage'
import { AssistantPage } from '../pages/AssistantPage'
import { InstanceSettingsPage } from '../pages/InstanceSettingsPage'
import { AppSettingsPage } from '../pages/AppSettingsPage'
import { CestinoPage } from '../pages/CestinoPage'

export function Router(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pratiche" element={<PratichePage />} />
          <Route path="/pratiche/:id" element={<DettaglioPraticaPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/assistente" element={<AssistantPage />} />
          <Route path="/impostazioni-istanze" element={<InstanceSettingsPage />} />
          <Route path="/impostazioni-app" element={<AppSettingsPage />} />
          <Route path="/cestino" element={<CestinoPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
