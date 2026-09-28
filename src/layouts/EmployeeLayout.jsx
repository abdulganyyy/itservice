import React from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LifeBuoy, LogOut, Ticket, PlusCircle } from 'lucide-react'

export function EmployeeLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface">
      {/* Employee Topbar */}
      <header className="border-b border-outline-variant/60 bg-surface-container-lowest sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-space-md md:px-space-xl h-16 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-title-md tracking-tight text-on-surface">
                  IT Service Desk
                </span>
                <Badge variant="secondary" className="font-mono text-label-sm">
                  Employee Portal
                </Badge>
              </div>
              <p className="text-[11px] text-on-surface-variant hidden sm:block">
                Internal Support &amp; Incident Verification
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-body-sm font-medium text-on-surface">
                {profile?.full_name || 'Employee User'}
              </span>
              <span className="text-label-sm text-on-surface-variant font-mono">
                {profile?.email}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Secondary Navigation Bar */}
        <div className="border-t border-outline-variant/40 bg-surface-container-low/40">
          <div className="max-w-7xl mx-auto px-space-md md:px-space-xl flex items-center gap-space-xs h-11">
            <Link
              to="/employee"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-body-sm font-medium text-secondary bg-surface border border-outline-variant/50 shadow-2xs"
            >
              <Ticket className="w-4 h-4" />
              <span>My Incident Tickets</span>
            </Link>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-body-sm text-on-surface-variant/60 cursor-not-allowed select-none"
              title="Ticket creation feature will be available in Stage 5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Incident (Stage 5)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Shell */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-space-md md:p-space-xl">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-outline-variant/50 bg-surface-container-lowest py-3 text-center text-label-sm text-on-surface-variant">
        <span>Internal IT Service Platform V1 — Employee Session Active</span>
      </footer>
    </div>
  )
}

export default EmployeeLayout
