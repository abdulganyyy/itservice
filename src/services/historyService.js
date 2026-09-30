import { supabase, isSupabaseConfigured } from './supabaseClient'
import { mockStore } from './mockDataStore'
import { fetchUsers } from './ticketService'

/**
 * Fetch chronological audit logs for a specific ticket (ACT-13)
 */
export async function fetchTicketHistory(ticketId) {
  if (isSupabaseConfigured()) {
    const users = await fetchUsers()
    const usersMap = Object.fromEntries(users.map((u) => [u.id, u]))

    const { data, error } = await supabase
      .from('ticket_history')
      .select(`
        id,
        ticket_id,
        actor_id,
        event_type,
        change_payload,
        created_at,
        actor:actor_id(id, full_name, email, role)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(error.message || `Failed to fetch history for ticket ${ticketId}`)
    }

    return (data || []).map((entry) => ({
      ...entry,
      actor: entry.actor || usersMap[entry.actor_id] || {
        id: entry.actor_id,
        full_name: entry.change_payload?.actor_name || 'System / Operator',
        role: 'IT Staff',
      },
    }))
  }

  const users = await fetchUsers()
  const usersMap = Object.fromEntries(users.map((u) => [u.id, u]))
  const allHistory = mockStore.getHistory()
  const filtered = allHistory
    .filter((h) => h.ticket_id === ticketId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  return filtered.map((entry) => ({
    ...entry,
    actor: usersMap[entry.actor_id] || {
      id: entry.actor_id,
      full_name: entry.change_payload?.actor_name || 'System / Operator',
      role: 'IT Staff',
    },
  }))
}
