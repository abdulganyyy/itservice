import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTickets } from '@/hooks/useTickets'
import { useTicketDetail } from '@/hooks/useTicketDetail'
import {
  StatusBadge,
  PriorityBadge,
  HistoryTimeline,
  EmptyState,
} from '@/components/domain'
import {
  Search,
  ShieldCheck,
  FileText,
  Clock,
  Loader2,
  CheckCircle2,
  ArrowRight,
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

export default function StaffIncidentHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { tickets, loading } = useTickets({ status: 'Closed' })

  const [selectedTicketId, setSelectedTicketId] = useState(null)

  useEffect(() => {
    if (!selectedTicketId && tickets.length > 0) {
      setSelectedTicketId(tickets[0].id)
    }
  }, [tickets, selectedTicketId])

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchId = t.id.toLowerCase().includes(q)
        const matchTitle = t.summary?.toLowerCase().includes(q)
        const matchReporter = t.reporter?.full_name?.toLowerCase().includes(q)
        const matchResolver = t.assignee?.full_name?.toLowerCase().includes(q)
        if (!matchId && !matchTitle && !matchReporter && !matchResolver) return false
      }
      return true
    })
  }, [tickets, searchQuery])

  const { ticket: activeDetail, history: activeHistory } = useTicketDetail(selectedTicketId)

  const formattedTimeline = useMemo(() => {
    if (!activeHistory || activeHistory.length === 0) return []
    return activeHistory.map((h) => ({
      id: h.id,
      type: h.event_type?.toLowerCase() || 'log',
      author: h.actor?.full_name || 'IT Staff',
      role: h.actor?.role || 'IT Staff',
      timestamp: formatRelativeTime(h.created_at),
      content:
        h.change_payload?.note ||
        h.change_payload?.resolution_notes ||
        h.change_payload?.dispute_reason ||
        h.change_payload?.handover_note ||
        (h.event_type === 'TICKET_CREATED'
          ? 'Incident intake created.'
          : h.event_type === 'VERIFICATION_ACCEPTED'
          ? 'Employee verified resolution. Incident closed.'
          : `${h.event_type} logged.`),
    }))
  }, [activeHistory])

  return (
    <div className="flex flex-col w-full space-y-6 p-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mt-14">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Incident Archive &amp; Audit Traceability
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-700 font-bold">
              {tickets.length} Archived Records
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Immutable audit record of verified closed IT incidents, remediation notes, and employee feedback.
          </p>
        </div>
      </div>

      {/* Main 2-Column Split Archive Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Archive Ticket List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search archived incidents..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center gap-2 text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading archive records...</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <EmptyState
                title="No archived incidents"
                description="No closed incident tickets match your query."
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTickets.map((t) => {
                const isSelected = selectedTicketId === t.id
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-xs ring-1 ring-blue-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        #{t.id.slice(0, 8)}
                      </span>
                      <PriorityBadge priority={t.priority} size="sm" />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mb-2">
                      {t.summary}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>Reporter: {t.reporter?.full_name || 'Employee'}</span>
                      <span className="font-mono">{formatRelativeTime(t.closed_at || t.created_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column (7 Cols): Selected Archived Incident Detail */}
        <div className="lg:col-span-7">
          {activeDetail ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-blue-600">
                      #{activeDetail.id.slice(0, 8)}
                    </span>
                    <StatusBadge status={activeDetail.status} size="sm" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {activeDetail.summary}
                  </h3>
                </div>
                <Link
                  to={`/staff/tickets/${activeDetail.id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Resolution Notes Box */}
              <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Verified Technician Resolution:
                </span>
                <p className="text-slate-800 leading-relaxed italic bg-white p-3 rounded-lg border border-emerald-200">
                  "{activeDetail.resolution_notes || 'No notes recorded.'}"
                </p>
                {activeDetail.verification_feedback && (
                  <div className="pt-2 border-t border-emerald-200 text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-0.5">Employee Feedback:</span>
                    <p className="italic">"{activeDetail.verification_feedback}"</p>
                  </div>
                )}
              </div>

              {/* Audit Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Chronological Audit Log
                </h4>
                <HistoryTimeline entries={formattedTimeline} />
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                Select an archived ticket on the left to inspect its complete remediation audit trail.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
