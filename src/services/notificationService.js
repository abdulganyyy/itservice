import { supabase, isSupabaseConfigured } from './supabaseClient'
import { mockStore } from './mockDataStore'
import { fetchTicketById } from './ticketService'

/**
 * Format relative time string
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Just now'
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

/**
 * Map event code to human readable label
 */
function getEventLabel(eventType) {
  switch (eventType) {
    case 'EVENT_TICKET_CREATED':
      return 'New Incident Intake'
    case 'EVENT_TICKET_ASSIGNED':
      return 'Ticket Assigned'
    case 'EVENT_PRIORITY_SET':
    case 'EVENT_PRIORITY_ADJUSTED':
      return 'Priority Updated'
    case 'EVENT_RESOLUTION_SUBMITTED':
      return 'Resolution Sign-off Required'
    case 'EVENT_RESOLUTION_DISPUTED':
      return 'Resolution Disputed (Rework)'
    case 'EVENT_TICKET_CLOSED':
      return 'Incident Closed'
    default:
      return eventType?.replace(/^EVENT_/, '').replace(/_/g, ' ') || 'Notice'
  }
}

/**
 * Fetch notifications for a user (ACT-14 / ACT-16)
 */
export async function fetchNotifications(userId) {
  if (!userId) return []

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        target_user_id,
        source_ticket_id,
        event_type,
        visual_badge_active,
        audio_priority_context,
        persistent_unread_state,
        created_at,
        ticket:source_ticket_id(id, summary, priority, status)
      `)
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message || 'Failed to fetch notifications from database')
    }

    return (data || []).map((n) => ({
      id: n.id,
      ticketId: n.ticket?.id || n.source_ticket_id,
      title: n.ticket?.summary || 'IT Incident Update',
      eventLabel: getEventLabel(n.event_type),
      stage: n.ticket?.status || 'In Progress',
      priority: n.audio_priority_context || n.ticket?.priority || null,
      message: `${getEventLabel(n.event_type)} on incident #${(n.ticket?.id || n.source_ticket_id).slice(0, 8)}`,
      relativeTime: formatRelativeTime(n.created_at),
      timestamp: n.created_at,
      isRead: n.persistent_unread_state === 'read',
      requiresAction:
        n.event_type === 'EVENT_RESOLUTION_SUBMITTED' ||
        n.event_type === 'EVENT_RESOLUTION_DISPUTED',
    }))
  }

  // Mock Store Fallback for development/unconfigured mode
  const notifs = mockStore.getNotifications()
  const userNotifs = notifs.filter((n) => n.target_user_id === userId)
  const tickets = mockStore.getTickets()
  const ticketsMap = Object.fromEntries(tickets.map((t) => [t.id, t]))

  return userNotifs
    .map((n) => {
      const ticket = ticketsMap[n.source_ticket_id]
      return {
        id: n.id,
        ticketId: n.source_ticket_id,
        title: ticket?.summary || 'IT Incident Update',
        eventLabel: getEventLabel(n.event_type),
        stage: ticket?.status || 'In Progress',
        priority: n.audio_priority_context || ticket?.priority || null,
        message: `${getEventLabel(n.event_type)} on incident #${n.source_ticket_id.slice(0, 8)}`,
        relativeTime: formatRelativeTime(n.created_at),
        timestamp: n.created_at,
        isRead: n.persistent_unread_state === 'read',
        requiresAction:
          n.event_type === 'EVENT_RESOLUTION_SUBMITTED' ||
          n.event_type === 'EVENT_RESOLUTION_DISPUTED',
      }
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

/**
 * Mark a single notification as read (ACT-16)
 */
export async function markNotificationAsRead(notificationId) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          persistent_unread_state: 'read',
          visual_badge_active: false,
        })
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (err) {
      console.error('[notificationService] markNotificationAsRead error:', err)
    }
  }

  const notifs = mockStore.getNotifications()
  const updated = notifs.map((n) =>
    n.id === notificationId
      ? { ...n, persistent_unread_state: 'read', visual_badge_active: false }
      : n
  )
  mockStore.saveNotifications(updated)
  return true
}

/**
 * Mark all notifications as read for a user (ACT-16 / Option B)
 */
export async function markAllNotificationsAsRead(userId) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          persistent_unread_state: 'read',
          visual_badge_active: false,
        })
        .eq('target_user_id', userId)

      if (error) throw error
      return true
    } catch (err) {
      console.error('[notificationService] markAllNotificationsAsRead error:', err)
    }
  }

  const notifs = mockStore.getNotifications()
  const updated = notifs.map((n) =>
    n.target_user_id === userId
      ? { ...n, persistent_unread_state: 'read', visual_badge_active: false }
      : n
  )
  mockStore.saveNotifications(updated)
  return true
}
