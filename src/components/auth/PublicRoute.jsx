import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export function PublicRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading || (user && !profile)) {
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
