import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTickets } from '@/hooks/useTickets'
import {
  StatusBadge,
  PriorityBadge,
  EmptyState,
} from '@/components/domain'
import {
  UserCheck,
  Search,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react'

function formatRelativeTime(dateStr) {
  if (!dateStr) return '—'
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function StaffMyAssignedPage() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('all')

  const { tickets, loading } = useTickets({ assigneeId: user?.id })

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (stageFilter === 'in_progress' && ticket.status !== 'In Progress') return false
      if (stageFilter === 'verification' && ticket.status !== 'Verification') return false
      if (stageFilter === 'closed' && ticket.status !== 'Closed') return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchId = ticket.id.toLowerCase().includes(q)
        const matchTitle = ticket.summary?.toLowerCase().includes(q)
        const matchReporter = ticket.reporter?.full_name?.toLowerCase().includes(q)
        if (!matchId && !matchTitle && !matchReporter) return false
      }

      return true
    })
  }, [tickets, stageFilter, searchQuery])

  return (
    <div className="flex flex-col w-full space-y-6 p-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mt-14">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              My Assigned Tickets
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {profile?.full_name || 'IT Staff'} ({filteredTickets.length} Active)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Daftar insiden aktif yang menjadi tanggung jawab penanganan teknis Anda saat ini.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Active In-Flight Ownership</span>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="inline-flex p-1 bg-slate-200/70 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setStageFilter('all')}
              className={`px-3 py-1 rounded transition-all ${
                stageFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All My Tickets ({tickets.length})
            </button>
            <button
              type="button"
              onClick={() => setStageFilter('in_progress')}
              className={`px-3 py-1 rounded transition-all ${
                stageFilter === 'in_progress'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setStageFilter('verification')}
              className={`px-3 py-1 rounded transition-all ${
                stageFilter === 'verification'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verification
            </button>
            <button
              type="button"
              onClick={() => setStageFilter('closed')}
              className={`px-3 py-1 rounded transition-all ${
                stageFilter === 'closed'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Closed
            </button>
          </div>

          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ID, summary, user..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading assigned tickets...</span>
            </div>
          ) : filteredTickets.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Incident Summary</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/staff/tickets/${ticket.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      #{ticket.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 truncate">
                        {ticket.summary}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        Impact: {ticket.impact_metadata || 'Standard Incident'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {ticket.reporter?.full_name || 'Employee User'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {formatRelativeTime(ticket.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/staff/tickets/${ticket.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                      >
                        <span>Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No assigned tickets"
                description="You currently have no active incidents assigned to your queue."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
