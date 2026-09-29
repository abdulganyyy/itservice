import React from 'react'

/**
 * EmptyState — Standardized empty/no-data indicator used across all pages.
 *
 * Props:
 *   icon      {ReactNode} — Icon component (from lucide-react)
 *   title     {string}    — Primary empty state message
 *   message   {string}    — Descriptive sub-text
 *   action    {ReactNode} — Optional CTA button/link
 *   className {string}    — Optional extra class names
 */
export function EmptyState({ icon: Icon, title, message, action, className = '' }) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center py-space-xl px-space-md text-center gap-space-md',
        className,
      ].join(' ')}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-outline">
          <Icon size={28} />
        </div>
      )}
      <div className="space-y-space-xs max-w-xs">
        {title && (
          <p className="font-headline-sm text-on-surface">{title}</p>
        )}
        {message && (
          <p className="font-body-md text-on-surface-variant">{message}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState
