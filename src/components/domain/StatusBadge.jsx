import React from 'react'

/**
 * StatusBadge — Renders the 10 Canonical Ticket Lifecycle Stage badges.
 *
 * Source of Truth: docs/uireference/enterprise_it_service_console/DESIGN.md
 * Lifecycle Stages (state-model.md):
 *   1. Report              2. Notification          3. Operational Queue
 *   4. Initial Assessment  5. Assignment            6. In Progress
 *   7. Resolution          8. Employee Notification 9. Verification
 *  10. Closed
 *
 * Props:
 *   status  {string}  — One of the 10 canonical lifecycle stage names.
 *   size    {string}  — 'sm' | 'md' (default 'md')
 *   animate {boolean} — If true, adds pulse animation to the dot indicator.
 */

const STATUS_CONFIG = {
  'Report': {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    dotColor: 'bg-slate-400',
    label: 'Report',
    pulse: false,
  },
  'Notification': {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dotColor: 'bg-sky-500',
    label: 'Notification',
    pulse: false,
  },
  'Operational Queue': {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    dotColor: 'bg-violet-500',
    label: 'Operational Queue',
    pulse: false,
  },
  'Initial Assessment': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
    label: 'Initial Assessment',
    pulse: false,
  },
  'Assignment': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dotColor: 'bg-blue-500',
    label: 'Assignment',
    pulse: false,
  },
  'In Progress': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
    label: 'In Progress',
    pulse: true,
  },
  'Resolution': {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    dotColor: 'bg-teal-500',
    label: 'Resolution',
    pulse: false,
  },
  'Employee Notification': {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dotColor: 'bg-sky-500',
    label: 'Employee Notification',
    pulse: true,
  },
  'Verification': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    label: 'Verification',
    pulse: true,
  },
  'Closed': {
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400',
    label: 'Closed',
    pulse: false,
  },
}

const FALLBACK_CONFIG = {
  bg: 'bg-surface-container-high',
  text: 'text-on-surface-variant',
  border: 'border-outline-variant',
  dotColor: 'bg-outline',
  label: 'Unknown',
  pulse: false,
}

export function StatusBadge({ status, size = 'md', animate }) {
  const config = STATUS_CONFIG[status] ?? FALLBACK_CONFIG
  const shouldPulse = animate !== undefined ? animate : config.pulse

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px] leading-[14px] font-semibold tracking-wide'
    : 'px-2 py-0.5 font-label-sm text-label-sm'

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded border uppercase tracking-wider font-semibold',
        config.bg,
        config.text,
        config.border,
        sizeClasses,
      ].join(' ')}
    >
      <span
        className={[
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          config.dotColor,
          shouldPulse ? 'animate-pulse' : '',
        ].join(' ')}
      />
      {config.label}
    </span>
  )
}

export default StatusBadge
