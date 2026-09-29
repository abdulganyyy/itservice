import React, { useEffect, useRef } from 'react'
import { Bell, X, CheckCheck, Settings, Volume2, ExternalLink } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'

/**
 * NotificationCenterDrawer — Slide-out right-panel notification center.
 *
 * Source of Truth:
 *   - docs/uireference/it_service_console_notification_center_drawer/code.html
 *
 * This component is purely presentational. No Supabase Realtime subscription,
 * mark-as-read mutation, or audio playback logic is implemented here.
 * Those behaviors are wired in Stage 7 via useNotifications hook.
 *
 * Props:
 *   open            {boolean}   — Whether the drawer is visible
 *   onClose         {function}  — Callback to close the drawer
 *   notifications   {Array}     — Array of notification objects (see shape below)
 *   unreadCount     {number}    — Total unread count
 *   onMarkAllRead   {function}  — Callback to mark all read (wired in Stage 7)
 *   onDismiss       {function}  — Callback to dismiss a single notification (wired in Stage 7)
 *   onNavigate      {function}  — Callback(ticketId) to navigate to ticket
 *   role            {string}    — 'Employee' | 'IT Staff' (affects CTA labels)
 *
 * Notification shape:
 *   {
 *     id:          string,
 *     ticketId:    string,     // e.g. "#INC-1049"
 *     title:       string,     // Ticket summary title
 *     eventLabel:  string,     // Event type label (e.g. "Resolution Sign-off Required")
 *     stage:       string,     // Current lifecycle stage
 *     priority:    string,     // 'Low' | 'Medium' | 'High' | null
 *     message:     string,     // Summary / detail text
 *     relativeTime:string,     // e.g. "12m ago"
 *     timestamp:   string,     // ISO 8601
 *     isRead:      boolean,
 *     requiresAction: boolean, // If true, shows "Verify & Review" CTA
 *   }
 */

const PRIORITY_LEFT_BAR = {
  High:   'bg-error',
  Medium: 'bg-secondary-container',
  Low:    'bg-emerald-400',
  null:   'bg-outline-variant',
}

