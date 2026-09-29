import React from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * TelemetryFeedBar — Live telemetry status bar displayed at the top of
 * the IT Staff Operations Console content area.
 *
 * Source of Truth:
 *   - docs/uireference/it_staff_operational_queue/code.html (telemetry bar section)
 *
 * This component is purely presentational. No auto-refresh or Realtime
 * behavior is implemented here — that is wired in Stage 7.
 *
 * Props:
 *   audioStatus  {string}   — Current audio level label (e.g. "Triple-tone High (1200Hz) Active")
 *   lastSyncLabel{string}   — Display label for last sync / countdown (e.g. "Refreshes in 12s")
 *   isOnline     {boolean}  — Whether the telemetry feed is considered online
 *   onTestTone   {function} — Callback for the "Test Tone" button (wired in Stage 7)
 */

export function TelemetryFeedBar({
  audioStatus = 'Audio Telemetry: Online',
  lastSyncLabel = 'Realtime feed active',
  isOnline = true,
  onTestTone,
}) {
  return (
    <div className="w-full bg-primary-container px-gutter py-space-xs flex items-center justify-between shadow-sm">
      {/* Left: Feed status */}
      <div className="flex items-center gap-space-sm min-w-0">
        <span
          className={[
            'inline-flex h-2 w-2 rounded-full flex-shrink-0',
            isOnline ? 'bg-error animate-ping' : 'bg-outline',
          ].join(' ')}
        />
        <span className="font-code-md text-code-md text-inverse-on-surface truncate">
          TELEMETRY FEED {isOnline ? 'ONLINE' : 'OFFLINE'}:{' '}
          <span className="text-secondary-fixed-dim">{audioStatus}</span>
        </span>
      </div>

      {/* Right: Sync info + Test Tone */}
      <div className="flex items-center gap-space-md shrink-0">
        <div className="flex items-center gap-space-xs text-on-primary-container font-label-sm text-label-sm">
          <RefreshCw size={14} className="text-secondary" />
          <span>{lastSyncLabel}</span>
        </div>

        {/* Test Tone — triggers AudioAlertPlayer in Stage 7 */}
        <button
          type="button"
          onClick={onTestTone}
          className="flex items-center gap-space-xs bg-surface-container-highest/20 hover:bg-surface-container-highest/40 text-inverse-on-surface px-space-xs py-0.5 rounded font-label-sm text-label-sm transition-colors"
        >
          <span className="font-code-md text-[11px]">▶</span>
          <span>Test Tone</span>
        </button>
      </div>
    </div>
  )
}

export default TelemetryFeedBar
