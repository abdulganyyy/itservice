import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ShieldCheck, LogIn, AlertCircle, Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

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
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-space-md md:p-space-xl">
      <div className="w-full max-w-md space-y-space-md">
        {/* Brand Header */}
        <div className="text-center space-y-space-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 text-secondary mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-headline-sm font-semibold text-on-surface">
            Internal IT Service
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Corporate Incident Management &amp; Service Portal
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-surface-container-lowest border-outline-variant/60 shadow-xs">
          <CardHeader className="space-y-1">
            <CardTitle className="text-title-md font-semibold text-on-surface flex items-center justify-between">
              <span>Account Sign In</span>
              <Badge variant="outline" className="font-mono text-label-sm">
                Supabase Auth
              </Badge>
            </CardTitle>
            <CardDescription className="text-body-sm text-on-surface-variant">
              Enter your corporate email and password to access the portal.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-space-md">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-space-xs">
                <label
                  htmlFor="email"
                  className="text-label-sm font-medium text-on-surface"
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
                />
              </div>

              <div className="space-y-space-xs">
                <label
                  htmlFor="password"
                  className="text-label-sm font-medium text-on-surface"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    <span>Sign In</span>
                  </>
                )}
              </Button>
            </CardContent>
          </form>

          {/* Quick-fill Dev Accounts Helper */}
          <CardFooter className="flex flex-col items-start gap-space-xs border-t border-surface-container bg-surface-container-low/50 p-space-md">
            <span className="text-label-sm font-semibold text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Development Test Accounts</span>
            </span>
            <div className="grid grid-cols-1 w-full gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => fillDevAccount('budi.santoso@corp.internal', 'Employee')}
                className="text-left px-2.5 py-1.5 rounded-md text-body-sm bg-surface hover:bg-surface-container transition-colors border border-outline-variant/40 flex items-center justify-between"
              >
                <span className="font-mono text-xs text-on-surface">budi.santoso@corp.internal</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Employee</Badge>
              </button>
              <button
                type="button"
                onClick={() => fillDevAccount('ahmad.pratama@corp.internal', 'IT Staff')}
                className="text-left px-2.5 py-1.5 rounded-md text-body-sm bg-surface hover:bg-surface-container transition-colors border border-outline-variant/40 flex items-center justify-between"
              >
                <span className="font-mono text-xs text-on-surface">ahmad.pratama@corp.internal</span>
                <Badge variant="default" className="text-[10px] px-1.5 py-0">IT Staff</Badge>
              </button>
              <button
                type="button"
                onClick={() => fillDevAccount('siti.rahma@corp.internal', 'IT Staff')}
                className="text-left px-2.5 py-1.5 rounded-md text-body-sm bg-surface hover:bg-surface-container transition-colors border border-outline-variant/40 flex items-center justify-between"
              >
                <span className="font-mono text-xs text-on-surface">siti.rahma@corp.internal</span>
                <Badge variant="default" className="text-[10px] px-1.5 py-0">IT Staff</Badge>
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant/80 mt-1">
              Default development password: <code className="font-mono font-semibold">Password123!</code>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
