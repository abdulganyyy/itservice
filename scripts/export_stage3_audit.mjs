import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://unquzddtylzqufnvrlhb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_qPpybL3kqSusSL9DfkkGJA_MqGI5gkU'

async function exportAudit() {
  const staff = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  await staff.auth.signInWithPassword({ email: 'ahmad.pratama@corp.internal', password: 'Password123!' })

  const emp = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  await emp.auth.signInWithPassword({ email: 'budi.santoso@corp.internal', password: 'Password123!' })

  const { data: tickets } = await staff.from('tickets').select('*, reporter:reporter_id(full_name, role), assignee:assignee_id(full_name, role)').order('created_at')
  const { data: history } = await staff.from('ticket_history').select('*, actor:actor_id(full_name, role)').order('created_at')
  const { data: staffNotifs } = await staff.from('notifications').select('*').order('created_at')
  const { data: empNotifs } = await emp.from('notifications').select('*').order('created_at')

  console.log('=== TICKETS IN DATABASE (' + tickets.length + ') ===')
  tickets.forEach(t => {
    console.log(`\nTicket ID: ${t.id}`)
    console.log(`  Summary  : ${t.summary}`)
    console.log(`  Reporter : ${t.reporter?.full_name} (${t.reporter?.role})`)
    console.log(`  Assignee : ${t.assignee ? `${t.assignee.full_name} (${t.assignee.role})` : 'Unassigned (null)'}`)
    console.log(`  Status   : ${t.status}`)
    console.log(`  Priority : ${t.priority || 'null'}`)
    console.log(`  Impact   : ${t.impact_metadata || 'null'}`)
    console.log(`  Created  : ${t.created_at}`)
    console.log(`  Closed   : ${t.closed_at || 'null'}`)
    if (t.resolution_notes) console.log(`  Resolution: ${t.resolution_notes.slice(0, 80)}...`)
    if (t.verification_feedback) console.log(`  Feedback : ${t.verification_feedback}`)
  })

  console.log('\n=== TICKET HISTORY AUDIT LOGS (' + history.length + ') ===')
  history.forEach(h => {
    console.log(`  [${h.created_at}] Ticket: ${h.ticket_id.slice(0, 8)}... | Event: ${h.event_type} | Actor: ${h.actor?.full_name} (${h.actor?.role})`)
    console.log(`    Payload: ${JSON.stringify(h.change_payload)}`)
  })

  console.log('\n=== NOTIFICATIONS DELIVERED (' + (staffNotifs.length + empNotifs.length) + ') ===')
  console.log('-- Target: Employee (Budi Santoso) --')
  empNotifs.forEach(n => {
    console.log(`  [${n.created_at}] Ticket: ${n.source_ticket_id.slice(0, 8)}... | Event: ${n.event_type} | Audio: ${n.audio_priority_context} | State: ${n.persistent_unread_state}`)
  })
  console.log('-- Target: IT Staff (Ahmad Pratama) --')
  staffNotifs.forEach(n => {
    console.log(`  [${n.created_at}] Ticket: ${n.source_ticket_id.slice(0, 8)}... | Event: ${n.event_type} | Audio: ${n.audio_priority_context} | State: ${n.persistent_unread_state}`)
  })
}

exportAudit()
