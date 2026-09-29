import React from 'react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

/**
 * HistoryTimeline — Renders a chronological append-only activity timeline
 * for a ticket's lifecycle events and work notes.
 *
 * Source of Truth:
 *   - docs/uireference/it_staff_ticket_detail_operational_workspace/code.html
 *     (Section: Work Notes & Activity Feed)
 *   - docs/uireference/it_staff_incident_history_traceability_archive/code.html
 *
 * This component is purely presentational. No data fetching or Supabase
 * queries are implemented here — those are wired in Stage 5/6.
 *
 * Props:
 *   entries  {Array}   — Array of timeline entry objects (see shape below)
 *   loading  {boolean} — If true, shows a loading skeleton
 *
 * Entry shape:
 *   {
 *     id:          string,
 *     type:        'system' | 'note' | 'stage_change' | 'assignment',
 *     actor:       string,          // Display name of the actor
 *     actorRole:   string,          // Role label (e.g. "IT Staff", "System")
 *     content:     string,          // Main text content of the entry
 *     timestamp:   string,          // ISO 8601 timestamp string
 *     relativeTime:string,          // Pre-computed relative label (e.g. "12m ago")
 *     stage:       string | null,   // Lifecycle stage change value, if applicable
 *     priority:    string | null,   // Priority change value, if applicable
 *   }
 */

const TYPE_LABEL = {
  system:       'System Event',
  work_note:    'Work Note',
  note:         'Work Note',
  stage_change: 'Stage Transition',
  assignment:   'Assignment',
  resolution:   'Resolution Submitted',
  closed:       'Incident Closed'
}

function TimelineEntry({ entry }) {
  const actorName = entry.author || entry.actor || 'System'
  const actorRole = entry.role || entry.actorRole || ''

  // Derive initials for the avatar
  const initials = actorName
    ? actorName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?'

  const isSystem = entry.type === 'system' || entry.type === 'stage_change'

  return (
    <div className="flex gap-3 relative">
      {/* Timeline left column: avatar + connector line */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0 ${
            isSystem
              ? 'bg-slate-200 text-slate-700'
              : 'bg-blue-600 text-white'
          }`}
        >
          {isSystem ? '⚡' : initials}
        </div>
        {/* Connector line */}
        <div className="w-0.5 flex-1 bg-slate-200 mt-1 mb-1 min-h-[16px]" />
      </div>

      {/* Entry body */}
      <div className="flex-1 bg-slate-50 border border-slate-200/80 p-3 rounded-lg flex flex-col gap-1 mb-2">
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-900">
              {actorName}
            </span>
            {actorRole && (
              <span className="text-[10px] text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded font-medium">
                {actorRole}
              </span>
            )}
            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
              {TYPE_LABEL[entry.type] || 'Activity Log'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {entry.timestamp || entry.relativeTime}
          </span>
        </div>

        {/* Stage / Priority change tags */}
        {(entry.stage || entry.priority) && (
          <div className="flex items-center gap-space-xs flex-wrap">
            {entry.stage && <StatusBadge status={entry.stage} size="sm" />}
            {entry.priority && <PriorityBadge priority={entry.priority} size="sm" />}
          </div>
        )}

        {/* Content */}
        {entry.content && (
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            {entry.content}
          </p>
        )}
      </div>
    </div>
  )
}

function HistoryTimelineSkeleton() {
  return (
    <div className="flex flex-col gap-space-sm pl-2 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-space-sm">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-surface-container-high" />
            <div className="w-0.5 flex-1 bg-surface-container mt-1 min-h-[40px]" />
          </div>
          <div className="flex-1 bg-surface-container-low rounded p-space-sm space-y-1 mb-space-sm">
            <div className="h-3 bg-surface-container-high rounded w-1/2" />
            <div className="h-3 bg-surface-container rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HistoryTimeline({ entries = [], loading = false }) {
  if (loading) return <HistoryTimelineSkeleton />

  if (!entries.length) {
    return (
      <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-space-md">
        No activity recorded yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col pl-2">
      {entries.map((entry) => (
        <TimelineEntry key={entry.id} entry={entry} />
      ))}
    </div>
  )
}

export default HistoryTimeline
