import React from 'react'

/**
 * MetricTriageCard — Displays a single KPI/summary metric card.
 *
 * Source of Truth:
 *   - docs/uireference/employee_portal_dashboard/code.html (3-card grid)
 *   - docs/uireference/it_staff_operational_queue/code.html (4-card triage strip)
 *
 * Props:
 *   label       {string}       — Short uppercase label (e.g. "Tickets In Progress")
 *   value       {string|number}— Primary metric value (e.g. "2", "99.4%")
 *   subLabel    {string}       — Descriptive sub-text shown below value
 *   icon        {ReactNode}    — Icon component (from lucide-react)
 *   accent      {string}       — Accent color key: 'default' | 'blue' | 'red' | 'green' | 'amber'
 *   accentLeft  {boolean}      — If true, shows a left-edge colored accent bar (IT Staff style)
 *   highlight   {boolean}      — If true, uses surface-container-high background (attention state)
 *   className   {string}       — Optional extra class names
 */

const ACCENT_MAP = {
  default: { bar: 'bg-outline',           icon: 'text-outline',    value: 'text-on-surface' },
  blue:    { bar: 'bg-secondary-container',icon: 'text-secondary', value: 'text-on-surface' },
  red:     { bar: 'bg-error',             icon: 'text-error',      value: 'text-error'      },
  green:   { bar: 'bg-emerald-500',       icon: 'text-emerald-600',value: 'text-on-surface' },
  amber:   { bar: 'bg-amber-500',         icon: 'text-amber-600',  value: 'text-on-surface' },
}

export function MetricTriageCard({
  label,
  value,
  subLabel,
  icon: Icon,
  accent = 'default',
  accentLeft = false,
  highlight = false,
  className = '',
}) {
  const colors = ACCENT_MAP[accent] ?? ACCENT_MAP.default

  return (
    <div
      className={[
        'relative rounded shadow-sm flex flex-col justify-between gap-space-sm overflow-hidden',
        highlight ? 'bg-surface-container-high p-space-md' : 'bg-surface-container-lowest p-space-md',
        className,
      ].join(' ')}
    >
      {/* Left edge accent bar (IT Staff dashboard style) */}
      {accentLeft && (
        <div className={['absolute top-0 left-0 w-1.5 h-full', colors.bar].join(' ')} />
      )}

      {/* Header: label + icon */}
      <div className={['flex items-center justify-between', accentLeft ? 'pl-space-xs' : ''].join(' ')}>
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
        {Icon && <Icon size={18} className={colors.icon} />}
      </div>

      {/* Value */}
      <div className={['my-1', accentLeft ? 'pl-space-xs' : ''].join(' ')}>
        <span className={['font-display-lg text-display-lg font-bold tabular-nums', colors.value].join(' ')}>
          {value ?? '—'}
        </span>
      </div>

      {/* Sub-label */}
      {subLabel && (
        <div className={['flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant leading-snug', accentLeft ? 'pl-space-xs' : ''].join(' ')}>
          {subLabel}
        </div>
      )}
    </div>
  )
}

export default MetricTriageCard
