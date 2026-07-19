import { useEffect } from 'react'
import { useThemeStore } from './store/ThemeStore'
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Auth
import SplashScreen          from './pages/auth/SplashScreen'
import SelectEtablissement   from './pages/auth/SelectEtablissement'
import Login                 from './pages/auth/Login'
import ForgotPassword        from './pages/auth/ForgotPassword'
import ResetPassword         from './pages/auth/ResetPassword'
import ChangePassword        from './pages/auth/ChangePassword'

// Platform (éditeur Miralabs)
import PlatformDashboard from './pages/platform/PlatformDashboard'

// Superadmin
import SuperAdminDashboard   from './pages/superadmin/Dashboard'

// Étudiant
import StudentDashboard      from './pages/student/StudentDashboard'
import Notes                 from './pages/student/Notes'

// Enseignant
import EnseignantHome        from './pages/enseignant/EnseignantDashboard'

// Parent
import ParentDashboard       from './pages/parent/ParentDashboard'

const Placeholder = ({ title }) => (
  <div style={{ padding:40, fontFamily:'sans-serif' }}>
    <h2>{title} — en construction</h2>
  </div>
)

function App() {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('splashDone') === 'true'
  )

  if (!splashDone) {
    return (
      <SplashScreen onFinish={() => {
        sessionStorage.setItem('splashDone', 'true')
        setSplashDone(true)
      }} />
    )
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Sélection établissement — page d'accueil */}
          <Route path="/"                      element={<SelectEtablissement />} />
          <Route path="/select"                element={<SelectEtablissement />} />

          {/* Auth */}
          <Route path="/login"                 element={<Login />} />
          <Route path="/forgot-password"       element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/change-password"       element={<ChangePassword />} />

          {/* Superadmin */}
          <Route path="/platform/dashboard" element={<PlatformDashboard />} />
          <Route path="/superadmin/dashboard"  element={<SuperAdminDashboard />} />

          {/* Étudiant */}
          <Route path="/student/dashboard"     element={<StudentDashboard />} />
          <Route path="/student/notes"         element={<Notes />} />

          {/* Enseignant */}
          <Route path="/enseignant/home"       element={<EnseignantHome />} />

          {/* Parent */}
          <Route path="/parent/dashboard"      element={<ParentDashboard />} />

          {/* Placeholders */}
          <Route path="/directeur/dashboard"    element={<Placeholder title="Directeur" />} />
          <Route path="/pedagogique/dashboard"  element={<Placeholder title="Service Pédagogique" />} />
          <Route path="/cpe/dashboard"          element={<Placeholder title="CPE" />} />
          <Route path="/secretariat/dashboard"  element={<Placeholder title="Secrétariat" />} />
          <Route path="/comptabilite/dashboard" element={<Placeholder title="Comptabilité" />} />
          <Route path="/surveillant/dashboard"  element={<Placeholder title="Surveillant" />} />
          <Route path="*" element={
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a0a', color:'rgba(255, 255, 255, 0.63)', fontFamily:'sans-serif', fontSize:22 }}>
    Page introuvable
  </div>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App