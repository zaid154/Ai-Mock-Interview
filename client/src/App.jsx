import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import OtpVerify from './pages/OtpVerify'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Practice from './pages/Practice'
import Interview from './pages/Interview'
import Quiz from './pages/Quiz'
import Results from './pages/Results'
import AdminUsers from './pages/AdminUsers'
import AdminCertificates from './pages/AdminCertificates'
import AdminSettings from './pages/AdminSettings'
import Profile from './pages/Profile'
import Bookmarks from './pages/Bookmarks'
import Leaderboard from './pages/Leaderboard'
import Certificates from './pages/Certificates'
import VerifyCertificate from './pages/VerifyCertificate'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import CookieBanner from './components/CookieBanner'

// Route table. Public auth pages, then protected app pages, then admin panel.
export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <div className="app-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<OtpVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/verify-certificate/:certId" element={<VerifyCertificate />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <Certificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/:id"
            element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:id"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Navigate to="/admin/users" replace />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/certificates"
            element={
              <AdminRoute>
                <AdminCertificates />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
      <CookieBanner />
    </div>
  )
}
