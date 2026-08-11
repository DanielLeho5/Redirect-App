import {Routes, Route, Navigate, useLocation, useNavigate} from "react-router-dom"

import { Navbar } from "./components/Navbar"

import WelcomePage from "./pages/WelcomePage"
import Dashboard from "./pages/Dashboard"
import AuthPage from "./pages/AuthPage"
import EmailVerificationPage from "./pages/EmailVerificationPage"
import PasswordResetPage from "./pages/PasswordResetPage"
import {ToastContainer} from "react-toastify"
import { useContext, useEffect } from "react"
import { AppContext } from "./context/AppContext"
import Sidebar from "./components/Sidebar"

function App() {
  
  const { isLoggedIn, authReady, isSidebarOpen, userData } = useContext(AppContext)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!authReady || !isLoggedIn) {return}

    if (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/") {
      navigate("/dashboard", {replace: true})
    }
  }, [authReady, isLoggedIn, location.pathname, navigate])

  return (
    <>
      <Navbar/>
      {isSidebarOpen && <Sidebar/>}
      <div className='w-full min-h-screen bg-gray-100'>
        <Routes>
          <Route
            path="/"
            element={authReady && isLoggedIn ? <Navigate to="/dashboard" replace /> : <WelcomePage/>}
          />
          <Route
            path="/"
            element={authReady && isLoggedIn ? <Navigate to="/dashboard" replace /> : <WelcomePage />}
          />
          <Route path="/login" element={<AuthPage/>}/>
          <Route path="/register" element={<AuthPage/>}/>
          <Route
            path="/dashboard"
            element={
              !authReady ? (
                <div />
              ) : isLoggedIn ? (
                <Dashboard/>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/verify-email"
            element={
              !authReady ? (
                <div />
              ) : isLoggedIn && !userData.isVerified ? (
                <EmailVerificationPage/>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route path="/reset-password" element={<PasswordResetPage/>}/>
          <Route path="/*" element={<WelcomePage/>}/>
        </Routes>
        <ToastContainer/>
      </div>
    </>
  )
}

export default App
