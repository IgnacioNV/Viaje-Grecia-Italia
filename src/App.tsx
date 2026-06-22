import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useCurrentPerson } from './hooks/useCurrentPerson'
import { useTheme } from './hooks/useTheme'
import { WelcomeScreen } from './screens/WelcomeScreen'
import { HomeScreen } from './screens/HomeScreen'
import { FamilyScreen } from './screens/FamilyScreen'
import { DocsScreen } from './screens/DocsScreen'
import { JournalScreen } from './screens/JournalScreen'
import { MapScreen } from './screens/MapScreen'
import { Navbar } from './components/ui/Navbar'
import './styles/global.css'

function AppRoutes() {
  const { personId, currentPerson, selectPerson } = useCurrentPerson()
  useTheme()

  if (!personId || !currentPerson) {
    return <WelcomeScreen onSelect={selectPerson} />
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={
          <HomeScreen personId={personId} personName={currentPerson.name} />
        } />
        <Route path="/family" element={<FamilyScreen />} />
        <Route path="/docs" element={<DocsScreen personId={personId} />} />
        <Route path="/journal" element={<JournalScreen personId={personId} />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Navbar />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