function NotificationItem({ item, onDismiss, onNavigate, role }) {
  const leftBarColor = PRIORITY_LEFT_BAR[item.priority] ?? 'bg-outline-variant'

  const actionLabel = role === 'Employee' ? 'Verify & Review' : 'Open Workspace'

  return (
    <article
      className={[
        'relative rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden',
        item.isRead
          ? 'bg-surface-container-lowest/60 opacity-80'
          : 'bg-surface-container-lowest',
      ].join(' ')}
    >
      {/* Priority left indicator bar */}
      <div className={['absolute left-0 top-0 bottom-0 w-1 flex-shrink-0', leftBarColor].join(' ')} />

      <div className="pl-space-sm pr-space-md py-space-md">
        {/* Event type + Time */}
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs flex-wrap">
            {!item.isRead && (
              <span
                className="h-2 w-2 rounded-full bg-secondary flex-shrink-0"
                title="Unread event"
              />
            )}
            <span
              className={[
                'font-label-sm text-label-sm uppercase tracking-wide font-bold px-space-xs py-0.5 rounded',
                item.priority === 'High'
                  ? 'text-error bg-error-container/60'
                  : 'text-secondary bg-secondary-fixed/50',
              ].join(' ')}
            >
              {item.eventLabel}
            </span>
            {item.stage && (
              <StatusBadge status={item.stage} size="sm" />
            )}
          </div>
          <time className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap flex-shrink-0">
            {item.relativeTime}
          </time>
        </div>

        {/* Ticket reference & title */}
        <div className="mt-space-xs">
          <button
            type="button"
            onClick={() => onNavigate?.(item.ticketId)}
            className="font-title-md text-title-md text-on-surface hover:text-secondary font-semibold transition-colors flex items-center gap-1.5 leading-snug text-left"
          >
            <span className="font-code-md text-code-md font-bold text-secondary">
              {item.ticketId}
            </span>
            <span className="truncate">{item.title}</span>
          </button>
        </div>

        {/* Priority badge */}
        {item.priority && (
          <div className="mt-space-xs">
            <PriorityBadge priority={item.priority} size="sm" />
          </div>
        )}

        {/* Summary message */}
        {item.message && (
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs bg-surface-container-low p-space-xs rounded leading-relaxed">
            {item.message}
          </p>
        )}

        {/* CTAs */}
        <div className="flex items-center justify-between mt-space-sm pt-space-xs">
          <div />
          <div className="flex items-center gap-space-xs">
            {/* Dismiss */}
            <button
              type="button"
              onClick={() => onDismiss?.(item.id)}
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface px-space-xs py-1 rounded hover:bg-surface-container transition-colors"
            >
              {item.isRead ? 'Clear' : 'Dismiss'}
            </button>

            {/* Primary action */}
            {item.requiresAction && (
              <button
                type="button"
                onClick={() => onNavigate?.(item.ticketId)}
                className="font-title-md text-title-md bg-secondary text-on-secondary hover:bg-secondary/90 px-space-sm py-1 rounded transition-colors shadow-sm flex items-center gap-1"
              >
                <span>{actionLabel}</span>
                <ExternalLink size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function NotificationCenterDrawer({
  open,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAllRead,
  onDismiss,
  onNavigate,
  role = 'Employee',
}) {
  const drawerRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Trap scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary/40 backdrop-blur-[2px] z-[60] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notification Center Panel"
        className="fixed top-0 right-0 w-full max-w-[500px] h-screen bg-surface-container-lowest shadow-2xl flex flex-col z-[70] overflow-hidden transform translate-x-0 transition-transform duration-300 ease-out"
      >
        {/* Drawer Header */}
        <div className="flex-shrink-0 bg-surface-container-lowest px-space-lg pt-space-lg pb-space-md shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          {/* Title row */}
          <div className="flex items-center justify-between gap-space-sm mb-space-xs">
            <div className="flex items-center gap-space-sm min-w-0">
              <Bell size={24} className="text-secondary flex-shrink-0" />
              <div className="flex items-center gap-space-xs">
                <h2 className="font-headline-sm text-on-surface tracking-tight">
                  Notification Center
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-secondary text-on-secondary font-label-sm text-label-sm px-space-xs py-0.5 rounded-full font-bold leading-none">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-space-xs flex-shrink-0">
              {/* Mark all read */}
              <button
                type="button"
                onClick={onMarkAllRead}
                aria-label="Mark all as read"
                title="Mark all as read"
                className="h-8 w-8 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
              >
                <CheckCheck size={18} />
              </button>
              {/* Settings (static — behavior wired in Stage 7) */}
              <button
                type="button"
                aria-label="Notification Settings"
                title="Notification Settings"
                className="h-8 w-8 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
              >
                <Settings size={18} />
              </button>
              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close notification panel"
                title="Close Notification Center (Esc)"
                className="h-8 w-8 rounded-lg hover:bg-error-container hover:text-on-error-container text-on-surface-variant flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Persistence metadata sub-bar */}
          <div className="flex items-center justify-between bg-surface-container-low px-space-sm py-1.5 rounded-lg mt-space-sm">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse flex-shrink-0" />
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                Persistent State Active • Synced across sessions
              </span>
            </div>
            <span className="font-code-md text-on-surface-variant font-medium flex-shrink-0">
              WSS-OK
            </span>
          </div>

          {/* Audio status row (IT Staff only) */}
          {role === 'IT Staff' && (
            <div className="flex items-center justify-between pt-space-sm">
              <div className="flex items-center gap-space-xs">
                <Volume2 size={18} className="text-secondary" />
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Audio Alerts Enabled
                </span>
                <span className="font-code-md text-on-surface-variant">(WebAudio API)</span>
              </div>
              {/* Volume bars visual */}
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-secondary rounded-full" style={{ height: '8px' }} />
                <span className="w-1 bg-secondary rounded-full" style={{ height: '12px' }} />
                <span className="w-1 bg-secondary rounded-full" style={{ height: '16px' }} />
                <span className="w-1 bg-surface-container-highest rounded-full" style={{ height: '8px' }} />
              </div>
            </div>
          )}
        </div>

        {/* Notification items list */}
        <div className="flex-1 overflow-y-auto px-space-md py-space-sm space-y-space-sm bg-surface">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-space-xl gap-space-md text-center">
              <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center">
                <Bell size={28} className="text-outline" />
              </div>
              <div className="space-y-space-xs">
                <p className="font-title-md text-on-surface">No notifications</p>
                <p className="font-body-sm text-on-surface-variant">
                  You're all caught up. New events will appear here.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onDismiss={onDismiss}
                onNavigate={onNavigate}
                role={role}
              />
            ))
          )}
        </div>
      </aside>
    </>
  )
}

export default NotificationCenterDrawer
