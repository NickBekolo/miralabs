import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Auth
import SplashScreen    from './pages/auth/SplashScreen'
import Onboarding      from './pages/auth/Onboarding'
import Login           from './pages/auth/Login'
import ForgotPassword  from './pages/auth/ForgotPassword'
import ResetPassword   from './pages/auth/ResetPassword'
import ChangePassword  from './pages/auth/ChangePassword'

// Superadmin
import SuperAdminDashboard from './pages/superadmin/Dashboard'

// Étudiant
import StudentDashboard from './pages/student/StudentDashboard'
import Notes            from './pages/student/Notes'

// Enseignant
import EnseignantHome from './pages/enseignant/HomePage'

// Parent
import ParentDashboard from './pages/parent/ParentDashboard'

function App() {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('splashDone') === 'true'
  )
  const [onboardingDone, setOnboardingDone] = useState(
    () => sessionStorage.getItem('onboardingDone') === 'true'
  )

  if (!splashDone) {
    return (
      <SplashScreen onFinish={() => {
        sessionStorage.setItem('splashDone', 'true')
        setSplashDone(true)
      }} />
    )
  }

  if (!onboardingDone) {
    return (
      <Onboarding onFinish={() => {
        sessionStorage.setItem('onboardingDone', 'true')
        setOnboardingDone(true)
      }} />
    )
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/"                      element={<Login />} />
          <Route path="/login"                 element={<Login />} />
          <Route path="/forgot-password"       element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/change-password"       element={<ChangePassword />} />

          {/* Superadmin */}
          <Route path="/superadmin/dashboard"  element={<SuperAdminDashboard />} />

          {/* Étudiant */}
          <Route path="/student/dashboard"     element={<StudentDashboard />} />
          <Route path="/student/notes"         element={<Notes />} />

          {/* Enseignant */}
          <Route path="/enseignant/home"       element={<EnseignantHome />} />

          {/* Parent */}
          <Route path="/parent/dashboard"      element={<ParentDashboard />} />

          {/* Pages à venir — placeholders */}
          <Route path="/directeur/dashboard"   element={<div style={{padding:40,fontFamily:'sans-serif'}}><h2>Directeur — en construction</h2></div>} />
          <Route path="/pedagogique/dashboard" element={<div style={{padding:40,fontFamily:'sans-serif'}}><h2>Service Pédagogique — en construction</h2></div>} />
          <Route path="/cpe/dashboard"         element={<div style={{padding:40,fontFamily:'sans-serif'}}><h2>CPE — en construction</h2></div>} />
          <Route path="/secretariat/dashboard" element={<div style={{padding:40,fontFamily:'sans-serif'}}><h2>Secrétariat — en construction</h2></div>} />
          <Route path="/comptabilite/dashboard"element={<div style={{padding:40,fontFamily:'sans-serif'}}><h2>Comptabilité — en construction</h2></div>} />
          <Route path="/surveillant/dashboard" element={<div style={{padding:40,fontFamily:'sans-serif'}}><h2>Surveillant — en construction</h2></div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App