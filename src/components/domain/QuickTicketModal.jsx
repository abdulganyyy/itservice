import React, { useState, useEffect, useCallback } from 'react'
import { X, Zap, Volume2, AlertCircle, Laptop, PhoneCall, RefreshCw } from 'lucide-react'

/**
 * QuickTicketModal — Rapid incident creation modal for IT Staff.
 *
 * Source of Truth:
 *   - docs/uireference/it_staff_quick_ticket_modal/code.html
 *   - docs/uireference/enterprise_it_service_console/DESIGN.md
 *
 * Requirements & Boundaries:
 *   - Pure domain UI component.
 *   - Controlled via isOpen, onClose, onSubmit props.
 *   - Minimum fields: Reporter Employee, Incident Summary (<=120 chars), Priority, Category.
 *   - No direct database/Supabase queries in Stage 2.
 */
export default function QuickTicketModal({
  isOpen = false,
  onClose,
  onSubmit,
  currentUser = { name: 'Budi Santoso', role: 'Senior IT Systems Engineer' },
  initialData = {}
}) {
  const [reporter] = useState(initialData.reporter || 'Rian Ardiansyah (EMP-88421 • Finance & Accounting)')
  const [summary, setSummary] = useState(initialData.summary || '')
  const [priority, setPriority] = useState(initialData.priority || 'high')
  const [category, setCategory] = useState(initialData.category || 'Network & Connectivity (VPN / Wi-Fi / Gateway)')
  const [immediateAction, setImmediateAction] = useState(initialData.immediateAction || '')
  const [assignToMe, setAssignToMe] = useState(true)

  const charCount = summary.length

  const handleFormSubmit = useCallback((e) => {
    e?.preventDefault()
    if (!summary.trim()) return

    onSubmit?.({
      reporter,
      summary: summary.trim(),
      priority,
      category,
      immediateAction: immediateAction.trim(),
      assignToMe,
      assignedTo: assignToMe ? currentUser.name : null
    })
  }, [summary, onSubmit, reporter, priority, category, immediateAction, assignToMe, currentUser.name])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose?.()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleFormSubmit(e)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleFormSubmit])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-ticket-title"
    >
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Top Urgency Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />

        {/* 1. Modal Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 bg-slate-50 flex items-start justify-between gap-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="quick-ticket-title" className="text-lg font-semibold text-slate-900 tracking-tight">
                  Create Quick Ticket
                </h2>
                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[11px] uppercase font-bold tracking-wide border border-red-200">
                  Urgent Incident Entry
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Rapid documentation for phone calls, walk-ups, or direct reports. Fill minimal fields to log incident without blocking immediate technical response.
              </p>
            </div>
          </div>

          {/* Dismiss & Shortcut Info */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="font-mono text-[11px] text-slate-400 select-none hidden sm:inline-block">
              ESC to cancel • ⌘+↵ save
            </span>
          </div>
        </div>

        {/* 2. Compliance Banner */}
        <div className="mx-5 sm:mx-6 mt-4 px-4 py-2.5 bg-blue-50/80 border border-blue-100 rounded-lg flex items-center gap-3">
          <Zap className="w-4 h-4 text-blue-600 shrink-0" />
          <p className="text-xs text-slate-700">
            <span className="font-semibold text-blue-700">Operational Principle:</span> Quick Ticket creates a formal traceable record (<code className="font-mono text-blue-700 font-semibold">#INC-LIVE</code>) instantly so assistance is recorded without forcing lengthy forms.
          </p>
        </div>

        {/* 3. Modal Form Body */}
        <form onSubmit={handleFormSubmit} className="px-5 sm:px-6 py-4 overflow-y-auto flex flex-col gap-5">
          {/* Minimal Required Inputs */}
          <div className="flex flex-col gap-4">
            {/* Field 1: Reporter Employee */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                  <span>Reporter Employee</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                  <PhoneCall className="w-3 h-3" /> Active Inbound Call Context
                </span>
              </div>

              {/* Autocomplete Card / Selector */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    RA
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">Rian Ardiansyah</span>
                      <span className="font-mono text-xs text-slate-500">(EMP-88421 • Finance &amp; Accounting)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                      <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-medium">
                        Ext. 4022
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                        <Laptop className="w-3 h-3" /> FIN-WS-0412
                      </span>
                      <span className="text-emerald-600 text-[11px] flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verified Endpoint
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-blue-600 p-1.5 rounded transition-colors"
                  title="Switch Reporter"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] text-slate-500">
                Type employee name, NIK, or extension to auto-populate reporter context and device profile.
              </span>
            </div>

            {/* Field 2: Incident Summary */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="quick-incident-summary" className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                  <span>Incident Summary / Observed Symptom</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <span className={`font-mono text-xs ${charCount > 100 ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
                  {charCount} / 120
                </span>
              </div>
              <input
                id="quick-incident-summary"
                type="text"
                maxLength={120}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What is failing? (e.g., Cannot connect to SAP / Wi-Fi disconnected)"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                required
              />
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Recommended syntax: [Component] + [Symptom / Error message]. Be crisp for the telemetry log.</span>
              </div>
            </div>
          </div>

          {/* Section B: Immediate Ownership & Priority Selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
            {/* Assign To Me Checkbox */}
            <div
              onClick={() => setAssignToMe(!assignToMe)}
              className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer select-none hover:border-blue-300 transition-colors"
            >
              <input
                type="checkbox"
                id="quick-assign-me"
                checked={assignToMe}
                onChange={(e) => setAssignToMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 mt-0.5 cursor-pointer"
              />
              <div className="flex flex-col flex-1">
                <label htmlFor="quick-assign-me" className="text-xs font-semibold text-slate-900 cursor-pointer flex items-center gap-2">
                  <span>Assign to me immediately (<strong className="text-blue-600 font-bold">{currentUser.name}</strong>)</span>
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                    Lead Engineer
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sets ticket straight to <span className="font-semibold text-blue-600">In Progress</span> and assigns technical ownership to you, bypassing the triage backlog.
                </p>
              </div>
            </div>

            {/* Quick Pill Priority Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-semibold text-slate-700">
                  Immediate Priority Selection
                </label>
                <span className="text-[11px] text-slate-400">Optional fast-override</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* Low */}
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    priority === 'low'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${priority === 'low' ? 'bg-slate-300' : 'bg-slate-400'}`} />
                  <span>Low</span>
                </button>

                {/* Medium */}
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    priority === 'medium'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${priority === 'medium' ? 'bg-blue-200' : 'bg-blue-500'}`} />
                  <span>Medium</span>
                </button>

                {/* High */}
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    priority === 'high'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${priority === 'high' ? 'bg-red-200 animate-pulse' : 'bg-red-500'}`} />
                  <span>High (Urgent)</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <p>High priority triggers 880Hz audio beacon for active IT queue operators.</p>
              </div>
            </div>

            {/* Technical Category & Immediate Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Category */}
              <div className="flex flex-col gap-1">
                <label htmlFor="quick-category" className="text-xs uppercase tracking-wider font-semibold text-slate-700">
                  Technical Category
                </label>
                <select
                  id="quick-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option>Network &amp; Connectivity (VPN / Wi-Fi / Gateway)</option>
                  <option>Identity &amp; Access (Active Directory / SSO / MFA)</option>
                  <option>Hardware &amp; Peripherals (Laptop / Dock / Screen)</option>
                  <option>Enterprise ERP &amp; Applications (SAP / Oracle / Mail)</option>
                  <option>Endpoint Security &amp; Antivirus Shield</option>
                </select>
              </div>

              {/* Immediate Action Taken */}
              <div className="flex flex-col gap-1">
                <label htmlFor="quick-action" className="text-xs uppercase tracking-wider font-semibold text-slate-700 flex items-center justify-between">
                  <span>Immediate Action</span>
                  <span className="text-slate-400 font-normal lowercase text-[10px]">(optional)</span>
                </label>
                <input
                  id="quick-action"
                  type="text"
                  value={immediateAction}
                  onChange={(e) => setImmediateAction(e.target.value)}
                  placeholder="e.g., Restarted tunnel; pinging node..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </form>

        {/* 4. Modal Footer Action Bar */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-600">Fast Entry Mode</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 text-[11px]">Audio alert dispatched on high priority</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-sm"
            >
              Cancel (ESC)
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={!summary.trim()}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-md transition-all active:scale-[0.99]"
            >
              <Zap className="w-4 h-4" />
              <span>Create Quick Ticket &amp; Start Work</span>
              <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold hidden sm:inline-block">
                ⌘ ↵
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
