import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTickets } from '@/hooks/useTickets'
import {
  ChevronRight,
  ShieldCheck,
  Send,
  Paperclip,
  Lightbulb,
  MapPin,
  Edit3,
  ArrowRight,
  User,
  Building,
  Mail,
  Phone,
  Laptop,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

export default function EmployeeReportPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { createTicket } = useTickets()

  // Form Field States
  const [summary, setSummary] = useState('')
  const [description, setDescription] = useState('')
  const [locationTag, setLocationTag] = useState('Desk 4B - Finance Floor, Building A')
  const [contactPhone, setContactPhone] = useState('ext. 4412 / +62 812-3456-7890')

  // Form Validation & Interaction Tracking States
  const [touched, setTouched] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [formSubmittedPayload, setFormSubmittedPayload] = useState(null)
  const [createdTicketId, setCreatedTicketId] = useState(null)

  // Character Counts
  const summaryLength = summary.trim().length
  const descriptionLength = description.trim().length

  // Approved Validation Rules
  const errors = {}

  // Summary: min 5 / max 150 (PRD Section 3.2.1 & 7.1 Line 213, 963)
  if (!summary.trim()) {
    errors.summary = 'Issue summary is required.'
  } else if (summary.trim().length < 5) {
    errors.summary = `Issue summary must be at least 5 characters (currently ${summary.trim().length}).`
  } else if (summary.length > 150) {
    errors.summary = 'Issue summary cannot exceed 150 characters.'
  }

  // Description: required
  if (!description.trim()) {
    errors.description = 'Problem description is required.'
  }

  const isFormValid = Object.keys(errors).length === 0

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setTouched({
      summary: true,
      description: true
    })

    if (!isFormValid) {
      window.scrollTo({ top: 120, behavior: 'smooth' })
      return
    }

    const payload = {
      reporterId: profile?.id || 'emp-88421',
      reporterName: profile?.full_name || 'Rian Ardiansyah',
      department: profile?.department || 'Finance Department',
      summary: summary.trim(),
      description: description.trim(),
      locationTag: locationTag.trim() || null,
      contactPhone: contactPhone.trim() || null,
      submittedAt: new Date().toISOString()
    }

    // Call Supabase / mock mutation
    const res = await createTicket({
      summary: summary.trim(),
      description: `${description.trim()}${locationTag ? `\n\nLocation: ${locationTag}` : ''}`,
      impactMetadata: 'Individual',
    })

    if (res?.data) {
      setCreatedTicketId(res.data.id)
      setFormSubmittedPayload(payload)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleResetForm = () => {
    setSummary('')
    setDescription('')
    setLocationTag('Desk 4B - Finance Floor, Building A')
    setContactPhone('ext. 4412 / +62 812-3456-7890')
    setTouched({})
    setSubmitAttempted(false)
    setFormSubmittedPayload(null)
    setCreatedTicketId(null)
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Breadcrumb & Status Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/employee" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/employee/tickets" className="hover:text-blue-600 transition-colors">My Tickets</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900">Report IT Problem</span>
        </nav>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-slate-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>IT Service Desk Live • Avg Response: 14m</span>
        </div>
      </div>

      {/* Mandatory Rule Notice Banner: Priority Assessment Disclosure */}
      <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-4 flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">Priority Evaluation Policy</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-200/60 text-blue-800 uppercase tracking-wider">
              Canonical Rule 4
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Notice: Priority level will be evaluated and assigned by IT Operations Staff upon Initial Assessment (Stage 4). Please provide clear system symptoms and error codes to assist swift triage.
          </p>
        </div>
      </div>

      {/* Form Submission Success Confirmation Banner */}
      {formSubmittedPayload && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Incident Ticket Reported Successfully!</span>
            </div>
            <button
              type="button"
              onClick={() => setFormSubmittedPayload(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-emerald-800">
            Your incident has been recorded with Reference <strong className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded">#{createdTicketId ? createdTicketId.slice(0, 8) : 'NEW'}</strong> and placed into the IT Operations Queue for initial triage.
          </p>
          <div className="flex items-center gap-2 pt-1">
            {createdTicketId && (
              <button
                type="button"
                onClick={() => navigate(`/employee/tickets/${createdTicketId}`)}
                className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors inline-flex items-center gap-1.5"
              >
                <span>View Ticket #{createdTicketId.slice(0, 8)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/employee/tickets')}
              className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
              Go to My Tickets
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              File Another Incident
            </button>
          </div>
        </div>
      )}

      {/* Error Summary Banner */}
      {submitAttempted && !isFormValid && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-red-900">Please correct the highlighted form errors:</h4>
            <ul className="list-disc list-inside text-red-700 space-y-0.5">
              {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Content Grid: Asymmetric Bento Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Work Area (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Form Header */}
            <div className="p-6 bg-slate-50/70 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[11px] font-semibold tracking-tight">
                  TICKET-INTAKE-FORM
                </span>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Self-Service Intake</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Report an IT Problem</h1>
              <p className="text-xs text-slate-500 mt-1">
                Please provide specific details about the hardware, software, or network disruption to ensure rapid routing to the technical engineer.
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
              {/* Issue Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="report-summary" className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                    <span>1. Issue Summary (Headline)</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <span className={`font-mono text-xs ${summaryLength < 5 ? 'text-slate-400' : summaryLength > 140 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-semibold'}`}>
                    {summaryLength} / 150 (min. 5)
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="report-summary"
                    type="text"
                    maxLength={150}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    onBlur={() => handleBlur('summary')}
                    placeholder="e.g., Cannot connect to corporate VPN after password reset"
                    className={`w-full h-10 px-3 pl-9 rounded-lg border bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium ${
                      touched.summary && errors.summary
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                        : 'border-slate-300 focus:ring-blue-600 focus:border-transparent'
                    }`}
                    required
                  />
                  <Edit3 className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                </div>
                {touched.summary && errors.summary ? (
                  <p className="text-[11px] text-red-600 font-medium">{errors.summary}</p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    A clear, concise summary of the problem to facilitate immediate triage.
                  </p>
                )}
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="report-description" className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                    <span>2. Detailed Problem Description</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {descriptionLength} chars
                  </span>
                </div>
                <textarea
                  id="report-description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => handleBlur('description')}
                  placeholder="Please include: What happened? What were you doing when it failed? Any specific error codes (e.g. 0x80070005)? Has anyone else in your team experienced this?"
                  className={`w-full p-3 rounded-lg border bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    touched.description && errors.description
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-300 focus:ring-blue-600 focus:border-transparent'
                  }`}
                  required
                />
                {touched.description && errors.description && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.description}</p>
                )}
              </div>

              {/* Physical Location Tag & Contact Phone (Optional Helpers per UI Ref) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="report-location" className="text-xs font-semibold text-slate-900">
                      3. Workstation / Location Tag
                    </label>
                    <span className="text-[11px] text-slate-400">Optional Helper</span>
                  </div>
                  <div className="relative">
                    <input
                      id="report-location"
                      type="text"
                      value={locationTag}
                      onChange={(e) => setLocationTag(e.target.value)}
                      placeholder="e.g., Desk 4B, Finance Floor, Building A"
                      className="w-full h-10 px-3 pl-9 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Physical desk or room reference if on-site hardware inspection is required.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="report-contact" className="text-xs font-semibold text-slate-900">
                      4. Contact Phone / Extension
                    </label>
                    <span className="text-[11px] text-slate-400">Optional</span>
                  </div>
                  <div className="relative">
                    <input
                      id="report-contact"
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g., ext. 4412 / +62 812-3456-7890"
                      className="w-full h-10 px-3 pl-9 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* V1 Text-Only / V2 Attachment Scope Notice */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">File Attachments:</span>
                    <span className="text-slate-500 ml-1">Deferred to Roadmap V2 (V1 is strictly text-only as per PRD Resolution 11).</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600 uppercase tracking-wider shrink-0">
                  Roadmap V2
                </span>
              </div>

              {/* What Happens Next Guidance Box */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-900">What happens next?</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Upon submission, your incident enters the Operational Queue. An IT Engineer will evaluate priority tier (P1/P2/P3) and take active ownership of resolution. You will receive updates via portal and notifications.
                  </p>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Clear Form
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    to="/employee/tickets"
                    className="w-full sm:w-auto h-9 px-5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="w-full sm:w-auto h-9 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit IT Incident Report</span>
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* Quick Knowledge Base Helper */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Quick Fix: GlobalProtect VPN Re-Authentication</div>
                <p className="text-[11px] text-slate-500">Check common self-help steps for clearing expired token credentials before filing.</p>
              </div>
            </div>
            <Link
              to="/employee/help"
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-600 text-xs font-semibold transition-colors"
            >
              View Guide
            </Link>
          </div>
        </div>

        {/* Right Column: Reporter Context & System Diagnostics (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* User Profile Identity Bento Card */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {profile?.full_name ? profile.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('') : 'RA'}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-900">{profile?.full_name || 'Rian Ardiansyah'}</h3>
                <p className="text-[11px] text-slate-500 font-mono">EMP-88421 • Regular Staff</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Department:
                </span>
                <span className="font-semibold text-slate-900">{profile?.department || 'Finance & Accounting'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email:
                </span>
                <span className="font-semibold text-slate-900 font-mono text-[11px]">{profile?.email || 'rian.ardiansyah@corp.internal'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Extension:
                </span>
                <span className="font-semibold text-slate-900 font-mono">Ext. 4022</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Reporting Manager:
                </span>
                <span className="font-semibold text-slate-900">Dewi Sartika (Head of Treasury)</span>
              </div>
            </div>
          </section>

          {/* Configuration Item (CI) Telemetry Bento Card */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Host Context Item (CI)</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Agent Synced
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Asset Tag / Hostname:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">FIN-WS-0412</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hardware Model:</span>
                <span className="font-semibold text-slate-900">ThinkPad T14s Gen 3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Assigned IP Address:</span>
                <span className="font-mono text-slate-700">10.14.88.204 (Subnet B)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Operating System:</span>
                <span className="font-semibold text-slate-900">Windows 11 Pro Enterprise</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
