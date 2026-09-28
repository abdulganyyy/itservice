import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'

// Pages & Layouts
import LoginPage from '@/pages/LoginPage'
import EmployeeLayout from '@/layouts/EmployeeLayout'
import ITStaffLayout from '@/layouts/ITStaffLayout'
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard'
import StaffDashboard from '@/pages/staff/StaffDashboard'
import { Loader2 } from 'lucide-react'

// Root redirect handler: redirects based on live authentication & public.users role
function RootRedirect() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-space-md">
        <div className="flex flex-col items-center gap-space-sm bg-surface-container-lowest border border-outline-variant/60 p-space-lg rounded-xl shadow-xs">
          <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          <p className="text-body-sm font-medium text-on-surface-variant">
            Initializing application session...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role === 'IT Staff') {
    return <Navigate to="/staff" replace />
  }

  return <Navigate to="/employee" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Root Redirect based on role */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Employee Workspace */}
          <Route element={<ProtectedRoute allowedRoles={['Employee']} />}>
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route index element={<EmployeeDashboard />} />
            </Route>
          </Route>

          {/* Protected IT Staff Workspace */}
          <Route element={<ProtectedRoute allowedRoles={['IT Staff']} />}>
            <Route path="/staff" element={<ITStaffLayout />}>
              <Route index element={<StaffDashboard />} />
            </Route>
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
