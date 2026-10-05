import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  LogIn,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Monitor,
  Clock,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Brand logo mark — reuses the same shield SVG used across all layouts
// ---------------------------------------------------------------------------
function BrandLogo({ size = 'md' }) {
  const sizeMap = {
    sm: { container: 'w-8 h-8 rounded-lg', icon: 'w-5 h-5' },
    md: { container: 'w-12 h-12 rounded-xl', icon: 'w-7 h-7' },
    lg: { container: 'w-16 h-16 rounded-2xl', icon: 'w-9 h-9' },
  }
  const s = sizeMap[size] ?? sizeMap.md

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-primary-container shrink-0',
        s.container
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn('text-inverse-on-surface', s.icon)}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Feature highlight item used inside the left decorative panel
// ---------------------------------------------------------------------------
function FeatureItem({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-space-md">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 shrink-0 mt-0.5">
        <Icon size={18} className="text-white/80" />
      </div>
      <div>
        <p className="text-body-md font-semibold text-white leading-snug">{title}</p>
        <p className="text-body-sm text-white/60 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// LoginPage
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [devOpen, setDevOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage('Please provide both email and corporate password.')
      return
    }

    setIsSubmitting(true)
    try {
      const { profile, error } = await signIn(email, password)

      if (error) {
        setErrorMessage(error.message || 'Authentication failed. Please verify your credentials.')
        setIsSubmitting(false)
        return
      }

      // Navigate based on genuinely fetched public.users profile role
      if (profile?.role === 'IT Staff') {
        navigate('/staff', { replace: true })
      } else {
        navigate('/employee', { replace: true })
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick dev helper to populate test credentials
  const fillDevAccount = (devEmail) => {
    setEmail(devEmail)
    setPassword('Password123!')
    setErrorMessage(null)
  }

  return (
    <div className="min-h-screen bg-surface flex items-stretch">

      {/* ------------------------------------------------------------------ */}
      {/* LEFT PANEL — decorative brand panel, hidden on mobile / tablet      */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative flex-col justify-between overflow-hidden bg-primary-container">

        {/* Subtle geometric texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.07) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
          }}
        />

        {/* Decorative rings top-right */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full border border-white/8"
        />

        {/* Decorative ring bottom-left */}
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border border-white/10"
        />

        {/* Top: Logo + wordmark */}
        <div className="relative z-10 px-10 pt-10">
          <div className="flex items-center gap-space-md">
            <BrandLogo size="sm" />
            <div className="flex flex-col justify-center">
              <span className="text-title-md font-semibold text-inverse-on-surface tracking-tight leading-none">
                IT Service Console
              </span>
              <span className="text-label-sm text-inverse-on-surface/60 uppercase tracking-wider mt-0.5">
                Internal Platform
              </span>
            </div>
          </div>
        </div>

        {/* Center: headline + feature list */}
        <div className="relative z-10 px-28 py-12 flex-1 flex flex-col justify-center gap-space-xl">
          <div>
            <h2 className="text-display-lg font-bold text-white leading-tight">
              Your IT service<br />hub, streamlined.
            </h2>
            <p className="text-body-lg text-white/60 mt-space-md leading-relaxed max-w-sm">
              Report incidents, track resolutions, and stay informed — all from one secure portal.
            </p>
          </div>

          <div className="flex flex-col gap-space-lg">
            <FeatureItem
              icon={ShieldCheck}
              title="Secure Authentication"
              description="Enterprise-grade access control with role-based permissions."
            />
            <FeatureItem
              icon={Clock}
              title="Real-time Tracking"
              description="Monitor your ticket status as IT staff resolve your request."
            />
            <FeatureItem
              icon={Users}
              title="Dual Role Support"
              description="Separate workspaces for Employees and IT Staff."
            />
            <FeatureItem
              icon={Monitor}
              title="Incident Management"
              description="Submit, categorize, and trace incidents end-to-end."
            />
          </div>
        </div>

        {/* Bottom: subtle footer note */}
        <div className="relative z-10 px-10 pb-8">
          <p className="text-label-sm text-white/30 uppercase tracking-wider">
            Internal Use Only · Confidential
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* RIGHT PANEL — login form                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 flex flex-col items-center justify-center p-space-xl sm:p-10 min-h-screen lg:min-h-0">

        {/* Mobile logo — only shows on small screens */}
        <div className="lg:hidden flex flex-col items-center gap-space-md mb-8 w-full max-w-sm">
          <BrandLogo size="md" />
          <div className="text-center">
            <h1 className="text-headline-md font-semibold text-on-surface tracking-tight">
              IT Service Console
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Corporate Incident Management &amp; Service Portal
            </p>
          </div>
        </div>

        {/* Form container */}
        <div className="w-full max-w-sm">

          {/* Heading — visible on large screens only */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-headline-lg font-semibold text-on-surface tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-body-md text-on-surface-variant mt-2">
              Enter your corporate credentials to access the portal.
            </p>
          </div>

          {/* ---- FORM ---- */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-space-lg">

              {/* Error alert */}
              {errorMessage && (
                <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Corporate email */}
              <div className="flex flex-col gap-space-xs">
                <label
                  htmlFor="email"
                  className="text-label-md font-medium text-on-surface"
                >
                  Corporate Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@corp.internal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-body-md"
                />
              </div>

              {/* Password with visibility toggle */}
              <div className="flex flex-col gap-space-xs">
                <label
                  htmlFor="password"
                  className="text-label-md font-medium text-on-surface"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="h-10 text-body-md pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className={cn(
                      'absolute inset-y-0 right-0 flex items-center justify-center w-10',
                      'text-on-surface-variant hover:text-on-surface transition-colors',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-r-md',
                      'disabled:pointer-events-none disabled:opacity-50'
                    )}
                  >
                    {showPassword
                      ? <EyeOff size={16} aria-hidden="true" />
                      : <Eye size={16} aria-hidden="true" />
                    }
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <Button
                id="login-submit"
                type="submit"
                size="lg"
                className="w-full mt-space-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span>Sign In</span>
                  </>
                )}
              </Button>

            </div>
          </form>

          {/* ---- DIVIDER ---- */}
          <div className="flex items-center gap-space-md mt-6 mb-5">
            <div className="flex-1 h-px bg-outline-variant/60" />
            <span className="text-label-sm text-on-surface-variant/60 uppercase tracking-wider">
              Dev
            </span>
            <div className="flex-1 h-px bg-outline-variant/60" />
          </div>

          {/* ---- DEV ACCOUNTS HELPER (collapsible) ---- */}
          <div className="rounded-xl border border-outline-variant/50 bg-surface-container-low/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setDevOpen((v) => !v)}
              className={cn(
                'w-full flex items-center justify-between px-space-md py-2.5',
                'text-left transition-colors hover:bg-surface-container',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              )}
              aria-expanded={devOpen}
              aria-controls="dev-accounts-panel"
            >
              <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                <KeyRound size={13} aria-hidden="true" />
                Test Accounts
              </span>
              {devOpen
                ? <ChevronUp size={14} className="text-on-surface-variant" aria-hidden="true" />
                : <ChevronDown size={14} className="text-on-surface-variant" aria-hidden="true" />
              }
            </button>

            {devOpen && (
              <div
                id="dev-accounts-panel"
                className="border-t border-outline-variant/40 px-space-md pb-space-md pt-space-sm flex flex-col gap-1.5 animate-in fade-in-0 duration-150"
              >
                <button
                  type="button"
                  onClick={() => fillDevAccount('budi.santoso@corp.internal')}
                  className="text-left px-2.5 py-2 rounded-lg text-body-sm bg-surface hover:bg-surface-container transition-colors border border-outline-variant/40 flex items-center justify-between gap-space-sm group"
                >
                  <span className="font-mono text-xs text-on-surface truncate">
                    budi.santoso@corp.internal
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                    Employee
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() => fillDevAccount('ahmad.pratama@corp.internal')}
                  className="text-left px-2.5 py-2 rounded-lg text-body-sm bg-surface hover:bg-surface-container transition-colors border border-outline-variant/40 flex items-center justify-between gap-space-sm group"
                >
                  <span className="font-mono text-xs text-on-surface truncate">
                    ahmad.pratama@corp.internal
                  </span>
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0">
                    IT Staff
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() => fillDevAccount('siti.rahma@corp.internal')}
                  className="text-left px-2.5 py-2 rounded-lg text-body-sm bg-surface hover:bg-surface-container transition-colors border border-outline-variant/40 flex items-center justify-between gap-space-sm group"
                >
                  <span className="font-mono text-xs text-on-surface truncate">
                    siti.rahma@corp.internal
                  </span>
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0">
                    IT Staff
                  </Badge>
                </button>

                <p className="text-[11px] text-on-surface-variant/70 mt-1 px-0.5">
                  Password: <code className="font-mono font-semibold text-on-surface">Password123!</code>
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Bottom footnote */}
        <p className="text-[11px] text-on-surface-variant/50 text-center mt-10 max-w-xs">
          This portal is for authorized corporate users only.
          Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}
