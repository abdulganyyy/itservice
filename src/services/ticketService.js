import { supabase, isSupabaseConfigured } from './supabaseClient'
import { mockStore } from './mockDataStore'

/**
 * Format ticket helper to attach reporter/assignee object from users list if not populated
 */
function enrichTicket(ticket, usersMap) {
  const reporter = ticket.reporter || usersMap[ticket.reporter_id] || {
    id: ticket.reporter_id,
    full_name: 'Employee',
    email: '',
    role: 'Employee',
  }
  const assignee = ticket.assignee_id
    ? ticket.assignee || usersMap[ticket.assignee_id] || {
        id: ticket.assignee_id,
        full_name: 'IT Staff',
        email: '',
        role: 'IT Staff',
      }
    : null

  return {
    ...ticket,
    reporter,
    assignee,
  }
}

/**
 * Fetch list of users (optionally filtered by role: 'Employee' | 'IT Staff')
 */
export async function fetchUsers(role = null) {
  if (isSupabaseConfigured()) {
    let query = supabase.from('users').select('id, full_name, email, role, created_at')
    if (role) {
      query = query.eq('role', role)
    }
    const { data, error } = await query.order('full_name', { ascending: true })
    if (error) {
      throw new Error(error.message || 'Failed to fetch users from database')
    }
    return data || []
  }

  const users = mockStore.getUsers()
  if (role) return users.filter((u) => u.role === role)
  return users
}

/**
 * Fetch tickets list with role-scoping and filters
 */
export async function fetchTickets({ role, userId, status, assigneeId, search } = {}) {
  if (isSupabaseConfigured()) {
    const users = await fetchUsers()
    const usersMap = Object.fromEntries(users.map((u) => [u.id, u]))

    let query = supabase
      .from('tickets')
      .select(`
        id,
        reporter_id,
        assignee_id,
        summary,
        description,
        priority,
        status,
        impact_metadata,
        resolution_notes,
        verification_feedback,
        verification_started_at,
        created_at,
        closed_at,
        reporter:reporter_id(id, full_name, email, role),
        assignee:assignee_id(id, full_name, email, role)
      `)
      .order('created_at', { ascending: false })

    // Employee scoping (ACT-12 / RLS)
    if (role === 'Employee' && userId) {
      query = query.eq('reporter_id', userId)
    }

    // Filter by status if provided
    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status)
      } else if (status !== 'all') {
        query = query.eq('status', status)
      }
    }

    // Filter by assignee if provided
    if (assigneeId) {
      query = query.eq('assignee_id', assigneeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message || 'Failed to fetch tickets from database')
    }

    let results = (data || []).map((t) => enrichTicket(t, usersMap))
    if (search && search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(
        (t) =>
          t.summary?.toLowerCase().includes(q) ||
          t.id?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      )
    }
    return results
  }

  // Fallback to mock repository for development/unconfigured mode
  const users = await fetchUsers()
  const usersMap = Object.fromEntries(users.map((u) => [u.id, u]))
  let tickets = mockStore.getTickets()

  if (role === 'Employee' && userId) {
    tickets = tickets.filter((t) => t.reporter_id === userId)
  }

  if (status && status !== 'all') {
    if (Array.isArray(status)) {
      tickets = tickets.filter((t) => status.includes(t.status))
    } else {
      tickets = tickets.filter((t) => t.status === status)
    }
  }

  if (assigneeId) {
    tickets = tickets.filter((t) => t.assignee_id === assigneeId)
  }

  let enriched = tickets.map((t) => enrichTicket(t, usersMap))

  if (search && search.trim()) {
    const q = search.toLowerCase()
    enriched = enriched.filter(
      (t) =>
        t.summary?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    )
  }

  return enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

/**
 * Fetch a single ticket by ID with history logs
 */
