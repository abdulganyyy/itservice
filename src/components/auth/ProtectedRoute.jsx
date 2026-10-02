import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, AlertCircle, LogOut } from 'lucide-react'

export function ProtectedRoute({ allowedRoles = [] }) {
  const { user, profile, loading, profileLoading, signOut } = useAuth()
  const location = useLocation()

  // Prevent premature redirect or UI flicker while authentication/profile is being verified
  if (loading || profileLoading) {
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

  // If user is authenticated in Supabase Auth but profile record is missing in public.users
  if (!profile) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-space-md">
        <div className="max-w-md w-full flex flex-col items-center gap-space-md bg-surface-container-lowest border border-outline-variant/60 p-space-xl rounded-xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-title-md font-semibold text-on-surface">Account Profile Missing</h2>
            <p className="text-body-sm text-on-surface-variant">
              Your authenticated account is not associated with an organizational profile in the system directory. Please contact your IT administrator.
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-lg font-title-md text-body-sm hover:bg-secondary/90 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    )
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
