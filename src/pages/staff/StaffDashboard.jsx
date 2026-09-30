import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTickets } from '@/hooks/useTickets'
import {
  StatusBadge,
  PriorityBadge,
  MetricTriageCard,
  TelemetryFeedBar,
  QuickTicketModal,
  EmptyState,
} from '@/components/domain'
import {
  Zap,
  Search,
  ArrowRight,
  User,
  Clock,
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

export default function StaffDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [isQuickTicketOpen, setIsQuickTicketOpen] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    tickets,
    loading,
    metrics,
    createQuickTicket,
  } = useTickets()

  const unassignedCount = useMemo(() => {
    return tickets.filter((t) => !t.assignee_id && t.status !== 'Closed').length
  }, [tickets])

  const highPriorityCount = useMemo(() => {
    return tickets.filter((t) => t.priority === 'High' && t.status !== 'Closed').length
  }, [tickets])

  const telemetryItems = useMemo(() => {
    return tickets.slice(0, 4).map((t) => ({
      id: t.id.slice(0, 8),
      title: t.summary,
      time: formatRelativeTime(t.created_at),
      priority: t.priority || 'Low',
    }))
  }, [tickets])

  const filteredIncidents = useMemo(() => {
    return tickets.filter((ticket) => {
      // Hide closed by default in operational queue unless explicitly searched
      if (stageFilter === 'all' && ticket.status === 'Closed') return false
      if (stageFilter !== 'all' && ticket.status !== stageFilter) return false

      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchId = ticket.id.toLowerCase().includes(q)
        const matchTitle = ticket.summary?.toLowerCase().includes(q)
        const matchReporter = ticket.reporter?.full_name?.toLowerCase().includes(q)
        const matchTech = ticket.assignee?.full_name?.toLowerCase().includes(q)
        if (!matchId && !matchTitle && !matchReporter && !matchTech) return false
      }

      return true
    })
  }, [tickets, priorityFilter, stageFilter, searchQuery])

  const handleQuickTicketSubmit = async (payload) => {
    const res = await createQuickTicket(payload)
    if (res?.data) {
      setIsQuickTicketOpen(false)
      navigate(`/staff/tickets/${res.data.id}`)
    }
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Telemetry Feed Bar */}
      <TelemetryFeedBar items={telemetryItems} />

      {/* Metric Triage Strip (4 Bento Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        <MetricTriageCard
          title="Unassessed Queue"
          value={String(metrics.awaitingAssessment).padStart(2, '0')}
          subtitle="Awaiting impact grading & urgency tagging before SLA breach."
          iconName="alert"
          variant="default"
          badgeText="Needs Triage"
        />
        <MetricTriageCard
          title="Unassigned Queue"
          value={String(unassignedCount).padStart(2, '0')}
          subtitle="Triaged incidents ready to be claimed or routed by staff."
          iconName="person"
          variant="default"
          badgeText="Needs IT Staff Owner"
        />
        <MetricTriageCard
          title="High Urgency (P1)"
          value={String(highPriorityCount).padStart(2, '0')}
          subtitle="Audio beacon active. High priority operational alerts."
          iconName="fire"
          variant={highPriorityCount > 0 ? 'urgent' : 'default'}
          badgeText={highPriorityCount > 0 ? 'Urgent Alert' : null}
        />
        <MetricTriageCard
          title="In Verification"
          value={String(metrics.awaitingVerification).padStart(2, '0')}
          subtitle="Remediation finished; auto-closes after 48h of user evaluation."
          iconName="check"
          variant={metrics.awaitingVerification > 0 ? 'highlight' : 'default'}
          badgeText={metrics.awaitingVerification > 0 ? 'Awaiting End-User' : null}
        />
      </section>

      {/* Main Operational Queue Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col m-6">
        {/* Table Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Centralized Operational Incident Queue</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-200 text-slate-700 font-bold">
                {filteredIncidents.length} Active
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live multi-staff incident intake queue with instant telemetry and collaborative takeover.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white rounded-lg border border-slate-300 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="High">High (P1)</option>
              <option value="Medium">Medium (P2)</option>
              <option value="Low">Low (P3)</option>
            </select>

            {/* Stage Filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white rounded-lg border border-slate-300 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Active Stages</option>
              <option value="Operational Queue">Operational Queue</option>
              <option value="Initial Assessment">Initial Assessment</option>
              <option value="In Progress">In Progress</option>
              <option value="Verification">Verification</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, summary, user..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Quick Ticket CTA */}
            <button
              type="button"
              onClick={() => setIsQuickTicketOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>+ Quick Ticket</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading operational queue...</span>
            </div>
          ) : filteredIncidents.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Incident Summary</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Assigned Staff</th>
                  <th className="py-3 px-4">Reported</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => navigate(`/staff/tickets/${inc.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={inc.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      #{inc.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 truncate">
                        {inc.summary}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        Impact: {inc.impact_metadata || 'Standard Incident'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {inc.reporter?.full_name || 'Employee User'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {inc.reporter?.email || ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={inc.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">
                          {inc.assignee?.full_name || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {formatRelativeTime(inc.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/staff/tickets/${inc.id}`}
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
                title="No operational incidents found"
                description="No active incidents match your current queue filters."
                actionLabel="Reset Queue Filters"
                onAction={() => {
                  setPriorityFilter('all')
                  setStageFilter('all')
                  setSearchQuery('')
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Ticket Modal */}
      <QuickTicketModal
        isOpen={isQuickTicketOpen}
        onClose={() => setIsQuickTicketOpen(false)}
        onSubmit={handleQuickTicketSubmit}
      />
    </div>
  )
}
