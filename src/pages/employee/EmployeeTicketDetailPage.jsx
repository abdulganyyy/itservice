import React, { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTicketDetail } from '@/hooks/useTicketDetail'
import {
  StatusBadge,
  PriorityBadge,
  HistoryTimeline,
  DisputeResolutionModal,
  EmptyState,
} from '@/components/domain'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Laptop,
  AlertTriangle,
  FileText,
  Loader2,
} from 'lucide-react'

const LIFECYCLE_STAGES = [
  { id: 1, key: 'Report', label: '1. Report' },
  { id: 2, key: 'Notification', label: '2. Notified' },
  { id: 3, key: 'Operational Queue', label: '3. Queue' },
  { id: 4, key: 'Initial Assessment', label: '4. Assess' },
  { id: 5, key: 'Assignment', label: '5. Assign' },
  { id: 6, key: 'In Progress', label: '6. In Progress' },
  { id: 7, key: 'Resolution', label: '7. Resolved' },
  { id: 8, key: 'Employee Notification', label: '8. Notified' },
  { id: 9, key: 'Verification', label: '9. Verify (You)' },
  { id: 10, key: 'Closed', label: '10. Closed' },
]

const STAGE_NUMBER_MAP = {
  'Report': 1,
  'Notification': 2,
  'Operational Queue': 3,
  'Initial Assessment': 4,
  'Assignment': 5,
  'In Progress': 6,
  'Resolution': 7,
  'Employee Notification': 8,
  'Verification': 9,
  'Closed': 10,
}

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

