import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTickets } from '@/hooks/useTickets'
import {
  StatusBadge,
  PriorityBadge,
  EmptyState
} from '@/components/domain'
import {
  PlusCircle,
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Inbox,
  User,
  Loader2,
} from 'lucide-react'

function formatRelativeTime(dateStr) {
  if (!dateStr) return '—'
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function EmployeeMyTicketsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { tickets, loading, metrics } = useTickets()

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Tab filter
      if (activeTab === 'verification' && ticket.status !== 'Verification') return false
      if (
        activeTab === 'active' &&
        ['Verification', 'Closed'].includes(ticket.status)
      )
        return false
      if (activeTab === 'closed' && ticket.status !== 'Closed') return false

      // Category / Impact filter
      if (categoryFilter !== 'all' && ticket.impact_metadata !== categoryFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchId = ticket.id.toLowerCase().includes(q)
        const matchTitle = ticket.summary?.toLowerCase().includes(q)
        const matchTech = ticket.assignee?.full_name?.toLowerCase().includes(q)
        if (!matchId && !matchTitle && !matchTech) return false
      }

      return true
    })
  }, [tickets, activeTab, categoryFilter, searchQuery])


  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Sub-Header / Page Title & Actions Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Reported Tickets</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-700 font-semibold">
              Scoped: {profile?.nik || 'EMP-88421'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Track resolution milestones, verify remediations, and access historical incident audits.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => alert('Exporting tickets to CSV...')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <Link
            to="/employee/report"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New Problem</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Action Required */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-amber-800 tracking-wider uppercase font-bold">Action Required</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">1</span>
                <span className="text-xs text-amber-800 font-medium">Awaiting sign-off</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-amber-100 flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Sign-off needed for #INC-1049</span>
          </div>
        </div>

        {/* Card 2: Active Operations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Active Operations</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">1</span>
                <span className="text-xs text-slate-500">Under engineering</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Estimated triage: &lt; 2h</span>
          </div>
        </div>

        {/* Card 3: In Assessment Queue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Queue &amp; Assessment</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">1</span>
                <span className="text-xs text-slate-500">Awaiting dispatcher</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>SLA target on-schedule</span>
          </div>
        </div>

        {/* Card 4: Resolved & Closed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Resolved &amp; Closed</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">2</span>
                <span className="text-xs text-slate-500">100% verified</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>4.9 / 5.0 CSAT Rating</span>
          </div>
        </div>
      </div>

      {/* Main Content: Table & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filter Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-slate-50 border-b border-slate-200 gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>All Tickets</span>
              <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">5</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'verification'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Action: Verification</span>
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">1</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'active'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>In Progress &amp; Queue</span>
              <span className="px-1.5 py-0.2 bg-slate-200 rounded-full text-[10px]">2</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('closed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'closed'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Resolved &amp; Closed</span>
              <span className="px-1.5 py-0.2 bg-slate-200 rounded-full text-[10px]">2</span>
            </button>
          </div>

          {/* Search & Filter dropdowns */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID or issue..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2 text-xs bg-white rounded-lg border border-slate-300 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Network & VPN">Network &amp; VPN</option>
              <option value="Hardware & Peripherals">Hardware &amp; Peripherals</option>
              <option value="Enterprise ERP">Enterprise ERP</option>
              <option value="Email & Collaboration">Email &amp; Collaboration</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading tickets...</span>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Problem Summary</th>
                  <th className="py-3 px-4">Impact Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Assigned Tech</th>
                  <th className="py-3 px-4">Reported</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/employee/tickets/${ticket.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      #{ticket.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 max-w-sm truncate">
                        {ticket.summary}
                      </div>
                      {ticket.status === 'Verification' && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold mt-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Requires Your Verification
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {ticket.impact_metadata || 'Standard Incident'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ticket.assignee?.full_name || 'Awaiting Assignment'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatRelativeTime(ticket.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/employee/tickets/${ticket.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No tickets found"
              description="No incident reports match your current filter criteria."
              actionLabel="Reset Filters"
              onAction={() => {
                setActiveTab('all')
                setSearchQuery('')
                setCategoryFilter('all')
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
