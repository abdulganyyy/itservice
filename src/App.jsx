import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { Loader2 } from 'lucide-react'

// Layouts
import EmployeeLayout from '@/layouts/EmployeeLayout'
import ITStaffLayout from '@/layouts/ITStaffLayout'

// Shared Pages
import LoginPage from '@/pages/LoginPage'

// Employee Pages
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard'
import EmployeeReportPage from '@/pages/employee/EmployeeReportPage'
import EmployeeMyTicketsPage from '@/pages/employee/EmployeeMyTicketsPage'
import EmployeeTicketDetailPage from '@/pages/employee/EmployeeTicketDetailPage'
import EmployeeNotificationsPage from '@/pages/employee/EmployeeNotificationsPage'
import EmployeeHelpPage from '@/pages/employee/EmployeeHelpPage'

// IT Staff Pages
import StaffDashboard from '@/pages/staff/StaffDashboard'
import StaffAssessmentPage from '@/pages/staff/StaffAssessmentPage'
import StaffMyAssignedPage from '@/pages/staff/StaffMyAssignedPage'
import StaffTicketDetailPage from '@/pages/staff/StaffTicketDetailPage'
import StaffIncidentHistoryPage from '@/pages/staff/StaffIncidentHistoryPage'
import StaffNotificationsPage from '@/pages/staff/StaffNotificationsPage'

// ---------------------------------------------------------------------------
// Root redirect — resolves correct portal based on live session role
// ---------------------------------------------------------------------------
function RootRedirect() {
  const { user, profile, loading } = useAuth()

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-space-md">
        <div className="flex flex-col items-center gap-space-sm bg-surface-container-lowest border border-outline-variant/60 p-space-lg rounded-xl">
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

// ---------------------------------------------------------------------------
// App — Route Tree
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ---------------------------------------------------------------- */}
          {/* PUBLIC ROUTE: Login                                               */}
          {/* ---------------------------------------------------------------- */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* ---------------------------------------------------------------- */}
          {/* ROOT REDIRECT                                                     */}
          {/* ---------------------------------------------------------------- */}
          <Route path="/" element={<RootRedirect />} />

          {/* ---------------------------------------------------------------- */}
          {/* PROTECTED: Employee Workspace                                     */}
          {/* All routes require role === 'Employee'                            */}
          {/* ---------------------------------------------------------------- */}
          <Route element={<ProtectedRoute allowedRoles={['Employee']} />}>
            <Route path="/employee" element={<EmployeeLayout />}>
              {/* Dashboard — index route */}
              <Route index element={<EmployeeDashboard />} />

              {/* Report IT Problem (UC-01 — Stage 4) */}
              <Route path="report" element={<EmployeeReportPage />} />

              {/* My Tickets list (UC-01, UC-08 — Stage 4/5) */}
              <Route path="tickets" element={<EmployeeMyTicketsPage />} />

              {/* Ticket Detail & Verification Loop (UC-08) */}
              <Route
                path="tickets/:ticketId"
                element={<EmployeeTicketDetailPage />}
              />

              {/* Notification Center (UC-09) */}
              <Route path="notifications" element={<EmployeeNotificationsPage />} />

              {/* Help & FAQ */}
              <Route path="help" element={<EmployeeHelpPage />} />
            </Route>
          </Route>

          {/* ---------------------------------------------------------------- */}
          {/* PROTECTED: IT Staff Workspace                                     */}
          {/* All routes require role === 'IT Staff'                            */}
          {/* ---------------------------------------------------------------- */}
          <Route element={<ProtectedRoute allowedRoles={['IT Staff']} />}>
            <Route path="/staff" element={<ITStaffLayout />}>
              {/* Operational Queue — index route (UC-03) */}
              <Route index element={<StaffDashboard />} />

              {/* Initial Assessment filtered queue (UC-04) */}
              <Route path="assessment" element={<StaffAssessmentPage />} />

              {/* My Assigned Tickets filtered view (UC-05) */}
              <Route path="assigned" element={<StaffMyAssignedPage />} />

              {/* IT Ticket Workspace — Detail, Assessment, Resolution (UC-04–07) */}
              <Route
                path="tickets/:ticketId"
                element={<StaffTicketDetailPage />}
              />

              {/* Incident Archive / History Audit Log (UC-10 — Stage 8) */}
              <Route path="history" element={<StaffIncidentHistoryPage />} />

              {/* Notification Log (UC-09 — Stage 7) */}
              <Route path="notifications" element={<StaffNotificationsPage />} />
            </Route>
          </Route>

          {/* ---------------------------------------------------------------- */}
          {/* CATCH-ALL FALLBACK                                                */}
          {/* ---------------------------------------------------------------- */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
