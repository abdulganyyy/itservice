import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ allowedRoles = [] }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Prevent premature redirect or UI flicker while authentication/profile is being verified
  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-space-md">
        <div className="flex flex-col items-center gap-space-sm bg-surface-container-lowest border border-outline-variant/60 p-space-lg rounded-xl shadow-xs">
          <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          <p className="text-body-sm font-medium text-on-surface-variant">
            Verifying authentication session...
          </p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, redirect to /login preserving target location
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If role is specified and does not match, strictly redirect to user's authorized portal
  if (allowedRoles.length > 0 && profile?.role) {
    if (!allowedRoles.includes(profile.role)) {
      console.warn(`[ProtectedRoute] Unauthorized role access attempt: user is '${profile.role}', required: [${allowedRoles.join(', ')}]`)
      
      if (profile.role === 'Employee') {
        return <Navigate to="/employee" replace />
      }
      if (profile.role === 'IT Staff') {
        return <Navigate to="/staff" replace />
      }
      return <Navigate to="/login" replace />
    }
  }

  // If authenticated and authorized, render nested route outlet
  return <Outlet />
}

export default ProtectedRoute
