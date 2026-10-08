import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '@/hooks/useNotifications'
import {
  Bell,
  CheckCheck,
  Volume2,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { EmptyState, PriorityBadge } from '@/components/domain'
import { Button } from '@/components/ui/button'

export default function StaffNotificationsPage() {
  const [filter, setFilter] = useState('all') // all, unread, p1
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
  } = useNotifications()

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'p1') return n.priority === 'High'
    return true
  })

  return (
    <div className="flex flex-col w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mt-14">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Staff Notification Log</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Realtime operational queue broadcasts, critical P1 alerts, and employee verification dispute logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Audio Indicator */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Logs ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('p1')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'p1'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            High Urgency Only
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
          <Volume2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Realtime Audio Chimes Enabled</span>
        </div>
      </div>

      {/* Notification Stream */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading notification log...</span>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all ${
                !n.isRead
                  ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-50'
                  : 'bg-slate-50/70 border-slate-200 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-900">
                      {n.eventLabel}
                    </span>
                    <PriorityBadge priority={n.priority} size="sm" />
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400 font-mono">{n.relativeTime}</span>
                  </div>

                  <p className="text-xs text-slate-800 font-semibold">
                    {n.title}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {n.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  {n.ticketId && (
                    <Link
                      to={`/staff/tickets/${n.ticketId}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold transition-colors"
                    >
                      <span>Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No notification log entries"
            message="All notifications caught up or filtered out."
            action={
              <Button variant="outline" size="sm" onClick={() => setFilter('all')}>
                View All Logs
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
