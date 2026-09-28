import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { UserCheck, ShieldCheck, Info } from 'lucide-react'

export default function EmployeeDashboard() {
  const { profile } = useAuth()

  return (
    <div className="space-y-space-md">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm bg-surface-container-lowest border border-outline-variant/60 p-space-md rounded-xl shadow-xs">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-title-lg font-semibold text-on-surface">
              Welcome, {profile?.full_name || 'Employee'}
            </h1>
            <p className="text-body-sm text-on-surface-variant">
              Employee Self-Service Incident Portal
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="font-mono text-label-sm">
          ROLE: {profile?.role}
        </Badge>
      </div>

      {/* Verified Profile Card */}
      <Card className="bg-surface-container-lowest border-outline-variant/60 shadow-xs">
        <CardHeader>
          <CardTitle className="text-title-md font-semibold text-on-surface flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>Authenticated Session Profile (public.users)</span>
          </CardTitle>
          <CardDescription className="text-body-sm text-on-surface-variant">
            Data resolved dynamically from PostgreSQL <code>public.users</code> linked to <code>auth.users</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-space-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-sm">
            <div className="p-space-sm bg-surface-container-low rounded-lg">
              <span className="text-label-sm text-on-surface-variant block">Full Name</span>
              <span className="text-body-sm font-medium text-on-surface">{profile?.full_name}</span>
            </div>
            <div className="p-space-sm bg-surface-container-low rounded-lg">
              <span className="text-label-sm text-on-surface-variant block">Email</span>
              <span className="text-body-sm font-mono text-on-surface truncate block">{profile?.email}</span>
            </div>
            <div className="p-space-sm bg-surface-container-low rounded-lg">
              <span className="text-label-sm text-on-surface-variant block">Resolved Role</span>
              <Badge variant="secondary" className="mt-0.5">{profile?.role}</Badge>
            </div>
            <div className="p-space-sm bg-surface-container-low rounded-lg">
              <span className="text-label-sm text-on-surface-variant block">User UUID</span>
              <span className="text-label-sm font-mono text-on-surface-variant truncate block">{profile?.id}</span>
            </div>
          </div>

          <Alert variant="info" className="mt-space-sm">
            <Info className="h-4 w-4" />
            <AlertTitle>Stage 4 Shell &amp; Auth Verification Complete</AlertTitle>
            <AlertDescription>
              Authentication session, role guard, and employee shell layouts are operating as expected. Incident ticket submission, tracking, and verification workflows will be activated in Stage 5.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
