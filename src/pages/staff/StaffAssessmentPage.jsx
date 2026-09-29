import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTickets } from '@/hooks/useTickets'
import {
  StatusBadge,
  EmptyState,
} from '@/components/domain'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  UserCheck,
  Zap,
  Info,
  Loader2,
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

const SLA_MAP = {
  High: 'P1 SLA: < 15 Minutes Triage & Immediate Escalation',
  Medium: 'P2 SLA: < 1 Hour Triage Response Target',
  Low: 'P3 SLA: < 4 Hours Operational Handling Window',
}

export default function StaffAssessmentPage() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const {
    tickets,
    loading,
    assessTicket,
    assignTicket,
    isSubmitting,
  } = useTickets()

  // Unassessed / queue tickets
  const unassessedTickets = useMemo(() => {
    return tickets.filter(
      (t) =>
        t.status === 'Report' ||
        t.status === 'Notification' ||
        t.status === 'Operational Queue' ||
        t.status === 'Initial Assessment' ||
        !t.priority
    )
  }, [tickets])

  const [selectedTicketId, setSelectedTicketId] = useState(null)

  useEffect(() => {
    if (!selectedTicketId && unassessedTickets.length > 0) {
      setSelectedTicketId(unassessedTickets[0].id)
    }
  }, [unassessedTickets, selectedTicketId])

  const selectedTicket = useMemo(() => {
    return unassessedTickets.find((t) => t.id === selectedTicketId) || null
  }, [unassessedTickets, selectedTicketId])

  // Form States
  const [assignedImpact, setAssignedImpact] = useState('Individual')
  const [assignedPriority, setAssignedPriority] = useState('Medium')
  const [assessmentNotes, setAssessmentNotes] = useState('')
  const [assignToMe, setAssignToMe] = useState(false)

  // Validation & Success
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submittedPayload, setSubmittedPayload] = useState(null)

  const handleSelectTicket = (t) => {
    setSelectedTicketId(t.id)
    setAssignedImpact(t.impact_metadata || 'Individual')
    setAssignedPriority(t.priority || 'Medium')
    setAssessmentNotes('')
    setAssignToMe(false)
    setSubmitAttempted(false)
    setSubmittedPayload(null)
  }

  const handleCompleteAssessment = async (e) => {
    e.preventDefault()
    setSubmitAttempted(true)

    if (!selectedTicket) return

    // 1. Mutate assessment / priority
    const res = await assessTicket({
      ticketId: selectedTicket.id,
      priority: assignedPriority,
      impactMetadata: assignedImpact,
      notes: assessmentNotes.trim(),
    })

    // 2. If assignToMe is selected, assign to current IT Staff
    if (assignToMe && res?.data) {
      await assignTicket({
        ticketId: selectedTicket.id,
        assigneeId: user.id,
        assigneeName: profile?.full_name || 'IT Staff',
        handoverNote: 'Self-assigned during initial assessment.',
      })
    }

    if (res?.data) {
      setSubmittedPayload({
        ticketId: selectedTicket.id,
        assignedImpact,
        assignedPriority,
        assessmentNotes: assessmentNotes.trim(),
        assignToMe,
        evaluatedStage: assignToMe ? 'In Progress' : 'Assignment',
      })
    }
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-amber-200 shadow-sm mt-14">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
              <AlertCircle className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Initial Assessment Queue
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
              {unassessedTickets.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Fase 4 Canonical Workflow: Evaluasi dampak teknis, tetapkan priority tier (P1/P2/P3), dan tentukan impact metadata sebelum dialokasikan ke staf penanggung jawab.
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {submittedPayload && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Assessment Completed &amp; Priority Set!</span>
            </div>
            <button
              type="button"
              onClick={() => setSubmittedPayload(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-emerald-800">
            Incident <strong className="font-mono bg-emerald-100 px-1 py-0.5 rounded">#{submittedPayload.ticketId.slice(0, 8)}</strong> has been graded as <strong>{submittedPayload.assignedPriority}</strong> ({submittedPayload.assignedImpact}) and transitioned to <strong>{submittedPayload.evaluatedStage}</strong>.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => navigate(`/staff/tickets/${submittedPayload.ticketId}`)}
              className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors inline-flex items-center gap-1"
            >
              <span>Open in Ticket Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSubmittedPayload(null)}
              className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Assess Next Incident
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Split Assessment Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Unassessed Queue List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pending Assessment ({unassessedTickets.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Live Intake</span>
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading pending queue...</span>
            </div>
          ) : unassessedTickets.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <EmptyState
                title="All Incidents Assessed"
                description="There are currently no unassessed tickets waiting in the triage queue."
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              {unassessedTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id
                return (
                  <div
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-xs ring-1 ring-blue-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        #{ticket.id.slice(0, 8)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(ticket.created_at)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1 line-clamp-2">
                      {ticket.summary}
                    </h4>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span>Reporter: {ticket.reporter?.full_name || 'Employee User'}</span>
                      <StatusBadge status={ticket.status} size="sm" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Assessment Form Panel (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <form
              onSubmit={handleCompleteAssessment}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Active Triage Form
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    Grading Incident #{selectedTicket.id.slice(0, 8)}
                  </h3>
                </div>
                <StatusBadge status={selectedTicket.status} size="sm" />
              </div>

              {/* Raw User Intake Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Incident Summary:</span>
                  <span className="font-semibold text-slate-900">{selectedTicket.summary}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Reporter:</span>
                  <span className="font-semibold text-slate-900">{selectedTicket.reporter?.full_name || 'Employee'}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1 font-semibold">Raw Description:</span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Impact Metadata Selection */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">
                  Impact Scope Metadata
                </label>
                <select
                  value={assignedImpact}
                  onChange={(e) => setAssignedImpact(e.target.value)}
                  className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Individual">Individual (Single User / Workstation)</option>
                  <option value="Departmental">Departmental (Team or Subnet Impact)</option>
                  <option value="Organization-Wide">Organization-Wide (Enterprise Outage)</option>
                </select>
              </div>

              {/* Priority Tier Buttons (P1 / P2 / P3) */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">
                  Assign Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { key: 'High', label: 'High (P1)', color: 'border-red-400 bg-red-50 text-red-800' },
                    { key: 'Medium', label: 'Medium (P2)', color: 'border-amber-400 bg-amber-50 text-amber-800' },
                    { key: 'Low', label: 'Low (P3)', color: 'border-emerald-400 bg-emerald-50 text-emerald-800' },
                  ].map((p) => {
                    const isChecked = assignedPriority === p.key
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setAssignedPriority(p.key)}
                        className={`p-3 rounded-lg border text-center font-bold text-xs transition-all ${
                          isChecked
                            ? `${p.color} ring-2 ring-blue-600 shadow-xs`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>{SLA_MAP[assignedPriority]}</span>
                </div>
              </div>

              {/* Assessment Notes */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">
                  Triage / Handover Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={assessmentNotes}
                  onChange={(e) => setAssessmentNotes(e.target.value)}
                  placeholder="Additional context for assigned technician or triage diagnosis..."
                  className="w-full bg-white text-slate-900 p-2.5 rounded-lg border border-slate-300 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Self-Assign Checkbox */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignToMe}
                    onChange={(e) => setAssignToMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Claim and assign to me immediately (Skip unassigned queue)</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving Assessment...' : 'Commit Assessment & Set Priority'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                Select an incident from the pending queue on the left to begin Initial Assessment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
