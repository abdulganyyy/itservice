import React from 'react'
import {
  AlertTriangle,
  UserCheck,
  Flame,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react'

/**
 * MetricTriageCard — Displays a single KPI/summary metric card.
 *
 * Source of Truth:
 *   - docs/uireference/employee_portal_dashboard/code.html (3-card grid)
 *   - docs/uireference/it_staff_operational_queue/code.html (4-card triage strip)
 */

const ICON_MAP = {
  alert: AlertTriangle,
  person: UserCheck,
  fire: Flame,
  check: CheckCircle2,
  timer: Clock,
  zap: Zap,
}

const ACCENT_MAP = {
  default: {
    bar: 'bg-outline-variant',
    icon: 'text-on-surface-variant',
    value: 'text-on-surface',
    dot: 'bg-outline',
    badge: 'bg-surface-container-high text-on-surface',
  },
  blue: {
    bar: 'bg-secondary-container',
    icon: 'text-secondary',
    value: 'text-on-surface',
    dot: 'bg-secondary',
    badge: 'bg-surface-container-high text-secondary font-semibold',
  },
  urgent: {
    bar: 'bg-error',
    icon: 'text-error',
    value: 'text-error',
    dot: 'bg-error',
    badge: 'bg-error-container text-on-error-container font-bold animate-pulse',
  },
  red: {
    bar: 'bg-error',
    icon: 'text-error',
    value: 'text-error',
    dot: 'bg-error',
    badge: 'bg-error-container text-on-error-container font-bold',
  },
  highlight: {
    bar: 'bg-secondary',
    icon: 'text-secondary',
    value: 'text-on-surface',
    dot: 'bg-secondary',
    badge: 'bg-surface-container-high text-on-surface font-semibold',
  },
  green: {
    bar: 'bg-emerald-500',
    icon: 'text-emerald-600',
    value: 'text-on-surface',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 font-semibold',
  },
  amber: {
    bar: 'bg-amber-500',
    icon: 'text-amber-600',
    value: 'text-on-surface',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 font-semibold',
  },
}

export function MetricTriageCard({
  title,
  label,
  value,
  subtitle,
  subLabel,
  icon: IconProp,
  iconName,
  badgeText,
  variant = 'default',
  accent = 'default',
  accentLeft = true,
  highlight = false,
  className = '',
}) {
  const displayTitle = title || label || ''
  const displaySubtitle = subtitle || subLabel || ''

  const effectiveVariant = variant !== 'default' ? variant : accent
  const colors = ACCENT_MAP[effectiveVariant] ?? ACCENT_MAP.default

  const ResolvedIcon = IconProp || (iconName ? ICON_MAP[iconName.toLowerCase()] : null) || null

  return (
    <div
      className={[
        'relative bg-surface-container-lowest p-space-md rounded shadow-xs flex flex-col justify-between gap-space-sm overflow-hidden border border-outline-variant/60',
        highlight || effectiveVariant === 'highlight' ? 'bg-surface-container-high' : '',
        className,
      ].join(' ')}
    >
      {/* Left edge accent bar (IT Staff dashboard style) */}
      {accentLeft && (
        <div className={['absolute top-0 left-0 w-1.5 h-full', colors.bar].join(' ')} />
      )}

      {/* Header: Title / Label + Icon */}
      <div className={['flex items-center justify-between gap-2', accentLeft ? 'pl-space-xs' : ''].join(' ')}>
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
          {displayTitle}
        </span>
        {ResolvedIcon && <ResolvedIcon size={18} className={colors.icon} />}
      </div>

      {/* Value & Badge Row */}
      <div className={['flex items-baseline justify-between gap-2 my-1', accentLeft ? 'pl-space-xs' : ''].join(' ')}>
        <span className={['font-display-lg text-display-lg font-bold tabular-nums', colors.value].join(' ')}>
          {value ?? '—'}
        </span>
        {badgeText && (
          <span className={['inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded font-label-sm text-label-sm', colors.badge].join(' ')}>
            <span className={['w-1.5 h-1.5 rounded-full shrink-0', colors.dot].join(' ')} />
            {badgeText}
          </span>
        )}
      </div>

      {/* Subtitle / Description */}
      {displaySubtitle && (
        <p className={['font-body-sm text-body-sm text-on-surface-variant leading-snug', accentLeft ? 'pl-space-xs' : ''].join(' ')}>
          {displaySubtitle}
        </p>
      )}
    </div>
  )
}

export default MetricTriageCard
