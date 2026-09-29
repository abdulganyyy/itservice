import React, { useState, useRef } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { useTickets } from '@/hooks/useTickets'
import {
  NotificationCenterDrawer,
  QuickTicketModal,
  AudioAlertPlayer,
} from '@/components/domain'
import {
  ListFilter,
  ClipboardList,
  UserCheck,
  Archive,
  Bell,
  Zap,
  LogOut,
  Volume2,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// IT Staff Sidebar Nav Item
// ---------------------------------------------------------------------------
function StaffSidebarLink({ to, icon: Icon, label, badge = null, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex items-center justify-between px-space-sm py-space-xs rounded transition-colors',
          isActive
            ? 'bg-surface-container-high text-secondary font-title-md font-semibold border-l-2 border-secondary pl-[calc(0.5rem-2px)]'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
        ].join(' ')
      }
    >
      <div className="flex items-center gap-space-sm">
        <Icon size={18} />
        <span className="font-label-md text-label-md">{label}</span>
      </div>
      {badge !== null && (
        <span className="bg-secondary/15 text-secondary px-space-xs py-0.5 rounded font-label-sm text-label-sm font-bold tabular-nums">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

// ---------------------------------------------------------------------------
// ITStaffLayout
// ---------------------------------------------------------------------------
export function ITStaffLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isQuickTicketOpen, setIsQuickTicketOpen] = useState(false)
  const audioPlayerRef = useRef(null)

  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
  } = useNotifications({
    onAudioChime: (priority) => {
      audioPlayerRef.current?.play(priority)
    },
  })

  const { createQuickTicket, metrics } = useTickets()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const handleQuickTicketSubmit = async (payload) => {
    const res = await createQuickTicket(payload)
    if (res?.data) {
      setIsQuickTicketOpen(false)
      navigate(`/staff/tickets/${res.data.id}`)
    }
  }

  // Derive initials for avatar fallback
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'IT'

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased">
      {/* Headless WebAudio player */}
      <AudioAlertPlayer ref={audioPlayerRef} />

      {/* Notification Center Drawer */}
      <NotificationCenterDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllRead={markAllRead}
        onDismiss={markRead}
        onNavigate={(ticketId) => {
          setIsDrawerOpen(false)
          navigate(`/staff/tickets/${ticketId}`)
        }}
        role="IT Staff"
      />

      {/* Quick Ticket Rapid Intake Modal */}
      <QuickTicketModal
        isOpen={isQuickTicketOpen}
        onClose={() => setIsQuickTicketOpen(false)}
        onSubmit={handleQuickTicketSubmit}
      />

      {/* ------------------------------------------------------------------ */}
      {/* TOP HEADER BAR — Operations Console dark styling, fixed h-16        */}
      {/* ------------------------------------------------------------------ */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary-container z-50 px-gutter flex items-center justify-between border-b border-primary-container/40">

        {/* Left: Logo + Console Title + Identity Badge */}
        <div className="flex items-center gap-space-md">
          {/* Logo Mark */}
          <div className="flex items-center justify-center w-8 h-8 rounded bg-inverse-surface/60">
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

          <div className="flex flex-col">
            <span className="font-title-md text-title-md text-inverse-on-surface tracking-tight leading-none">
              IT Service Console
            </span>
            <span className="font-label-sm text-label-sm text-on-primary-container tracking-widest font-semibold">
              OPERATIONS CONSOLE
            </span>
          </div>

          {/* Vertical divider */}
          <div className="h-6 w-px bg-outline/20 mx-space-xs hidden md:block" />

          {/* Identity pill (hidden on small screens) */}
          <div className="hidden md:flex items-center gap-space-xs bg-tertiary-container/80 px-space-sm py-space-xs rounded border border-outline/30">
            <UserCheck size={16} className="text-secondary flex-shrink-0" />
            <span className="font-label-sm text-label-sm text-on-primary-fixed">
              Logged as:{' '}
              <strong className="text-inverse-on-surface font-semibold">
                IT Staff ({profile?.full_name || '—'})
              </strong>
            </span>
          </div>
        </div>

        {/* Right: Quick Ticket + Audio Status + Notification + Profile */}
        <div className="flex items-center gap-space-md">

          {/* Quick Ticket CTA */}
          <button
            id="staff-quick-ticket-trigger"
            type="button"
            onClick={() => setIsQuickTicketOpen(true)}
            aria-label="Open Quick Ticket modal"
            className="flex items-center gap-space-xs bg-secondary-container hover:bg-secondary text-on-secondary px-space-md py-space-xs rounded font-title-md text-title-md shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition-colors"
          >
            <Zap size={18} />
            <span>+ Quick Ticket</span>
          </button>

          {/* Audio Telemetry Status Indicator */}
          <div
            id="staff-audio-status-indicator"
            onClick={() => audioPlayerRef.current?.play('High')}
            title="Click to test High-Priority audio alert tone"
            className="hidden lg:flex items-center gap-space-xs bg-surface-container-highest/20 px-space-sm py-space-xs rounded text-inverse-on-surface cursor-pointer hover:bg-surface-container-highest/40 transition-colors"
          >
            <Volume2 size={16} className="text-secondary" />
            <span className="font-code-md text-code-md">Audio Alerts: Active</span>
          </div>

          {/* Notification Bell */}
          <button
            id="staff-notification-trigger"
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open Notification Center"
            className="relative p-space-xs text-inverse-on-surface hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-error text-on-error font-label-sm text-label-sm font-bold rounded-full leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Vertical divider */}
          <div className="h-6 w-px bg-outline/20" />

          {/* User Avatar */}
          <div className="flex items-center gap-space-sm">
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-title-md text-title-md text-inverse-on-surface leading-tight">
                {profile?.full_name || 'IT Staff'}
              </span>
              <span className="font-label-sm text-label-sm text-on-primary-container leading-tight">
                {profile?.email || '—'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-title-md text-title-md text-on-primary flex-shrink-0 select-none">
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* LEFT SIDEBAR — fixed, w-60, top-16                                  */}
      {/* ------------------------------------------------------------------ */}
      <aside className="fixed left-0 top-16 bottom-0 w-60 bg-surface-container-low border-r border-outline-variant/50 z-40 flex flex-col justify-between overflow-y-auto">

        {/* Top section: Quick Ticket CTA + Queue Navigation */}
        <div className="p-space-sm flex flex-col gap-space-sm">

          {/* Quick Ticket CTA (sidebar duplicate) */}
          <button
            id="staff-sidebar-quick-ticket-btn"
            type="button"
            onClick={() => setIsQuickTicketOpen(true)}
            className="w-full flex items-center justify-center gap-space-xs bg-secondary text-on-secondary py-space-xs rounded font-title-md text-title-md hover:bg-secondary/90 transition-colors shadow-sm"
          >
            <Zap size={18} />
            <span>+ Quick Ticket</span>
          </button>

          {/* Section Label */}
          <div className="px-space-xs pt-space-xs pb-space-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Queues &amp; Telemetry
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-0.5" aria-label="IT Staff Navigation">
            <StaffSidebarLink
              to="/staff"
              end
              icon={ListFilter}
              label="Operational Queue"
              badge={metrics.awaitingAssessment > 0 ? metrics.awaitingAssessment : null}
            />
            <StaffSidebarLink
              to="/staff/assessment"
              icon={ClipboardList}
              label="Initial Assessment"
              badge={metrics.awaitingAssessment > 0 ? metrics.awaitingAssessment : null}
            />
            <StaffSidebarLink
              to="/staff/assigned"
              icon={UserCheck}
              label="My Assigned Tickets"
              badge={metrics.myAssigned > 0 ? metrics.myAssigned : null}
            />
            <StaffSidebarLink
              to="/staff/history"
              icon={Archive}
              label="Incident Archive / History"
            />
            <StaffSidebarLink
              to="/staff/notifications"
              icon={Bell}
              label="Notification Log"
              badge={unreadCount > 0 ? unreadCount : null}
            />
          </nav>
        </div>

        {/* Bottom section: Audio Settings widget + System Status + Sign Out */}
        <div className="p-space-sm border-t border-outline-variant/40 bg-surface-container/40 flex flex-col gap-space-xs">

          {/* Audio Alert Settings */}
          <div
            id="staff-audio-settings-widget"
            className="flex flex-col gap-0.5"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                Audio Alert Settings
              </span>
              <Volume2 size={14} />
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1">
              <button
                type="button"
                onClick={() => audioPlayerRef.current?.play('Low')}
                title="Test Low Priority Tone"
                className="flex flex-col items-center justify-center p-1 bg-surface-container-lowest border border-outline-variant rounded text-center hover:bg-surface-container transition-colors"
              >
                <span className="font-label-sm text-label-sm font-semibold">Low</span>
                <span className="font-code-md text-[10px] text-on-surface-variant">440Hz</span>
              </button>
              <button
                type="button"
                onClick={() => audioPlayerRef.current?.play('Medium')}
                title="Test Medium Priority Tone"
                className="flex flex-col items-center justify-center p-1 bg-surface-container-lowest border border-outline-variant rounded text-center hover:bg-surface-container transition-colors"
              >
                <span className="font-label-sm text-label-sm font-semibold">Med</span>
                <span className="font-code-md text-[10px] text-on-surface-variant">880Hz</span>
              </button>
              <button
                type="button"
                onClick={() => audioPlayerRef.current?.play('High')}
                title="Test High Priority Tone"
                className="flex flex-col items-center justify-center p-1 bg-surface-container-lowest border border-outline-variant rounded text-center hover:bg-surface-container transition-colors"
              >
                <span className="font-label-sm text-label-sm font-semibold">High</span>
                <span className="font-code-md text-[10px] text-on-surface-variant">1200Hz</span>
              </button>
            </div>
          </div>

          {/* System Status indicator */}
          <div className="flex items-center gap-space-xs pt-space-xs">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
              System Status: All Operational
            </span>
          </div>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleSignOut}
            id="staff-sign-out-btn"
            className="w-full flex items-center gap-space-sm px-space-sm py-space-xs rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md text-left mt-space-xs"
          >
            <LogOut size={18} />
            <span className="font-label-md text-label-md">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CONTENT AREA — offset pl-60, pt-16                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="pl-60">
        <main className="w-full min-h-screen pt-16 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ITStaffLayout

