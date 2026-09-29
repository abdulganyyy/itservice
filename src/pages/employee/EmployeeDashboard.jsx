import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTickets } from '@/hooks/useTickets'
import {
  StatusBadge,
  PriorityBadge,
  MetricTriageCard,
  DisputeResolutionModal,
  EmptyState,
} from '@/components/domain'
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  UserCheck,
  CheckCircle,
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

export default function EmployeeDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [isDisputeOpen, setIsDisputeOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    tickets,
    loading,
    metrics,
    verifyTicket,
    disputeTicket,
    isSubmitting,
  } = useTickets()

  // Find ticket pending verification (Stage 9)
  const pendingVerificationTicket = useMemo(() => {
    return tickets.find((t) => t.status === 'Verification') || null
  }, [tickets])

  // Filter recent tickets for display
  const filteredTickets = useMemo(() => {
    let list = tickets
    if (activeTab === 'in_progress') {
      list = list.filter((t) => t.status === 'In Progress')
    } else if (activeTab === 'verification') {
      list = list.filter((t) => t.status === 'Verification')
    } else {
      list = list.filter((t) => t.status !== 'Closed')
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (t) =>
          t.summary?.toLowerCase().includes(q) ||
          t.id?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      )
    }

    return list.slice(0, 5)
  }, [tickets, activeTab, searchQuery])

  const handleConfirmClose = async () => {
    if (!pendingVerificationTicket) return
    const res = await verifyTicket({ ticketId: pendingVerificationTicket.id })
    if (res?.data) {
      alert('Verification confirmed! Incident marked as Closed.')
    }
  }

  const handleDisputeSubmit = async ({ reason }) => {
    if (!pendingVerificationTicket) return
    const res = await disputeTicket({
      ticketId: pendingVerificationTicket.id,
      disputeReason: reason,
      assigneeId: pendingVerificationTicket.assignee_id,
    })
    setIsDisputeOpen(false)
    if (res?.data) {
      alert('Dispute submitted. Ticket returned to In Progress for technician rework.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Greeting & Core Action Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-14">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back, {profile?.full_name || 'Employee User'}
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Monitor the progress of your IT requests or submit a new incident report.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/employee/report"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Report IT Problem</span>
          </Link>
        </div>
      </section>

      {/* Metric Summary Strip (3-Card Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricTriageCard
          title="Tickets In Progress"
          value={String(metrics.inProgress)}
          subtitle="Under active technical diagnosis"
          iconName="timer"
          variant="default"
          badgeText="Active"
        />
        <MetricTriageCard
          title="Awaiting Your Verification"
          value={String(metrics.awaitingVerification)}
          subtitle="Action required to close"
          iconName="alert"
          variant={metrics.awaitingVerification > 0 ? 'highlight' : 'default'}
          badgeText={metrics.awaitingVerification > 0 ? 'Action Required' : null}
        />
        <MetricTriageCard
          title="Resolved Records"
          value={String(metrics.resolvedCount)}
          subtitle="All verified closed fixes"
          iconName="check"
          variant="default"
        />
      </section>

      {/* ACTION REQUIRED: Resolution Verification Banner */}
      {pendingVerificationTicket && (
        <section className="bg-white rounded-xl border border-blue-200 shadow-md overflow-hidden">
          {/* Header Strip */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 text-white flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/20 text-white text-xs font-bold uppercase tracking-wide">
                Action Required
              </span>
              <h2 className="text-sm font-semibold">Resolution Verification Pending</h2>
            </div>
            <span className="font-mono text-xs text-blue-100">
              Reference #{pendingVerificationTicket.id.slice(0, 8)}
            </span>
          </div>

          <div className="p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-blue-600">
                    #{pendingVerificationTicket.id.slice(0, 8)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <h3 className="text-base font-bold text-slate-900">
                    {pendingVerificationTicket.summary}
                  </h3>
                  <StatusBadge status={pendingVerificationTicket.status} size="sm" />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Assigned: <strong className="text-slate-700">{pendingVerificationTicket.assignee?.full_name || 'IT Operations'}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Verification started {formatRelativeTime(pendingVerificationTicket.verification_started_at)}
                  </span>
                </div>
              </div>

              {/* Resolution Notes Box */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Technician Resolution Notes:</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{pendingVerificationTicket.resolution_notes || 'No resolution notes provided.'}"
                </p>
              </div>
            </div>

            {/* Action Control Group */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2.5 shrink-0 min-w-[220px]">
              <button
                type="button"
                onClick={handleConfirmClose}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm &amp; Close (Accept Fix)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDisputeOpen(true)}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Issue Still Persists (Dispute)</span>
              </button>
              <Link
                to={`/employee/tickets/${pendingVerificationTicket.id}`}
                className="inline-flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold pt-1 transition-colors"
              >
                <span>View Full Ticket Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* My Recent Active Tickets Section */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Control Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">My Recent Active Tickets</h2>
            <span className="text-xs text-slate-500">Live telemetry and escalation tracking for your open reports</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="inline-flex p-1 bg-slate-200/70 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Active ({metrics.totalActive})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('in_progress')}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  activeTab === 'in_progress' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Progress ({metrics.inProgress})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  activeTab === 'verification' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Verification ({metrics.awaitingVerification})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by ID or issue..."
                className="w-full bg-white text-slate-900 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading tickets...</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No active tickets found"
                description="You currently have no open requests matching your filter criteria."
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-4">Ticket ID</th>
                  <th className="py-2.5 px-4">Issue Summary</th>
                  <th className="py-2.5 px-4">Impact / Category</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Reported Date</th>
                  <th className="py-2.5 px-4">Stage</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/employee/tickets/${ticket.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      #{ticket.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {ticket.summary}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ticket.impact_metadata || 'Standard Incident'}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={ticket.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatRelativeTime(ticket.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ticket.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/employee/tickets/${ticket.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Dispute Resolution Modal */}
      {pendingVerificationTicket && (
        <DisputeResolutionModal
          isOpen={isDisputeOpen}
          onClose={() => setIsDisputeOpen(false)}
          onSubmit={handleDisputeSubmit}
          ticketId={pendingVerificationTicket.id.slice(0, 8)}
          ticketTitle={pendingVerificationTicket.summary}
          technicianName={pendingVerificationTicket.assignee?.full_name || 'IT Operations'}
        />
      )}
    </div>
  )
}

