import React, { useState } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationCenterDrawer } from '@/components/domain'
import {
  LayoutDashboard,
  TicketCheck,
  Bell,
  HelpCircle,
  LogOut,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Employee Sidebar Nav Item
// ---------------------------------------------------------------------------
function EmployeeSidebarLink({ to, icon: Icon, label, end = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center gap-space-sm px-space-md py-space-sm rounded transition-colors font-body-md text-body-md',
          isActive
            ? 'bg-secondary-container text-on-surface font-title-md'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
        ].join(' ')
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  )
}

// ---------------------------------------------------------------------------
// EmployeeLayout
// ---------------------------------------------------------------------------
export function EmployeeLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    clearNotification,
  } = useNotifications()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  // Derive initials for avatar fallback
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'EU'

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased overflow-x-hidden">
      {/* Notification Center Drawer */}
      <NotificationCenterDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllRead={markAllRead}
        onDismiss={markRead}
        onClear={clearNotification}
        onNavigate={(ticketId) => {
          setIsDrawerOpen(false)
          navigate(`/employee/tickets/${ticketId}`)
        }}
        role="Employee"
      />

      {/* ------------------------------------------------------------------ */}
      {/* TOP HEADER BAR — fixed, h-16                                        */}
      {/* ------------------------------------------------------------------ */}
      <header className="fixed top-0 left-0 w-full h-16 bg-surface-container-lowest z-50 flex items-center justify-between px-gutter shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/50">

        {/* Left: Mobile Toggle + Logo + Portal Name */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors flex items-center justify-center"
          >
            {isMobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo Mark — shield/service icon in brand navy */}
          <div className="flex items-center justify-center w-8 h-8 rounded bg-primary-container shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 text-inverse-on-surface"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>

          <div className="flex flex-col justify-center">
            <span className="font-title-md text-title-md text-on-surface tracking-tight leading-none">
              IT Service Console
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-0.5">
              Employee Portal
            </span>
          </div>
        </div>

        {/* Right: Identity badge + Notification + User Avatar */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          {/* Identity pill (hidden on small screens) */}
          <div className="hidden md:flex items-center gap-space-xs px-space-md py-1 bg-surface-container-low rounded-lg">
            <span className="font-label-sm text-label-sm text-on-surface">
              Logged as:{' '}
              <strong className="font-title-md text-title-md text-on-surface">
                Employee
              </strong>{' '}
              <span className="text-on-surface-variant">
                ({profile?.full_name || '—'})
              </span>
            </span>
          </div>

          {/* Notification Bell */}
          <button
            id="employee-notification-trigger"
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open Notification Center"
            className="relative p-space-sm rounded-lg hover:bg-surface-container hover:text-on-surface text-on-surface-variant transition-colors flex items-center justify-center"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-error font-label-sm text-label-sm text-on-error leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar + Name */}
          <div className="flex items-center gap-space-sm pl-space-xs">
            <div className="w-8 h-8 rounded-full bg-primary-container text-inverse-on-surface flex items-center justify-center font-title-md text-title-md flex-shrink-0 select-none">
              {initials}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="font-title-md text-title-md text-on-surface leading-tight">
                {profile?.full_name || 'Employee User'}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
                {profile?.email || '—'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 top-16 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* LEFT SIDEBAR — responsive slide-out on mobile, fixed on desktop     */}
      {/* ------------------------------------------------------------------ */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 bg-surface-container-lowest z-40 flex flex-col justify-between py-space-md px-space-sm shadow-[1px_0_8px_rgba(0,0,0,0.02)] border-r border-outline-variant/40 transition-transform duration-200 ease-in-out ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        {/* Top section: CTA + Main Nav */}
        <div className="space-y-space-md">

          {/* Primary CTA: Report Problem */}
          <div className="px-space-xs">
            <NavLink
              to="/employee/report"
              id="employee-report-problem-cta"
              onClick={() => setIsMobileNavOpen(false)}
              className="w-full flex items-center justify-center gap-space-sm bg-secondary hover:bg-secondary/90 text-on-secondary px-space-md py-space-sm rounded-lg transition-colors font-title-md text-title-md shadow-sm"
            >
              <AlertCircle size={18} />
              <span>Report Problem</span>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-0.5" aria-label="Employee Navigation">
            <EmployeeSidebarLink
              to="/employee"
              end
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <EmployeeSidebarLink
              to="/employee/tickets"
              icon={TicketCheck}
              label="My Tickets"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <EmployeeSidebarLink
              to="/employee/notifications"
              icon={Bell}
              label="Notification Center"
              onClick={() => setIsMobileNavOpen(false)}
            />
          </nav>
        </div>

        {/* Bottom section: Help + Sign Out */}
        <div className="border-t border-surface-container pt-space-sm space-y-0.5">
          <EmployeeSidebarLink
            to="/employee/help"
            icon={HelpCircle}
            label="Help & FAQ"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <button
            type="button"
            onClick={handleSignOut}
            id="employee-sign-out-btn"
            className="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md text-left"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CONTENT AREA — responsive offset: pl-0 md:pl-60                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="pl-0 md:pl-60 w-full">
        <main className="w-full min-h-[calc(100vh-4rem)] pt-16 bg-surface p-space-md lg:p-margin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default EmployeeLayout

