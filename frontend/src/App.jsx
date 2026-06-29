import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import SplashScreen from './pages/auth/SplashScreen'
import Onboarding from './pages/auth/Onboarding'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import StudentDashboard from './pages/student/StudentDashboard'
import ParentDashboard from './pages/parent/ParentDashboard'
import EnseignantHome from './pages/enseignant/HomePage'
// En haut avec les autres imports
import Notes from './pages/student/Notes'
import Absences from './pages/student/Absences'


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
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/enseignant/home" element={<EnseignantHome />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/absences" element={<Absences />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
