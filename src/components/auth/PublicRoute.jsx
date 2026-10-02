import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, AlertCircle, LogOut } from 'lucide-react'

export function PublicRoute({ children }) {
  const { user, profile, loading, profileLoading, signOut } = useAuth()

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-space-md">
        <div className="flex flex-col items-center gap-space-sm bg-surface-container-lowest border border-outline-variant/60 p-space-lg rounded-xl shadow-xs">
          <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          <p className="text-body-sm font-medium text-on-surface-variant">
            Checking session...
          </p>
        </div>
      </div>
    )
  }

  // If authenticated but missing profile in public.users, show clean notice with Sign Out option
  if (user && !profile) {
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

  // If already authenticated with loaded profile, redirect to their role-specific dashboard
  if (user && profile?.role) {
    if (profile.role === 'Employee') {
      return <Navigate to="/employee" replace />
    }
    if (profile.role === 'IT Staff') {
      return <Navigate to="/staff" replace />
    }
  }

  return children
}

export default PublicRoute
