import React, { useState, useEffect, useCallback } from 'react'
import { X, AlertTriangle, Send, ShieldAlert } from 'lucide-react'

/**
 * DisputeResolutionModal — Modal for employees to reject a proposed IT resolution
 * and re-open investigation with specific failure telemetry.
 *
 * Source of Truth:
 *   - docs/uireference/employee_portal_dispute_resolution_modal/code.html
 *   - docs/analysis/business-rules.md (Rule 5: Verification & Dispute)
 *
 * Requirements:
 *   - Pure domain UI component.
 *   - Enforces min. 20 characters dispute explanation.
 *   - Controlled via isOpen, onClose, onSubmit props.
 *   - No direct database/Supabase queries in Stage 2.
 */
export default function DisputeResolutionModal({
  isOpen = false,
  onClose,
  onSubmit,
  ticketId = 'INC-1049',
  ticketTitle = 'Cannot connect to corporate VPN after password reset',
  technicianName = 'Budi Santoso',
  isSubmitting = false
}) {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  const MIN_CHARS = 20
  const charCount = reason.trim().length
  const isValid = charCount >= MIN_CHARS

  const handleFormSubmit = useCallback((e) => {
    e?.preventDefault()
    setTouched(true)
    if (!isValid || isSubmitting) return

    onSubmit?.({
      ticketId,
      reason: reason.trim()
    })
  }, [isValid, isSubmitting, onSubmit, ticketId, reason])

  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setTouched(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose?.()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid && !isSubmitting) {
        e.preventDefault()
        handleFormSubmit(e)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isValid, isSubmitting, onClose, handleFormSubmit])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispute-modal-title"
    >
      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        {/* Top Warning Accent Bar */}
        <div className="h-1.5 w-full bg-red-600" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 bg-red-50/50 flex items-start justify-between gap-4 border-b border-red-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="dispute-modal-title" className="text-base font-semibold text-slate-900 tracking-tight">
                  Dispute Resolution &amp; Re-Open
                </h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                  #{ticketId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {ticketTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            Please provide specific technical details regarding what failed during your verification test. This information is immediately dispatched to <strong className="text-slate-900 font-semibold">{technicianName}</strong> to resume incident handling without delay.
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dispute-reason" className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>
                Dispute Explanation &amp; Error Telemetry <span className="text-red-500 font-bold">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal lowercase">(Min. 20 characters required)</span>
            </label>

            <textarea
              id="dispute-reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (!touched) setTouched(true)
              }}
              placeholder="Example: GlobalProtect still throws 'Authentication Failed (Code: GP-102)' after entering new password. ERP internal portal remains inaccessible."
              className={`w-full rounded-lg bg-white p-3 text-xs text-slate-900 border focus:outline-none focus:ring-2 transition-all ${
                touched && !isValid
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-300 focus:ring-blue-600 focus:border-transparent'
              }`}
              required
            />

            <div className="flex justify-between items-center text-[11px] mt-0.5">
              <span className={`font-mono ${isValid ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                {charCount} / {MIN_CHARS} characters minimum
              </span>
              {touched && !isValid && (
                <span className="text-red-600 font-medium">
                  Please enter at least {MIN_CHARS - charCount} more characters.
                </span>
              )}
            </div>
          </div>

          {/* Impact Notice */}
          <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Submitting a dispute immediately returns ticket stage to <strong>In Progress</strong> and alerts the assigned engineer.</span>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting Dispute...' : 'Submit Dispute & Re-Open'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
