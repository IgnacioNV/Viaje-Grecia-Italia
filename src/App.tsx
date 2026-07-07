import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useCurrentPerson } from './hooks/useCurrentPerson'
import { useTheme } from './hooks/useTheme'
import { WelcomeScreen } from './screens/WelcomeScreen'
import { HomeScreen } from './screens/HomeScreen'
import { FamilyScreen } from './screens/FamilyScreen'
import { DocsScreen } from './screens/DocsScreen'
import { JournalScreen } from './screens/JournalScreen'
import { MapScreen } from './screens/MapScreen'
import { Navbar } from './components/ui/Navbar'
import { seedDatabase } from './utils/seedDatabase'
import './styles/global.css'

function ResetScreen() {
  const handleReset = () => {
    localStorage.removeItem('trip_current_person_id')
    window.location.href = '/'
  }
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32, background: 'var(--color-bg)' }}>
      <p style={{ fontSize: 15, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', textAlign: 'center' }}>
        Cambiar de perfil
      </p>
      <button onClick={handleReset} style={{
        padding: '14px 32px', background: 'var(--color-primary)', color: '#fff',
        border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'var(--font-body)',
      }}>
        Volver al selector
      </button>
    </div>
  )
}

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
        <Route path="/journal" element={<JournalScreen personId={personId} personName={currentPerson.name} />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="/reset" element={<ResetScreen />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Navbar />
    </>
  )
}

export default function App() {
  useEffect(() => { seedDatabase() }, [])
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