export default function EmployeeTicketDetailPage() {
  const { ticketId } = useParams()
  const [isDisputeOpen, setIsDisputeOpen] = useState(false)

  const {
    ticket,
    history,
    loading,
    error,
    isSubmitting,
    verifyAccept,
    verifyDispute,
  } = useTicketDetail(ticketId)

  const stageNumber = useMemo(() => {
    return STAGE_NUMBER_MAP[ticket?.status] || 1
  }, [ticket?.status])

  const formattedTimeline = useMemo(() => {
    if (!history || history.length === 0) return []
    return history.map((h) => ({
      id: h.id,
      type: h.event_type?.toLowerCase() || 'log',
      author: h.actor?.full_name || 'IT Operations',
      role: h.actor?.role || 'IT Staff',
      timestamp: formatRelativeTime(h.created_at),
      content:
        h.change_payload?.note ||
        h.change_payload?.resolution_notes ||
        h.change_payload?.dispute_reason ||
        h.change_payload?.handover_note ||
        (h.event_type === 'TICKET_CREATED'
          ? 'Incident reported via Employee Self-Service Intake Portal.'
          : h.event_type === 'PRIORITY_ASSESSED'
          ? `Priority evaluated and set to ${h.change_payload?.new_priority || 'Standard'}.`
          : h.event_type === 'TICKET_ASSIGNED'
          ? `Assigned to ${h.change_payload?.assignee_name || 'technician'}.`
          : h.event_type === 'VERIFICATION_ACCEPTED'
          ? 'Employee confirmed and accepted resolution. Ticket marked as Closed.'
          : h.event_type === 'VERIFICATION_DISPUTED'
          ? `Employee requested rework: "${h.change_payload?.dispute_reason}"`
          : `${h.event_type} event recorded.`),
      stageTo: h.change_payload?.initial_status || null,
    }))
  }, [history])

  const handleConfirmClose = async () => {
    const res = await verifyAccept()
    if (res?.data) {
      alert('Incident confirmed and closed successfully!')
    }
  }

  const handleDisputeSubmit = async ({ reason }) => {
    setIsDisputeOpen(false)
    const res = await verifyDispute(reason)
    if (res?.data) {
      alert('Dispute submitted. Incident returned to In Progress for technician rework.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Loading incident details...</p>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="p-8">
        <EmptyState
          title="Incident Not Found"
          description={error || `No incident ticket exists with ID #${ticketId}.`}
          actionLabel="Back to My Tickets"
          onAction={() => window.location.assign('/employee/tickets')}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Navigation & Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link
              to="/employee/tickets"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Tickets</span>
            </Link>
            <span>/</span>
            <span>My Tickets</span>
            <span>/</span>
            <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
              #{ticket.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight pt-1">
            #{ticket.id.slice(0, 8)}: {ticket.summary}
          </h1>
        </div>

        {/* Metadata Badges */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Reported {formatRelativeTime(ticket.created_at)}</span>
          </div>
        </div>
      </div>

      {/* 10-Stage Canonical Incident Lifecycle Stepper */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-blue-600 font-bold block">
              Stage Telemetry
            </span>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Incident Lifecycle Progress</span>
              <span className="text-xs text-slate-400 font-normal">
                (Stage {stageNumber} of 10)
              </span>
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 text-blue-800 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Stage 9: Mandatory employee sign-off gate before closure</span>
          </div>
        </div>

        {/* Stepper Pipeline */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[860px] flex items-center justify-between relative px-2 py-3">
            <div className="absolute left-6 right-6 top-6 h-[2px] bg-slate-200 -z-0" />
            <div
              className="absolute left-6 top-6 h-[2px] bg-blue-600 -z-0 transition-all duration-500"
              style={{ width: `${((stageNumber - 1) / 9) * 100}%` }}
            />

            {LIFECYCLE_STAGES.map((st) => {
              const isPassed = st.id < stageNumber
              const isCurrent = st.id === stageNumber

              return (
                <div key={st.id} className="flex flex-col items-center z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPassed
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm scale-110'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : st.id}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 whitespace-nowrap ${
                      isCurrent
                        ? 'font-bold text-blue-600'
                        : isPassed
                        ? 'font-medium text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ACTION REQUIRED: Verification Decision Panel */}
      {ticket.status === 'Verification' && (
        <section className="bg-white rounded-xl border border-blue-200 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 text-white flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/20 text-white text-xs font-bold uppercase tracking-wide">
                Action Required
              </span>
              <h3 className="text-sm font-bold">Please Verify Your Incident Fix</h3>
            </div>
            <span className="text-xs text-blue-100 font-mono">
              Verification started {formatRelativeTime(ticket.verification_started_at)}
            </span>
          </div>

          <div className="p-6 space-y-5">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Technician Resolution Summary:
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Assigned Tech: {ticket.assignee?.full_name || 'IT Operations'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
                "{ticket.resolution_notes || 'Technician has marked the incident as resolved.'}"
              </p>
            </div>

            {/* Decision CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDisputeOpen(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Issue Still Persists (Dispute &amp; Rework)</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Fix &amp; Close Incident</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main 2-Column Grid: Left Details & Right Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Problem Report & Context (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Problem Report Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Incident Intake Report</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Reporter: {ticket.reporter?.full_name || 'Employee User'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Issue Summary
                </span>
                <p className="text-slate-900 font-medium text-sm leading-snug">
                  {ticket.summary}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Description &amp; System Symptoms
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200 whitespace-pre-wrap font-normal">
                  {ticket.description}
                </p>
              </div>

              {ticket.verification_feedback && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-lg space-y-1">
                  <span className="font-bold text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Latest Employee Dispute Feedback:
                  </span>
                  <p className="text-amber-900 italic">
                    "{ticket.verification_feedback}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Log Timeline */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Traceable Incident Timeline</h3>
              <span className="text-xs text-slate-500 font-mono">
                {formattedTimeline.length} entries recorded
              </span>
            </div>
            <HistoryTimeline entries={formattedTimeline} />
          </div>
        </div>

        {/* Right Column: Context Information Cards (1 Col) */}
        <div className="space-y-6">
          {/* Assigned Technician Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Assigned Technician
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="font-bold text-slate-900">
                  {ticket.assignee?.full_name || 'Unassigned / Queue'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Role:</span>
                <span className="text-slate-700 font-medium">IT Operations Specialist</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Support
                </span>
              </div>
            </div>
          </div>

          {/* Impact Metadata Bento Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Laptop className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Incident Metadata
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Impact Scope:</span>
                <span className="font-semibold text-slate-900">
                  {ticket.impact_metadata || 'Individual'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Assessed Priority:</span>
                <PriorityBadge priority={ticket.priority} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-700 font-mono">
                  {formatRelativeTime(ticket.created_at)}
                </span>
              </div>
              {ticket.closed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Closed:</span>
                  <span className="text-emerald-700 font-mono font-bold">
                    {formatRelativeTime(ticket.closed_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      <DisputeResolutionModal
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        onSubmit={handleDisputeSubmit}
        ticketId={ticket.id.slice(0, 8)}
        ticketTitle={ticket.summary}
        technicianName={ticket.assignee?.full_name || 'IT Operations'}
      />
    </div>
  )
}
