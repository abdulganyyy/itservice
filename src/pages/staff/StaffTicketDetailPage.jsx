import React, { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTicketDetail } from '@/hooks/useTicketDetail'
import {
  StatusBadge,
  PriorityBadge,
  HistoryTimeline,
  EmptyState,
} from '@/components/domain'
import {
  Check,
  CheckCircle2,
  FileText,
  Activity,
  Send,
  AlertTriangle,
  UserCheck,
  Loader2,
  ShieldAlert,
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
  { id: 9, key: 'Verification', label: '9. Verify Gate' },
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

export default function StaffTicketDetailPage() {
  const { ticketId } = useParams()
  const { profile, user } = useAuth()

  const {
    ticket,
    history,
    loading,
    error,
    isSubmitting,
    assess,
    takeOver,
    addNote,
    resolve,
  } = useTicketDetail(ticketId)

  // Work Note Form States
  const [newWorkNote, setNewWorkNote] = useState('')
  const [workNoteError, setWorkNoteError] = useState('')

  // Resolution Form States
  const [rootCause, setRootCause] = useState('Configuration / Policy Mismatch')
  const [remediationNotes, setRemediationNotes] = useState('')
  const [verificationAdvice, setVerificationAdvice] = useState('')
  const [resolutionSubmitAttempted, setResolutionSubmitAttempted] = useState(false)

  const stageNumber = useMemo(() => {
    return STAGE_NUMBER_MAP[ticket?.status] || 1
  }, [ticket?.status])

  const isAssignedToCurrentUser = useMemo(() => {
    return ticket?.assignee_id === user?.id
  }, [ticket?.assignee_id, user?.id])

  const formattedTimeline = useMemo(() => {
    if (!history || history.length === 0) return []
    return history.map((h) => ({
      id: h.id,
      type: h.event_type?.toLowerCase() || 'work_note',
      author: h.actor?.full_name || 'IT Staff',
      role: h.actor?.role || 'IT Staff',
      timestamp: formatRelativeTime(h.created_at),
      content:
        h.change_payload?.note ||
        h.change_payload?.resolution_notes ||
        h.change_payload?.dispute_reason ||
        h.change_payload?.handover_note ||
        (h.event_type === 'TICKET_CREATED'
          ? 'Ticket logged into system queue.'
          : h.event_type === 'PRIORITY_ASSESSED'
          ? `Priority evaluated as ${h.change_payload?.new_priority}.`
          : h.event_type === 'TICKET_ASSIGNED'
          ? `Assigned to ${h.change_payload?.assignee_name || 'technician'}.`
          : h.event_type === 'VERIFICATION_ACCEPTED'
          ? 'Employee confirmed fix. Incident closed.'
          : h.event_type === 'VERIFICATION_DISPUTED'
          ? `Employee requested rework: "${h.change_payload?.dispute_reason}"`
          : `${h.event_type} event recorded.`),
      stageTo: h.change_payload?.initial_status || null,
    }))
  }, [history])

  // Handlers
  const handleAddWorkNote = async (e) => {
    e.preventDefault()
    if (!newWorkNote.trim()) {
      setWorkNoteError('Work note cannot be empty.')
      return
    }
    setWorkNoteError('')
    const res = await addNote(newWorkNote)
    if (res?.data) {
      setNewWorkNote('')
    }
  }

  const handleTakeOver = async () => {
    const res = await takeOver(`Explicit takeover by ${profile?.full_name || 'IT Staff'}`)
    if (res?.data) {
      alert(`You have claimed ownership of ticket #${ticket.id.slice(0, 8)}.`)
    }
  }

  const handlePriorityChange = async (newPriority) => {
    setSelectedPriority(newPriority)
    const res = await assess({ priority: newPriority })
    if (res?.data) {
      alert(`Ticket priority updated to ${newPriority}.`)
    }
  }

  const handleResolutionSubmit = async (e) => {
    e.preventDefault()
    setResolutionSubmitAttempted(true)

    if (remediationNotes.trim().length < 50) {
      return
    }

    const fullResolutionNotes = `[Root Cause: ${rootCause}]\n${remediationNotes.trim()}${
      verificationAdvice ? `\n\n[Verification Advice]: ${verificationAdvice.trim()}` : ''
    }`

    const res = await resolve({
      resolutionNotes: fullResolutionNotes,
      rootCause,
    })

    if (res?.data) {
      setResolutionSuccess(true)
      alert('Resolution submitted! Ticket routed to Employee Verification stage.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Loading technician workspace...</p>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="p-8">
        <EmptyState
          title="Incident Record Not Found"
          description={error || `No ticket found with ID #${ticketId}.`}
          actionLabel="Return to Operational Queue"
          onAction={() => window.location.assign('/staff')}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Header & Triage Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mt-14">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/staff" className="text-blue-600 hover:text-blue-800 font-semibold">
              Operational Queue
            </Link>
            <span>/</span>
            <span>Ticket Workspace</span>
            <span>/</span>
            <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
              #{ticket.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight pt-1">
            #{ticket.id.slice(0, 8)}: {ticket.summary}
          </h1>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center flex-wrap gap-2.5">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />

          {/* Collaborative Takeover / Assignment Button (Option B) */}
          {!isAssignedToCurrentUser && ticket.status !== 'Closed' && (
            <button
              type="button"
              onClick={handleTakeOver}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Take Over Ticket</span>
            </button>
          )}

          {isAssignedToCurrentUser && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You are Assigned</span>
            </div>
          )}
        </div>
      </div>

      {/* 10-Stage Pipeline Visualizer */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Canonical Lifecycle Pipeline (Stage {stageNumber} of 10)
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Reported {formatRelativeTime(ticket.created_at)}
          </span>
        </div>

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

      {/* Main Workspace Split: Left (Details & Notes) vs Right (Actions & Resolution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Intake Context + Work Notes Stream */}
        <div className="lg:col-span-7 space-y-6">
          {/* User Problem Intake Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Employee Problem Intake
              </span>
              <span className="text-slate-400 font-mono">
                Reporter: {ticket.reporter?.full_name || 'Employee'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-1">Detailed Description:</span>
              <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {ticket.verification_feedback && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg space-y-1">
                <span className="font-bold text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Employee Dispute Reason (Rework Required):
                </span>
                <p className="text-amber-900 italic">
                  "{ticket.verification_feedback}"
                </p>
              </div>
            )}
          </div>

          {/* Append-Only Work Notes Input & Stream (UC-06 / Option B) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Technician Work Notes (Append-Only Log)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Immutable Audit</span>
            </div>

            {/* Post New Note Form */}
            {ticket.status !== 'Closed' && (
              <form onSubmit={handleAddWorkNote} className="space-y-2">
                <textarea
                  rows={3}
                  value={newWorkNote}
                  onChange={(e) => setNewWorkNote(e.target.value)}
                  placeholder="Record investigation findings, terminal commands executed, or diagnostic notes..."
                  className="w-full bg-slate-50 text-slate-900 p-3 rounded-lg border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                {workNoteError && (
                  <p className="text-xs text-red-600">{workNoteError}</p>
                )}
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Append Work Note</span>
                  </button>
                </div>
              </form>
            )}

            {/* Audit Timeline */}
            <div className="pt-2 border-t border-slate-100">
              <HistoryTimeline entries={formattedTimeline} />
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Priority Shift & Resolution Submission */}
        <div className="lg:col-span-5 space-y-6">
          {/* Priority & Triage Shift Widget */}
          {ticket.status !== 'Closed' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Priority &amp; Urgency Adjustment
                </span>
                <span className="text-xs font-mono text-slate-500">ACT-05</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adjust priority during active troubleshooting if issue scope widens.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['High', 'Medium', 'Low'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePriorityChange(p)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      ticket.priority === p
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Documentation Form (UC-07 / Option B Guard) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Resolution Documentation
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Stage 7 Gate
              </span>
            </div>

            {!isAssignedToCurrentUser && ticket.status !== 'Closed' ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Resolution Guard (Option B)</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Only the <strong>Active Assignee ({ticket.assignee?.full_name || 'Unassigned'})</strong> can submit resolution documentation.
                </p>
                <button
                  type="button"
                  onClick={handleTakeOver}
                  className="mt-2 w-full inline-flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Take Over Ticket to Submit Resolution</span>
                </button>
              </div>
            ) : ticket.status === 'Closed' ? (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2">
                <span className="font-bold text-slate-900 block">Incident Closed (Terminal State)</span>
                <p className="text-slate-600 italic">"{ticket.resolution_notes}"</p>
              </div>
            ) : (
              <form onSubmit={handleResolutionSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Root Cause Classification</label>
                  <select
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    className="w-full bg-white text-slate-900 p-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Configuration / Policy Mismatch">Configuration / Policy Mismatch</option>
                    <option value="Hardware / Component Failure">Hardware / Component Failure</option>
                    <option value="Network / Routing Flap">Network / Routing Flap</option>
                    <option value="Software / Driver Bug">Software / Driver Bug</option>
                    <option value="Authentication / Kerberos Token Lag">Authentication / Kerberos Token Lag</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Remediation Notes (Min 50 Chars)</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {remediationNotes.trim().length}/50
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={remediationNotes}
                    onChange={(e) => setRemediationNotes(e.target.value)}
                    placeholder="Provide explicit technical explanation of the fix applied and commands executed..."
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-lg border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  {resolutionSubmitAttempted && remediationNotes.trim().length < 50 && (
                    <p className="text-red-600 text-[11px]">
                      Remediation notes must be at least 50 characters (currently {remediationNotes.trim().length}).
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Verification Advice for Employee (Required)
                  </label>
                  <textarea
                    rows={2}
                    value={verificationAdvice}
                    onChange={(e) => setVerificationAdvice(e.target.value)}
                    placeholder="Steps the employee should follow to confirm problem is resolved..."
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-lg border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Resolution &amp; Route to Verification</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
