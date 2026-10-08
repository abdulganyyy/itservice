import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Laptop,
  Wifi,
  Key,
  Database
} from 'lucide-react'

const FAQ_ITEMS = [
  {
    q: 'What should I do if my VPN authentication fails after password reset?',
    a: 'When you change your Active Directory password, the Palo Alto GlobalProtect client may retain expired Kerberos token cache. Disconnect the VPN, right-click the tray icon to quit completely, restart the application, and log in with your updated credentials.'
  },
  {
    q: 'How long does IT take to respond to high priority tickets?',
    a: 'Critical / P1 incidents have an SLA target of less than 15 minutes for Initial Assessment and a 4-hour resolution commitment. Standard incidents are triaged within 45 minutes.'
  },
  {
    q: 'What is the mandatory Employee Verification step?',
    a: 'Under Stage 9 of our ITIL workflow, tickets are not closed immediately when a technician finishes work. You are given 48 hours to test the solution on your workstation and either Confirm & Close or submit a Dispute if the issue persists.'
  },
  {
    q: 'How do I request software licenses or ERP access permissions?',
    a: 'Use the "Report IT Problem" intake form and specify your software or ERP access requirements in the issue description. Ensure your department manager has approved the role requisition in advance.'
  }
]

export default function EmployeeHelpPage() {
  const [openIdx, setOpenIdx] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col w-full space-y-6 mt-14">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Help Center &amp; IT Service Guidelines</h1>
            <p className="text-xs text-slate-500">
              Self-help guides, frequently asked questions, and direct IT Support escalation contacts.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search self-help articles, error codes, VPN guides..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-lg border border-slate-300 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Quick Category Knowledge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wifi className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Network &amp; VPN</h3>
          <p className="text-[11px] text-slate-500">Wi-Fi configuration, GlobalProtect, certificates, and proxy setup.</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Identity &amp; Passwords</h3>
          <p className="text-[11px] text-slate-500">Self-service password reset, MFA tokens, and SSO authentication.</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">SAP &amp; Enterprise Apps</h3>
          <p className="text-[11px] text-slate-500">S/4HANA client setup, Oracle database tools, and browser certificates.</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Laptop className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Hardware &amp; Workstations</h3>
          <p className="text-[11px] text-slate-500">Monitors, docks, laptop repair requisitions, and peripherals.</p>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Frequently Answered Questions
        </h2>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-lg overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                className="w-full p-3.5 bg-slate-50/60 hover:bg-slate-100/70 text-left flex items-center justify-between text-xs font-bold text-slate-900 transition-colors"
              >
                <span>{faq.q}</span>
                {openIdx === idx ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {openIdx === idx && (
                <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold">Still experiencing technical disruption?</h3>
          <p className="text-xs text-slate-300">
            For emergencies or total system outages, contact the IT Service Desk hotline immediately.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg text-xs font-mono">
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span>Hotline: Ext. 4000</span>
          </div>
          <Link
            to="/employee/report"
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Submit Ticket
          </Link>
        </div>
      </div>
    </div>
  )
}