export async function fetchTicketById(ticketId) {
  if (isSupabaseConfigured()) {
    const users = await fetchUsers()
    const usersMap = Object.fromEntries(users.map((u) => [u.id, u]))

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id,
        reporter_id,
        assignee_id,
        summary,
        description,
        priority,
        status,
        impact_metadata,
        resolution_notes,
        verification_feedback,
        verification_started_at,
        created_at,
        closed_at,
        reporter:reporter_id(id, full_name, email, role),
        assignee:assignee_id(id, full_name, email, role)
      `)
      .eq('id', ticketId)
      .maybeSingle()

    if (error) {
      throw new Error(error.message || `Failed to fetch ticket ${ticketId}`)
    }
    if (!data) return null
    return enrichTicket(data, usersMap)
  }

  const users = await fetchUsers()
  const usersMap = Object.fromEntries(users.map((u) => [u.id, u]))
  const tickets = mockStore.getTickets()
  const found = tickets.find((t) => t.id === ticketId)
  if (!found) return null
  return enrichTicket(found, usersMap)
}

/**
 * Employee Self-Service Incident Creation (UC-01 / ACT-01)
 */
export async function createTicket({ reporterId, summary, description, impactMetadata = null }) {
  const newTicket = {
    reporter_id: reporterId,
    summary: summary.trim(),
    description: description.trim(),
    status: 'Report',
    priority: null,
    assignee_id: null,
    impact_metadata: impactMetadata || null,
    resolution_notes: null,
    verification_feedback: null,
    verification_started_at: null,
    closed_at: null,
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('tickets').insert([newTicket]).select().single()
      if (error) throw error

      // Append initial audit log
      await supabase.from('ticket_history').insert([
        {
          ticket_id: data.id,
          actor_id: reporterId,
          event_type: 'TICKET_CREATED',
          change_payload: { channel: 'SELF_SERVICE', initial_status: 'Report' },
        },
      ])

      return data
    } catch (err) {
      console.error('[ticketService] createTicket Supabase error:', err)
      throw err
    }
  }

  // Fallback to Mock Store
  const id = `mock-inc-${Date.now()}`
  const created = {
    ...newTicket,
    id,
    created_at: new Date().toISOString(),
  }

  const current = mockStore.getTickets()
  mockStore.saveTickets([created, ...current])

  const history = mockStore.getHistory()
  mockStore.saveHistory([
    {
      id: `h-${Date.now()}`,
      ticket_id: id,
      actor_id: reporterId,
      event_type: 'TICKET_CREATED',
      change_payload: { channel: 'SELF_SERVICE', initial_status: 'Report' },
      created_at: new Date().toISOString(),
    },
    ...history,
  ])

  return created
}

/**
 * IT Staff Quick Ticket Creation (UC-02 / ACT-02 / Option C)
 */
export async function createQuickTicket({
  reporterId,
  summary,
  description = '',
  priority = null,
  impactMetadata = null,
  assignToMe = true,
  currentUserId,
  currentUserName,
}) {
  const initialStatus = assignToMe ? 'In Progress' : 'Operational Queue'
  const assigneeId = assignToMe ? currentUserId : null

  const payload = {
    reporter_id: reporterId,
    summary: summary.trim(),
    description: description?.trim() || summary.trim(),
    priority: priority || (assignToMe ? 'Medium' : null),
    impact_metadata: impactMetadata || null,
    assignee_id: assigneeId,
    status: initialStatus,
    resolution_notes: null,
    verification_feedback: null,
    verification_started_at: null,
    closed_at: null,
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('tickets').insert([payload]).select().single()
      if (error) throw error

      await supabase.from('ticket_history').insert([
        {
          ticket_id: data.id,
          actor_id: currentUserId,
          event_type: 'QUICK_TICKET_CREATED',
          change_payload: {
            channel: 'QUICK_TICKET',
            initial_status: initialStatus,
            priority: payload.priority,
            assigned_immediately: assignToMe,
            actor_name: currentUserName,
          },
        },
      ])

      return data
    } catch (err) {
      console.error('[ticketService] createQuickTicket Supabase error:', err)
      throw err
    }
  }

  // Mock Store Fallback
  const id = `mock-inc-${Date.now()}`
  const created = {
    ...payload,
    id,
    created_at: new Date().toISOString(),
  }

  const current = mockStore.getTickets()
  mockStore.saveTickets([created, ...current])

  const history = mockStore.getHistory()
  mockStore.saveHistory([
    {
      id: `h-${Date.now()}`,
      ticket_id: id,
      actor_id: currentUserId,
      event_type: 'QUICK_TICKET_CREATED',
      change_payload: {
        channel: 'QUICK_TICKET',
        initial_status: initialStatus,
        priority: payload.priority,
        assigned_immediately: assignToMe,
        actor_name: currentUserName,
      },
      created_at: new Date().toISOString(),
    },
    ...history,
  ])

  return created
}

/**
 * Initial Assessment / Priority Setting (UC-04 / ACT-04 / ACT-05)
 */
export async function assessTicket({ ticketId, priority, impactMetadata = null, notes = '', actorId, actorName }) {
  const updates = {
    priority,
    ...(impactMetadata ? { impact_metadata: impactMetadata } : {}),
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single()
      if (error) throw error

      await supabase.from('ticket_history').insert([
        {
          ticket_id: ticketId,
          actor_id: actorId,
          event_type: 'PRIORITY_ASSESSED',
          change_payload: {
            new_priority: priority,
            impact: impactMetadata,
            notes: notes || null,
            actor_name: actorName,
          },
        },
      ])

      return data
    } catch (err) {
      console.error('[ticketService] assessTicket error:', err)
      throw err
    }
  }

  const tickets = mockStore.getTickets()
  const updated = tickets.map((t) => (t.id === ticketId ? { ...t, ...updates } : t))
  mockStore.saveTickets(updated)

  const history = mockStore.getHistory()
  mockStore.saveHistory([
    {
      id: `h-${Date.now()}`,
      ticket_id: ticketId,
      actor_id: actorId,
      event_type: 'PRIORITY_ASSESSED',
      change_payload: {
        new_priority: priority,
        impact: impactMetadata,
        notes: notes || null,
        actor_name: actorName,
      },
      created_at: new Date().toISOString(),
    },
    ...history,
  ])

  return updated.find((t) => t.id === ticketId)
}

/**
 * Assign / Reassign Ticket (UC-05 / ACT-07 / Option B)
 */
export async function assignTicket({ ticketId, assigneeId, actorId, actorName, assigneeName, handoverNote = '' }) {
  const updates = {
    assignee_id: assigneeId,
    status: 'In Progress', // Clear ownership -> In Progress
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single()
      if (error) throw error

      await supabase.from('ticket_history').insert([
        {
          ticket_id: ticketId,
          actor_id: actorId,
          event_type: 'TICKET_ASSIGNED',
          change_payload: {
            assignee_id: assigneeId,
            assignee_name: assigneeName,
            handover_note: handoverNote || null,
            actor_name: actorName,
          },
        },
      ])

      return data
    } catch (err) {
      console.error('[ticketService] assignTicket error:', err)
      throw err
    }
  }

  const tickets = mockStore.getTickets()
  const updated = tickets.map((t) => (t.id === ticketId ? { ...t, ...updates } : t))
  mockStore.saveTickets(updated)

  const history = mockStore.getHistory()
  mockStore.saveHistory([
    {
      id: `h-${Date.now()}`,
      ticket_id: ticketId,
      actor_id: actorId,
      event_type: 'TICKET_ASSIGNED',
      change_payload: {
        assignee_id: assigneeId,
        assignee_name: assigneeName,
        handover_note: handoverNote || null,
        actor_name: actorName,
      },
      created_at: new Date().toISOString(),
    },
    ...history,
  ])

  return updated.find((t) => t.id === ticketId)
}

/**
 * Take Over Ticket (Option B — Collaborative Peer Takeover)
 */
export async function takeOverTicket({ ticketId, newAssigneeId, actorName, handoverNote = '' }) {
  return assignTicket({
    ticketId,
    assigneeId: newAssigneeId,
    actorId: newAssigneeId,
    actorName,
    assigneeName: actorName,
    handoverNote: handoverNote || `Explicit takeover by ${actorName}`,
  })
}

/**
 * Add Work Note (UC-06 / ACT-08 / Append-only)
 */
export async function addWorkNote({ ticketId, actorId, actorName, note }) {
  if (!note || !note.trim()) {
    throw new Error('Work note text cannot be empty.')
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('ticket_history')
        .insert([
          {
            ticket_id: ticketId,
            actor_id: actorId,
            event_type: 'WORK_NOTE_ADDED',
            change_payload: {
              note: note.trim(),
              author_name: actorName,
            },
          },
        ])
        .select()
        .single()
      if (error) throw error
      return data
    } catch (err) {
      console.error('[ticketService] addWorkNote error:', err)
      throw err
    }
  }

  const entry = {
    id: `h-${Date.now()}`,
    ticket_id: ticketId,
    actor_id: actorId,
    event_type: 'WORK_NOTE_ADDED',
    change_payload: {
      note: note.trim(),
      author_name: actorName,
    },
    created_at: new Date().toISOString(),
  }

  const history = mockStore.getHistory()
  mockStore.saveHistory([entry, ...history])
  return entry
}

/**
 * Submit Incident Resolution (UC-07 / ACT-09 / Guard 3 & Invariant 3)
 */
export async function resolveTicket({ ticketId, resolutionNotes, rootCause = '', actorId, actorName, reporterId }) {
  if (!resolutionNotes || resolutionNotes.trim().length < 50) {
    throw new Error('Resolution notes must be at least 50 characters.')
  }

  const updates = {
    status: 'Verification',
    resolution_notes: resolutionNotes.trim(),
    verification_started_at: new Date().toISOString(),
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single()
      if (error) throw error

      // Log Resolution History
      await supabase.from('ticket_history').insert([
        {
          ticket_id: ticketId,
          actor_id: actorId,
          event_type: 'RESOLUTION_SUBMITTED',
          change_payload: {
            resolution_notes: resolutionNotes.trim(),
            root_cause: rootCause || null,
            actor_name: actorName,
          },
        },
      ])

      // Push notification to Employee reporter
      if (reporterId) {
        await supabase.from('notifications').insert([
          {
            target_user_id: reporterId,
            source_ticket_id: ticketId,
            event_type: 'EVENT_RESOLUTION_SUBMITTED',
            visual_badge_active: true,
            audio_priority_context: data.priority || 'Medium',
            persistent_unread_state: 'unread',
          },
        ])
      }

      return data
    } catch (err) {
      console.error('[ticketService] resolveTicket error:', err)
      throw err
    }
  }

  const tickets = mockStore.getTickets()
  const updated = tickets.map((t) => (t.id === ticketId ? { ...t, ...updates } : t))
  mockStore.saveTickets(updated)

  const history = mockStore.getHistory()
  mockStore.saveHistory([
    {
      id: `h-${Date.now()}`,
      ticket_id: ticketId,
      actor_id: actorId,
      event_type: 'RESOLUTION_SUBMITTED',
      change_payload: {
        resolution_notes: resolutionNotes.trim(),
        root_cause: rootCause || null,
        actor_name: actorName,
      },
      created_at: new Date().toISOString(),
    },
    ...history,
  ])

  if (reporterId) {
    const notifications = mockStore.getNotifications()
    mockStore.saveNotifications([
      {
        id: `n-${Date.now()}`,
        target_user_id: reporterId,
        source_ticket_id: ticketId,
        event_type: 'EVENT_RESOLUTION_SUBMITTED',
        visual_badge_active: true,
        audio_priority_context: 'Medium',
        persistent_unread_state: 'unread',
        created_at: new Date().toISOString(),
      },
      ...notifications,
    ])
  }

  return updated.find((t) => t.id === ticketId)
}

/**
 * Employee Verification Accept & Close (UC-08 / ACT-10 / Invariant 2 & 5)
 */
export async function verifyTicket({ ticketId, actorId, actorName, satisfactionRating = null, notes = '' }) {
  const updates = {
    status: 'Closed',
    closed_at: new Date().toISOString(),
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single()
      if (error) throw error

      await supabase.from('ticket_history').insert([
        {
          ticket_id: ticketId,
          actor_id: actorId,
          event_type: 'VERIFICATION_ACCEPTED',
          change_payload: {
            actor_name: actorName,
            rating: satisfactionRating,
            notes: notes || null,
          },
        },
      ])

      return data
    } catch (err) {
      console.error('[ticketService] verifyTicket error:', err)
      throw err
    }
  }

  const tickets = mockStore.getTickets()
  const updated = tickets.map((t) => (t.id === ticketId ? { ...t, ...updates } : t))
  mockStore.saveTickets(updated)

  const history = mockStore.getHistory()
  mockStore.saveHistory([
    {
      id: `h-${Date.now()}`,
      ticket_id: ticketId,
      actor_id: actorId,
      event_type: 'VERIFICATION_ACCEPTED',
      change_payload: {
        actor_name: actorName,
        rating: satisfactionRating,
        notes: notes || null,
      },
      created_at: new Date().toISOString(),
    },
    ...history,
  ])

  return updated.find((t) => t.id === ticketId)
}

/**
 * Employee Dispute Resolution & Rework (UC-08 / ACT-11 / Option 1)
 */
export async function disputeTicket({ ticketId, actorId, actorName, disputeReason, assigneeId }) {
  if (!disputeReason || disputeReason.trim().length < 20) {
    throw new Error('Dispute reason must be at least 20 characters.')
  }

  const updates = {
    status: 'In Progress', // Return directly to In Progress with retained assignee
    verification_feedback: disputeReason.trim(),
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single()
      if (error) throw error

      await supabase.from('ticket_history').insert([
        {
          ticket_id: ticketId,
          actor_id: actorId,
          event_type: 'VERIFICATION_DISPUTED',
          change_payload: {
            dispute_reason: disputeReason.trim(),
            actor_name: actorName,
          },
        },
      ])

      // Push high priority alert to Assignee
      if (assigneeId) {
        await supabase.from('notifications').insert([
          {
            target_user_id: assigneeId,
            source_ticket_id: ticketId,
            event_type: 'EVENT_RESOLUTION_DISPUTED',
            visual_badge_active: true,
            audio_priority_context: 'High',
            persistent_unread_state: 'unread',
          },
        ])
      }

      return data
    } catch (err) {
      console.error('[ticketService] disputeTicket error:', err)
      throw err
    }
  }

  const tickets = mockStore.getTickets()
  const updated = tickets.map((t) => (t.id === ticketId ? { ...t, ...updates } : t))
  mockStore.saveTickets(updated)

  const history = mockStore.getHistory()
  mockStore.saveHistory([
    {
      id: `h-${Date.now()}`,
      ticket_id: ticketId,
      actor_id: actorId,
      event_type: 'VERIFICATION_DISPUTED',
      change_payload: {
        dispute_reason: disputeReason.trim(),
        actor_name: actorName,
      },
      created_at: new Date().toISOString(),
    },
    ...history,
  ])

  if (assigneeId) {
    const notifications = mockStore.getNotifications()
    mockStore.saveNotifications([
      {
        id: `n-${Date.now()}`,
        target_user_id: assigneeId,
        source_ticket_id: ticketId,
        event_type: 'EVENT_RESOLUTION_DISPUTED',
        visual_badge_active: true,
        audio_priority_context: 'High',
        persistent_unread_state: 'unread',
        created_at: new Date().toISOString(),
      },
      ...notifications,
    ])
  }

  return updated.find((t) => t.id === ticketId)
}
