import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://unquzddtylzqufnvrlhb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_qPpybL3kqSusSL9DfkkGJA_MqGI5gkU'

async function debugFlow1() {
  const staff = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  await staff.auth.signInWithPassword({ email: 'ahmad.pratama@corp.internal', password: 'Password123!' })

  const emp = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  await emp.auth.signInWithPassword({ email: 'budi.santoso@corp.internal', password: 'Password123!' })

  const ticketId = '3fd14896-0dbe-4935-89ed-13c09f7c9db1'
  const { data: staffNotifs } = await staff.from('notifications').select('*').eq('source_ticket_id', ticketId)
  const { data: empNotifs } = await emp.from('notifications').select('*').eq('source_ticket_id', ticketId)

  console.log('Staff Notifs (targeted to staff):', staffNotifs?.length, staffNotifs?.map(n => `${n.event_type} -> target: ${n.target_user_id}`))
  console.log('Emp Notifs (targeted to emp)    :', empNotifs?.length, empNotifs?.map(n => `${n.event_type} -> target: ${n.target_user_id}`))
}

debugFlow1()
