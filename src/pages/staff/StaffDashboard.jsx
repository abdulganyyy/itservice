import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Shield, ShieldCheck, Info } from 'lucide-react'

export default function StaffDashboard() {
  const { profile } = useAuth()

  return (
    <div className="space-y-space-md">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm bg-surface-container-lowest border border-outline-variant/60 p-space-md rounded-xl shadow-xs">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-title-lg font-semibold text-on-surface">
              Operational Console: {profile?.full_name || 'IT Staff Specialist'}
            </h1>
            <p className="text-body-sm text-on-surface-variant">
              Central Incident Operational Queue &amp; Triage Workspace
            </p>
          </div>
        </div>
        <Badge variant="default" className="font-mono text-label-sm bg-primary text-on-primary">
          ROLE: {profile?.role}
        </Badge>
      </div>

      {/* Verified Profile Card */}
      <Card className="bg-surface-container-lowest border-outline-variant/60 shadow-xs">
        <CardHeader>
          <CardTitle className="text-title-md font-semibold text-on-surface flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Authenticated IT Staff Profile (public.users)</span>
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
              <Badge variant="default" className="mt-0.5 bg-primary text-on-primary">{profile?.role}</Badge>
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
              Authentication session, IT Staff role authorization, and operational shell layouts are active. Queue management, initial assessment, assignment, resolution submission, and audio-visual alerts will be activated in Stage 5.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
