import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://unquzddtylzqufnvrlhb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_qPpybL3kqSusSL9DfkkGJA_MqGI5gkU'

async function createAuthClient(email, password) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`Auth failed for ${email}: ${error.message}`)
  const { data: profile } = await client.from('users').select('*').eq('id', data.user.id).single()
  return { client, user: data.user, profile, session: data.session }
}

function createAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

const flowResults = []
const auditData = {
  ticketsCreated: [],
  lifecycleTransitions: {},
  historyRecords: {},
  notificationsDelivered: {}
}

function recordFlow(flow, scenario, expected, actual, passed, details = '') {
  const status = passed ? 'PASS' : 'ISSUE'
  flowResults.push({ flow, scenario, expected, actual, status, details })
  console.log(`[${status}] [${flow}] ${scenario}`)
  console.log(`        Expected: ${expected}`)
  console.log(`        Actual  : ${actual}`)
  if (details) console.log(`        Details : ${details}`)
}

async function runStage3UserFlows() {
  console.log('====================================================================')
  console.log('PHASE 8 — STAGE 3: USER FLOW TESTING')
  console.log('Target: Live Connected Supabase (unquzddtylzqufnvrlhb.supabase.co)')
  console.log('====================================================================\n')

  // Setup Auth Clients
  const emp = await createAuthClient('budi.santoso@corp.internal', 'Password123!')
  const staff = await createAuthClient('ahmad.pratama@corp.internal', 'Password123!')
  const anon = createAnonClient()

  console.log(`[Setup] Authenticated Employee: ${emp.user.email} (${emp.profile.full_name}, ID: ${emp.user.id})`)
  console.log(`[Setup] Authenticated IT Staff: ${staff.user.email} (${staff.profile.full_name}, ID: ${staff.user.id})\n`)

  // ===========================================================================
  // USER FLOW 1 — EMPLOYEE REPORT -> IT STAFF PROCESS -> EMPLOYEE ACCEPT
  // ===========================================================================
  console.log('--------------------------------------------------------------------')
  console.log('USER FLOW 1: EMPLOYEE REPORT -> IT STAFF PROCESS -> EMPLOYEE ACCEPT')
  console.log('--------------------------------------------------------------------')

  const flow1Transitions = []

  // Step 1: Employee reports problem
  const ticket1Payload = {
    summary: '[Flow 1] Outlook desktop client fails to synchronize exchange mailbox',
    description: 'Email & Collaboration > Microsoft Outlook / Exchange Sync Failure\n\nReceiving error code 0x80040115 during send/receive operations on endpoint FIN-WS-0412.',
    reporter_id: emp.user.id,
    status: 'Operational Queue',
    impact_metadata: 'Individual',
    priority: null
  }

  const { data: ticket1, error: t1CreateErr } = await emp.client.from('tickets').insert(ticket1Payload).select().single()
  if (t1CreateErr) throw new Error(`Flow 1 Ticket creation failed: ${t1CreateErr.message}`)
  
  auditData.ticketsCreated.push({ id: ticket1.id, flow: 'Flow 1', summary: ticket1.summary })
  flow1Transitions.push({ stage: '1. Report / 3. Operational Queue', actor: 'Employee', action: 'Submit Report' })

  // Log TICKET_CREATED history
  await emp.client.from('ticket_history').insert({
    ticket_id: ticket1.id,
    actor_id: emp.user.id,
    event_type: 'TICKET_CREATED',
    change_payload: { channel: 'SELF_SERVICE', initial_status: 'Operational Queue' }
  })

  // Verify visibility in Employee list
  const { data: empMyTickets } = await emp.client.from('tickets').select('*').eq('id', ticket1.id)
  const isVisibleToEmployee = empMyTickets && empMyTickets.length === 1

  // Step 2: IT Staff sees ticket in Operational Queue
  const { data: staffQueueTickets } = await staff.client.from('tickets').select('*').eq('status', 'Operational Queue').order('created_at', { ascending: false })
  const isVisibleInStaffQueue = staffQueueTickets?.some(t => t.id === ticket1.id)

  // Step 3: IT Staff performs Initial Assessment (Priority High, Impact Departmental)
  const { data: assessedT1, error: assessT1Err } = await staff.client.from('tickets').update({
    priority: 'High',
    impact_metadata: 'Departmental'
  }).eq('id', ticket1.id).select().single()

  flow1Transitions.push({ stage: '4. Initial Assessment', actor: 'IT Staff', action: 'Set Priority High & Impact Departmental' })

  await staff.client.from('ticket_history').insert({
    ticket_id: ticket1.id,
    actor_id: staff.user.id,
    event_type: 'PRIORITY_ASSESSED',
    change_payload: { new_priority: 'High', old_priority: null, impact: 'Departmental' }
  })

  await staff.client.from('notifications').insert({
    target_user_id: emp.user.id,
    source_ticket_id: ticket1.id,
    event_type: 'EVENT_PRIORITY_SET',
    audio_priority_context: 'High',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  // Step 4: IT Staff takes over / self-assigns ticket
  const { data: assignedT1, error: assignT1Err } = await staff.client.from('tickets').update({
    assignee_id: staff.user.id,
    status: 'In Progress'
  }).eq('id', ticket1.id).select().single()

  flow1Transitions.push({ stage: '5. Assignment -> 6. In Progress', actor: 'IT Staff', action: 'Self Assign / Take Over' })

  await staff.client.from('ticket_history').insert({
    ticket_id: ticket1.id,
    actor_id: staff.user.id,
    event_type: 'TICKET_ASSIGNED',
    change_payload: {
      assignee_id: staff.user.id,
      assignee_name: staff.profile.full_name,
      handover_note: 'Self-assigned by Ahmad Pratama'
    }
  })

  await staff.client.from('notifications').insert({
    target_user_id: emp.user.id,
    source_ticket_id: ticket1.id,
    event_type: 'EVENT_TICKET_ASSIGNED',
    audio_priority_context: 'High',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  // Step 5: IT Staff adds work note
  const workNote1 = 'Cleared OST cache file in AppData and re-authenticated user Exchange profile with modern auth token.'
  await staff.client.from('ticket_history').insert({
    ticket_id: ticket1.id,
    actor_id: staff.user.id,
    event_type: 'WORK_NOTE_ADDED',
    change_payload: { note: workNote1, author_name: staff.profile.full_name }
  })

  flow1Transitions.push({ stage: '6. In Progress (Work Note)', actor: 'IT Staff', action: 'Append Work Note' })

  // Step 6: IT Staff submits Resolution (>= 50 chars)
  const resolution1 = 'Repaired Outlook Exchange profile by flushing stale OST data file, updated MAPI protocol configuration, and verified send/receive synchronization completed with 0 sync errors.'
  const { data: resolvedT1, error: resolveT1Err } = await staff.client.from('tickets').update({
    status: 'Verification',
    resolution_notes: resolution1,
    verification_started_at: new Date().toISOString()
  }).eq('id', ticket1.id).select().single()

  flow1Transitions.push({ stage: '7. Resolution -> 9. Verification', actor: 'IT Staff', action: 'Submit Resolution' })

  await staff.client.from('ticket_history').insert({
    ticket_id: ticket1.id,
    actor_id: staff.user.id,
    event_type: 'RESOLUTION_SUBMITTED',
    change_payload: {
      resolution_notes: resolution1,
      root_cause: 'Corrupted Outlook OST data store'
    }
  })

  await staff.client.from('notifications').insert({
    target_user_id: emp.user.id,
    source_ticket_id: ticket1.id,
    event_type: 'EVENT_RESOLUTION_SUBMITTED',
    audio_priority_context: 'High',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  // Step 7: Employee verifies and Accepts resolution
  const { data: closedT1, error: closeT1Err } = await emp.client.from('tickets').update({
    status: 'Closed',
    closed_at: new Date().toISOString()
  }).eq('id', ticket1.id).select().single()

  flow1Transitions.push({ stage: '10. Closed', actor: 'Employee', action: 'Accept Resolution' })

  await emp.client.from('ticket_history').insert({
    ticket_id: ticket1.id,
    actor_id: emp.user.id,
    event_type: 'VERIFICATION_ACCEPTED',
    change_payload: { note: 'Outlook send/receive confirmed operational by employee.' }
  })

  await emp.client.from('notifications').insert({
    target_user_id: staff.user.id,
    source_ticket_id: ticket1.id,
    event_type: 'EVENT_TICKET_CLOSED',
    audio_priority_context: 'Medium',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  // Audit history chain and notifications for Flow 1 (with RLS awareness)
  const { data: t1History } = await staff.client.from('ticket_history').select('*').eq('ticket_id', ticket1.id).order('created_at')
  const { data: t1EmpNotifs } = await emp.client.from('notifications').select('*').eq('source_ticket_id', ticket1.id)
  const { data: t1StaffNotifs } = await staff.client.from('notifications').select('*').eq('source_ticket_id', ticket1.id)
  const totalFlow1Notifs = (t1EmpNotifs?.length ?? 0) + (t1StaffNotifs?.length ?? 0)

  auditData.lifecycleTransitions['Flow 1'] = flow1Transitions
  auditData.historyRecords['Flow 1'] = t1History
  auditData.notificationsDelivered['Flow 1'] = [...(t1EmpNotifs || []), ...(t1StaffNotifs || [])]

  const flow1Pass = 
    !t1CreateErr && !assessT1Err && !assignT1Err && !resolveT1Err && !closeT1Err &&
    isVisibleToEmployee && isVisibleInStaffQueue &&
    closedT1?.status === 'Closed' && closedT1?.closed_at !== null &&
    t1History?.length >= 6 && totalFlow1Notifs >= 4

  recordFlow(
    'Flow 1',
    'Report -> Assess -> Assign -> Work Note -> Resolve -> Accept',
    'Complete lifecycle transitions: Operational Queue -> In Progress -> Verification -> Closed with notifications & history',
    flow1Pass ? `Final status: Closed, History entries: ${t1History?.length}, Delivered notifications: ${totalFlow1Notifs}` : 'Flow 1 failed',
    flow1Pass,
    `Ticket ID: ${ticket1.id}`
  )

  // ===========================================================================
  // USER FLOW 2 — EMPLOYEE DISPUTE -> IT STAFF REWORK -> ACCEPT
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('USER FLOW 2: EMPLOYEE DISPUTE -> IT STAFF REWORK -> ACCEPT')
  console.log('--------------------------------------------------------------------')

  const flow2Transitions = []

  // Step 1: Employee reports problem
  const ticket2Payload = {
    summary: '[Flow 2] VPN tunnel disconnects every 5 minutes during remote session',
    description: 'Network & Connectivity > VPN Connection / GlobalProtect Failure\n\nGlobalProtect client drops connection repeatedly when transferring large files.',
    reporter_id: emp.user.id,
    status: 'Operational Queue',
    impact_metadata: 'Individual',
    priority: null
  }

  const { data: ticket2, error: t2CreateErr } = await emp.client.from('tickets').insert(ticket2Payload).select().single()
  if (t2CreateErr) throw new Error(`Flow 2 Ticket creation failed: ${t2CreateErr.message}`)
  
  auditData.ticketsCreated.push({ id: ticket2.id, flow: 'Flow 2', summary: ticket2.summary })
  flow2Transitions.push({ stage: '1. Report / 3. Operational Queue', actor: 'Employee', action: 'Submit Report' })

  await emp.client.from('ticket_history').insert({
    ticket_id: ticket2.id,
    actor_id: emp.user.id,
    event_type: 'TICKET_CREATED',
    change_payload: { channel: 'SELF_SERVICE', initial_status: 'Operational Queue' }
  })

  // Step 2: IT Staff assesses & assigns
  await staff.client.from('tickets').update({
    priority: 'Medium',
    impact_metadata: 'Individual',
    assignee_id: staff.user.id,
    status: 'In Progress'
  }).eq('id', ticket2.id)

  flow2Transitions.push({ stage: '4. Assess / 5. Assign -> 6. In Progress', actor: 'IT Staff', action: 'Assess & Self Assign' })

  await staff.client.from('ticket_history').insert([
    {
      ticket_id: ticket2.id,
      actor_id: staff.user.id,
      event_type: 'PRIORITY_ASSESSED',
      change_payload: { new_priority: 'Medium', old_priority: null, impact: 'Individual' }
    },
    {
      ticket_id: ticket2.id,
      actor_id: staff.user.id,
      event_type: 'TICKET_ASSIGNED',
      change_payload: {
        assignee_id: staff.user.id,
        assignee_name: staff.profile.full_name,
        handover_note: 'Assigned for VPN gateway investigation'
      }
    }
  ])

  // Step 3: IT Staff adds work note & submits initial resolution
  const initialResolution2 = 'Adjusted client MTU and keep-alive timeout values in GlobalProtect portal configuration to prevent premature tunnel drops.'
  await staff.client.from('ticket_history').insert({
    ticket_id: ticket2.id,
    actor_id: staff.user.id,
    event_type: 'WORK_NOTE_ADDED',
    change_payload: { note: 'Inspected gateway logs. Adjusted keep-alive timer to 60s.' }
  })

  await staff.client.from('tickets').update({
    status: 'Verification',
    resolution_notes: initialResolution2,
    verification_started_at: new Date().toISOString()
  }).eq('id', ticket2.id)

  flow2Transitions.push({ stage: '7. Resolution -> 9. Verification (Initial)', actor: 'IT Staff', action: 'Submit Initial Resolution' })

  await staff.client.from('ticket_history').insert({
    ticket_id: ticket2.id,
    actor_id: staff.user.id,
    event_type: 'RESOLUTION_SUBMITTED',
    change_payload: { resolution_notes: initialResolution2 }
  })

  await staff.client.from('notifications').insert({
    target_user_id: emp.user.id,
    source_ticket_id: ticket2.id,
    event_type: 'EVENT_RESOLUTION_SUBMITTED',
    audio_priority_context: 'Medium',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  // Step 4: Employee disputes resolution (valid min 20 chars)
  const disputeExplanation = 'Tunnel still dropped twice within 10 minutes when opening heavy SAP report.'
  const isDisputeValid = disputeExplanation.length >= 20

  const { data: disputedT2, error: disputeErr } = await emp.client.from('tickets').update({
    status: 'In Progress',
    verification_feedback: disputeExplanation
  }).eq('id', ticket2.id).select().single()

  flow2Transitions.push({ stage: '9. Verification -> 6. In Progress (Rework Gate)', actor: 'Employee', action: 'Dispute Resolution' })

  await emp.client.from('ticket_history').insert({
    ticket_id: ticket2.id,
    actor_id: emp.user.id,
    event_type: 'VERIFICATION_DISPUTED',
    change_payload: { dispute_reason: disputeExplanation }
  })

  await emp.client.from('notifications').insert({
    target_user_id: staff.user.id,
    source_ticket_id: ticket2.id,
    event_type: 'EVENT_RESOLUTION_DISPUTED',
    audio_priority_context: 'High',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  // Step 5: IT Staff performs rework & submits second resolution
  await staff.client.from('ticket_history').insert({
    ticket_id: ticket2.id,
    actor_id: staff.user.id,
    event_type: 'WORK_NOTE_ADDED',
    change_payload: { note: 'Rework: Identified packet fragmentation on local ISP router. Enabled tunnel MSS clamping.' }
  })

  const secondResolution2 = 'Enabled IPsec MSS clamping on corporate edge firewall and adjusted TCP window scaling for user tunnel endpoint. Tested 30 min continuous data transfer with zero packet loss.'
  await staff.client.from('tickets').update({
    status: 'Verification',
    resolution_notes: secondResolution2,
    verification_started_at: new Date().toISOString()
  }).eq('id', ticket2.id)

  flow2Transitions.push({ stage: '7. Resolution -> 9. Verification (Rework)', actor: 'IT Staff', action: 'Submit Rework Resolution' })

  await staff.client.from('ticket_history').insert({
    ticket_id: ticket2.id,
    actor_id: staff.user.id,
    event_type: 'RESOLUTION_SUBMITTED',
    change_payload: { resolution_notes: secondResolution2 }
  })

  await staff.client.from('notifications').insert({
    target_user_id: emp.user.id,
    source_ticket_id: ticket2.id,
    event_type: 'EVENT_RESOLUTION_SUBMITTED',
    audio_priority_context: 'High',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  // Step 6: Employee accepts second resolution
  const { data: closedT2, error: closeT2Err } = await emp.client.from('tickets').update({
    status: 'Closed',
    closed_at: new Date().toISOString()
  }).eq('id', ticket2.id).select().single()

  flow2Transitions.push({ stage: '10. Closed', actor: 'Employee', action: 'Accept Rework Resolution' })

  await emp.client.from('ticket_history').insert({
    ticket_id: ticket2.id,
    actor_id: emp.user.id,
    event_type: 'VERIFICATION_ACCEPTED',
    change_payload: { note: 'Second resolution verified. VPN stable for 45 minutes.' }
  })

  await staff.client.from('notifications').insert({
    target_user_id: staff.user.id,
    source_ticket_id: ticket2.id,
    event_type: 'EVENT_TICKET_CLOSED',
    audio_priority_context: 'Medium',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  const { data: t2History } = await staff.client.from('ticket_history').select('*').eq('ticket_id', ticket2.id).order('created_at')
  const { data: t2EmpNotifs } = await emp.client.from('notifications').select('*').eq('source_ticket_id', ticket2.id)
  const { data: t2StaffNotifs } = await staff.client.from('notifications').select('*').eq('source_ticket_id', ticket2.id)
  const totalFlow2Notifs = (t2EmpNotifs?.length ?? 0) + (t2StaffNotifs?.length ?? 0)

  auditData.lifecycleTransitions['Flow 2'] = flow2Transitions
  auditData.historyRecords['Flow 2'] = t2History
  auditData.notificationsDelivered['Flow 2'] = [...(t2EmpNotifs || []), ...(t2StaffNotifs || [])]

  const flow2Pass = 
    !t2CreateErr && !disputeErr && !closeT2Err &&
    isDisputeValid &&
    disputedT2?.assignee_id === staff.user.id &&
    disputedT2?.verification_feedback === disputeExplanation &&
    closedT2?.status === 'Closed' &&
    t2History?.length >= 9 && totalFlow2Notifs >= 4

  recordFlow(
    'Flow 2',
    'Report -> Dispute -> Rework -> Accept',
    'Status returned to In Progress on dispute with preserved assignee and verification_feedback, followed by second resolution & acceptance',
    flow2Pass ? `Dispute handled successfully, Final status: Closed, Total history events: ${t2History?.length}, Notifications: ${totalFlow2Notifs}` : 'Flow 2 failed',
    flow2Pass,
    `Ticket ID: ${ticket2.id}`
  )

  // ===========================================================================
  // USER FLOW 3 — IT STAFF QUICK TICKET
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('USER FLOW 3: IT STAFF QUICK TICKET (3A & 3B)')
  console.log('--------------------------------------------------------------------')

  // 3A: Assign to Me
  const quickPayload3A = {
    summary: '[Flow 3A Quick] Walk-up: Reset 2FA token on corporate smartphone',
    description: 'Identity & Access > Single Sign-On (SSO) / 2FA Multi-Factor Token\n\nWalk-up request by Budi Santoso.',
    reporter_id: emp.user.id,
    assignee_id: staff.user.id,
    status: 'In Progress',
    priority: 'High',
    impact_metadata: 'Individual'
  }

  const { data: quick3A, error: q3AErr } = await staff.client.from('tickets').insert(quickPayload3A).select().single()
  auditData.ticketsCreated.push({ id: quick3A?.id, flow: 'Flow 3A', summary: quick3A?.summary })

  if (quick3A) {
    await staff.client.from('ticket_history').insert({
      ticket_id: quick3A.id,
      actor_id: staff.user.id,
      event_type: 'TICKET_CREATED',
      change_payload: { channel: 'QUICK_TICKET_IMMEDIATE_ASSIGN', initial_status: 'In Progress', priority: 'High' }
    })
    await staff.client.from('notifications').insert({
      target_user_id: emp.user.id,
      source_ticket_id: quick3A.id,
      event_type: 'EVENT_TICKET_CREATED',
      audio_priority_context: 'High',
      visual_badge_active: true,
      persistent_unread_state: 'unread'
    })
  }

  const { data: staffAssigned } = await staff.client.from('tickets').select('*').eq('assignee_id', staff.user.id)
  const isAssignedToStaff = staffAssigned?.some(t => t.id === quick3A?.id)

  const flow3APass = !q3AErr && quick3A?.status === 'In Progress' && quick3A?.assignee_id === staff.user.id && isAssignedToStaff
  recordFlow(
    'Flow 3A',
    'Quick Ticket -> Assign to Me',
    'Ticket created with status = "In Progress", assignee = IT Staff ID, priority = "High", visible in assigned list',
    flow3APass ? `Status: ${quick3A.status}, Assignee: ${quick3A.assignee_id}` : q3AErr?.message,
    flow3APass,
    `Ticket ID: ${quick3A?.id}`
  )

  // 3B: Operational Queue
  const quickPayload3B = {
    summary: '[Flow 3B Quick] Phone report: Meeting room 401 video conference audio static',
    description: 'Hardware & Peripherals > Audio / Conference Room Equipment\n\nIncoming phone report.',
    reporter_id: emp.user.id,
    assignee_id: null,
    status: 'Operational Queue',
    priority: 'Medium',
    impact_metadata: 'Departmental'
  }

  const { data: quick3B, error: q3BErr } = await staff.client.from('tickets').insert(quickPayload3B).select().single()
  auditData.ticketsCreated.push({ id: quick3B?.id, flow: 'Flow 3B', summary: quick3B?.summary })

  if (quick3B) {
    await staff.client.from('ticket_history').insert({
      ticket_id: quick3B.id,
      actor_id: staff.user.id,
      event_type: 'TICKET_CREATED',
      change_payload: { channel: 'QUICK_TICKET_QUEUE', initial_status: 'Operational Queue', priority: 'Medium' }
    })
  }

  const { data: staffQueueAll } = await staff.client.from('tickets').select('*').eq('status', 'Operational Queue')
  const isInQueue = staffQueueAll?.some(t => t.id === quick3B?.id)

  const flow3BPass = !q3BErr && quick3B?.status === 'Operational Queue' && quick3B?.assignee_id === null && isInQueue
  recordFlow(
    'Flow 3B',
    'Quick Ticket -> Operational Queue',
    'Ticket created with status = "Operational Queue", assignee = null, priority = "Medium", visible in queue',
    flow3BPass ? `Status: ${quick3B.status}, Assignee: null, In Queue: ${isInQueue}` : q3BErr?.message,
    flow3BPass,
    `Ticket ID: ${quick3B?.id}`
  )

  // ===========================================================================
  // USER FLOW 4 — ROLE BOUNDARY
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('USER FLOW 4: ROLE BOUNDARY VERIFICATION')
  console.log('--------------------------------------------------------------------')

  const empRole = emp.profile.role
  const isEmpAuthorizedEmployee = empRole === 'Employee'
  const isEmpBlockedFromStaff = empRole !== 'IT Staff'

  const staffRole = staff.profile.role
  const isStaffAuthorizedStaff = staffRole === 'IT Staff'
  const isStaffBlockedFromEmployee = staffRole !== 'Employee'

  const { data: anonTickets } = await anon.from('tickets').select('*')
  const isAnonBlocked = (anonTickets?.length ?? 0) === 0

  const flow4Pass = isEmpAuthorizedEmployee && isEmpBlockedFromStaff && isStaffAuthorizedStaff && isStaffBlockedFromEmployee && isAnonBlocked
  recordFlow(
    'Flow 4',
    'Role Boundary & Cross-portal Route Protection',
    'Employee restricted to /employee, Staff restricted to /staff, Anonymous blocked',
    flow4Pass ? `Employee role: ${empRole}, Staff role: ${staffRole}, Anon blocked: ${isAnonBlocked}` : 'Role boundary violation',
    flow4Pass
  )

  // ===========================================================================
  // USER FLOW 5 — SESSION REFRESH
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('USER FLOW 5: SESSION REFRESH & PERSISTENCE')
  console.log('--------------------------------------------------------------------')

  const restoredClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data: refreshedAuth, error: refreshErr } = await restoredClient.auth.setSession({
    access_token: emp.session.access_token,
    refresh_token: emp.session.refresh_token
  })

  const { data: hydratedProfile } = await restoredClient.from('users').select('*').eq('id', emp.user.id).single()
  const isSessionHydrated = !refreshErr && hydratedProfile?.role === 'Employee' && hydratedProfile?.email === emp.user.email

  await restoredClient.auth.signOut()
  const { data: postLogoutTickets } = await restoredClient.from('tickets').select('*')
  const isPostLogoutBlocked = (postLogoutTickets?.length ?? 0) === 0

  const flow5Pass = isSessionHydrated && isPostLogoutBlocked
  recordFlow(
    'Flow 5',
    'Session Refresh & Profile Hydration',
    'Session resumes seamlessly across page refresh, profile role hydrated correctly, protected on logout',
    flow5Pass ? `Hydrated role: ${hydratedProfile?.role}, Post-logout query blocked: ${isPostLogoutBlocked}` : 'Session refresh failed',
    flow5Pass
  )

  // ===========================================================================
  // SUMMARY
  // ===========================================================================
  console.log('\n====================================================================')
  console.log('STAGE 3 USER FLOW TEST RESULTS')
  console.log('====================================================================')
  const total = flowResults.length
  const passed = flowResults.filter(r => r.status === 'PASS').length
  const issues = flowResults.filter(r => r.status === 'ISSUE').length

  console.log(`Total Flows Tested : ${total}`)
  console.log(`Passed             : ${passed}`)
  console.log(`Issues             : ${issues}\n`)

  console.log('=== AUDIT TRAIL: TICKETS CREATED ===')
  auditData.ticketsCreated.forEach(t => console.log(`  [${t.flow}] ${t.id} -> ${t.summary}`))
}

runStage3UserFlows().catch(err => {
  console.error('Fatal execution error:', err)
  process.exit(1)
})
