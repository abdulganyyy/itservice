import React from 'react'
import { CheckCircle2, Terminal, ShieldCheck, Layers, Cpu } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-space-md">
      <div className="w-full max-w-xl bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-sm p-space-lg space-y-space-md">
        {/* Header */}
        <div className="flex items-center gap-space-sm border-b border-surface-container pb-space-sm">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-headline-sm font-semibold text-on-surface">
              Internal IT Service Platform
            </h1>
            <p className="text-body-sm text-on-surface-variant">
              Stage 1: Frontend Repository Initialization Verified
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-space-xs">
          <div className="flex items-center justify-between p-space-xs px-space-sm bg-surface-container-low rounded-lg text-body-sm">
            <span className="flex items-center gap-space-xs text-on-surface">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Vite + React JS Environment</span>
            </span>
            <span className="font-mono text-label-sm bg-emerald-100 text-emerald-800 px-space-xs py-0.5 rounded font-medium">
              READY
            </span>
          </div>

          <div className="flex items-center justify-between p-space-xs px-space-sm bg-surface-container-low rounded-lg text-body-sm">
            <span className="flex items-center gap-space-xs text-on-surface">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tailwind CSS &amp; Design System Tokens</span>
            </span>
            <span className="font-mono text-label-sm bg-emerald-100 text-emerald-800 px-space-xs py-0.5 rounded font-medium">
              CONFIGURED
            </span>
          </div>

          <div className="flex items-center justify-between p-space-xs px-space-sm bg-surface-container-low rounded-lg text-body-sm">
            <span className="flex items-center gap-space-xs text-on-surface">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Approved Core Dependencies Installed</span>
            </span>
            <span className="font-mono text-label-sm bg-emerald-100 text-emerald-800 px-space-xs py-0.5 rounded font-medium">
              VERIFIED
            </span>
          </div>

          <div className="flex items-center justify-between p-space-xs px-space-sm bg-surface-container-low rounded-lg text-body-sm">
            <span className="flex items-center gap-space-xs text-on-surface">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Supabase Client &amp; Path Aliases (@/*)</span>
            </span>
            <span className="font-mono text-label-sm bg-emerald-100 text-emerald-800 px-space-xs py-0.5 rounded font-medium">
              INITIALIZED
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-space-xs border-t border-surface-container flex items-center justify-between text-body-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5 font-mono text-label-sm">
            <Terminal className="w-3.5 h-3.5 text-secondary" />
            <span>npm run dev</span>
          </span>
          <span className="text-label-sm text-secondary font-medium">
            Awaiting Approval for Stage 2
          </span>
        </div>
      </div>
    </div>
  )
}
