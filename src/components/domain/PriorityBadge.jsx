import React from 'react'

/**
 * PriorityBadge — Renders the ticket priority level badge.
 *
 * Source of Truth:
 *   - docs/uireference/enterprise_it_service_console/DESIGN.md (Priority Tiers)
 *   - docs/analysis/database-schema.md (priority: 'Low' | 'Medium' | 'High' | null)
 *   - docs/analysis/technical-mapping.md (Audio: Low=440Hz, Med=880Hz, High=1200Hz)
 *
 * Props:
 *   priority  {string|null} — 'Low' | 'Medium' | 'High' | null
 *   size      {string}      — 'sm' | 'md' (default 'md')
 *   showAudio {boolean}     — If true, shows the Hz annotation (for IT Staff views).
 */

const PRIORITY_CONFIG = {
  'High': {
    bg: 'bg-error-container',
    text: 'text-on-error-container',
    border: 'border-error/30',
    dotColor: 'bg-error',
    label: 'P1 - High',
    hz: '1200Hz',
    pulse: true,
  },
  'Medium': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
    label: 'P2 - Med',
    hz: '880Hz',
    pulse: false,
  },
  'Low': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    label: 'P3 - Low',
    hz: '440Hz',
    pulse: false,
  },
}

const UNSET_CONFIG = {
  bg: 'bg-surface-container-high',
  text: 'text-on-surface-variant',
  border: 'border-outline-variant',
  dotColor: 'bg-outline',
  label: 'Unset',
  hz: null,
  pulse: false,
}

export function PriorityBadge({ priority, size = 'md', showAudio = false }) {
  const config = priority ? (PRIORITY_CONFIG[priority] ?? UNSET_CONFIG) : UNSET_CONFIG

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px] leading-[14px] font-semibold tracking-wide'
    : 'px-2 py-0.5 font-label-sm text-label-sm'

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded border uppercase tracking-wider font-bold',
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
          config.pulse ? 'animate-pulse' : '',
        ].join(' ')}
      />
      {config.label}
      {showAudio && config.hz && (
        <span className="font-code-md text-[10px] opacity-70 normal-case tracking-normal font-normal">
          ({config.hz})
        </span>
      )}
    </span>
  )
}

export default PriorityBadge
