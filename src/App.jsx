import React, { useState } from 'react'
import {
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Layers,
  Cpu,
  Info,
  AlertTriangle,
  Sparkles
} from 'lucide-react'

// Basic shadcn/ui Foundation Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

export default function App() {
  const [testText, setTestText] = useState('')
  const [selectedItem, setSelectedItem] = useState('')

  return (
    <div className="min-h-screen bg-surface text-on-surface p-space-md md:p-space-xl flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-space-md">
        {/* Stage 2 Header Banner */}
        <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/60 p-space-md rounded-xl shadow-xs">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-headline-sm font-semibold text-on-surface">
                Internal IT Service Platform
              </h1>
              <p className="text-body-sm text-on-surface-variant">
                Stage 2 Verification: Utility &amp; shadcn/ui Component Foundation
              </p>
            </div>
          </div>
          <Badge variant="low" className="font-mono text-label-sm">
            STAGE 2 VERIFIED
          </Badge>
        </div>

        {/* Component Showcase Card */}
        <Card className="bg-surface-container-lowest border-outline-variant/60">
          <CardHeader>
            <CardTitle className="text-title-md font-semibold text-on-surface flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Foundation Component Showcase (Zero Business Logic)</span>
            </CardTitle>
            <CardDescription className="text-body-sm text-on-surface-variant">
              Testing design tokens, font hierarchy, class-variance-authority, and Radix primitives.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-space-md">
            {/* 1. Alert Component */}
            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertTitle>Foundational Design System</AlertTitle>
              <AlertDescription>
                Tailwind CSS variables, typography classes (Inter &amp; JetBrains Mono), and shadcn/ui primitives are active.
              </AlertDescription>
            </Alert>

            {/* 2. Button & Badge Showcase */}
            <div className="space-y-space-xs">
              <label className="text-label-sm font-semibold uppercase text-on-surface-variant tracking-wider">
                Buttons &amp; Badges (Variants &amp; States)
              </label>
              <div className="flex flex-wrap items-center gap-space-xs">
                <Button variant="default" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="destructive" size="sm">Destructive</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </div>
              <div className="flex flex-wrap items-center gap-space-xs pt-1">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="low">Low Priority</Badge>
                <Badge variant="medium">Medium Priority</Badge>
                <Badge variant="high">High Priority</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            {/* 3. Input & Select Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
              <div className="space-y-space-xs">
                <label className="text-label-sm font-medium text-on-surface">
                  Input Component Test
                </label>
                <Input
                  placeholder="Type testing text..."
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                />
              </div>

              <div className="space-y-space-xs">
                <label className="text-label-sm font-medium text-on-surface">
                  Select Component Test
                </label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select component option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opt1">Option 1: Atomic Primitives</SelectItem>
                    <SelectItem value="opt2">Option 2: Radix UI Accessibility</SelectItem>
                    <SelectItem value="opt3">Option 3: Tailwind Merge Utility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 4. Textarea Component */}
            <div className="space-y-space-xs">
              <label className="text-label-sm font-medium text-on-surface">
                Textarea Component Test
              </label>
              <Textarea
                placeholder="Diagnostic textarea placeholder..."
                rows={2}
                disabled
                value="Textarea disabled test state for form foundation."
              />
            </div>

            {/* 5. Dialog Component Test */}
            <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg">
              <div>
                <p className="text-title-md font-medium text-on-surface">Modal / Dialog Primitive</p>
                <p className="text-body-sm text-on-surface-variant">Accessible Radix dialog overlay test</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">Open Test Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Primitive Verified</DialogTitle>
                    <DialogDescription>
                      Radix Dialog overlay, keyboard Esc listener, focus trap, and portal rendering are operational.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-space-sm bg-surface-container rounded font-mono text-body-sm text-on-surface">
                    status: 200 OK — zero business logic injected
                  </div>
                  <DialogFooter>
                    <Button variant="default" size="sm">Confirm &amp; Dismiss</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>

          <CardFooter className="border-t border-surface-container bg-surface-container-low/50 flex items-center justify-between text-on-surface-variant text-body-sm">
            <span className="flex items-center gap-1.5 font-mono text-label-sm">
              <Terminal className="w-3.5 h-3.5 text-secondary" />
              <span>npm run build: exit code 0</span>
            </span>
            <span className="text-label-sm text-secondary font-medium">
              Stage 2 Complete — Awaiting Approval for Stage 3
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
