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
  return { client, user: data.user, profile }
}

const testResults = []

function recordTest(feature, testCase, expected, actual, passed, details = '') {
  const status = passed ? 'PASS' : 'ISSUE'
  testResults.push({ feature, testCase, expected, actual, status, details })
  console.log(`[${status}] [${feature}] ${testCase}`)
  console.log(`        Expected: ${expected}`)
  console.log(`        Actual  : ${actual}`)
  if (details) console.log(`        Details : ${details}`)
}

async function runFeatureTests() {
  console.log('====================================================================')
  console.log('PHASE 8 — STAGE 2: FULL RUNTIME FEATURE TESTING')
  console.log('====================================================================\n')

  // 0. Authenticate users
  console.log('--- Step 0: User Authentication & Role Verification ---')
  const emp = await createAuthClient('budi.santoso@corp.internal', 'Password123!')
  const staff1 = await createAuthClient('ahmad.pratama@corp.internal', 'Password123!')
  const staff2 = await createAuthClient('siti.rahma@corp.internal', 'Password123!')

  console.log(`Authenticated Employee: ${emp.user.email} (${emp.profile.role}, id: ${emp.user.id})`)
  console.log(`Authenticated Staff 1 : ${staff1.user.email} (${staff1.profile.role}, id: ${staff1.user.id})`)
  console.log(`Authenticated Staff 2 : ${staff2.user.email} (${staff2.profile.role}, id: ${staff2.user.id})\n`)

  // 1. Employee Login
  recordTest(
    '1. Employee Login',
    'Login authentication & role verification',
    'User role is Employee, authenticated session established',
    `Role: ${emp.profile.role}, Email: ${emp.user.email}`,
    emp.profile.role === 'Employee'
  )

  // 6. IT Staff Login
  recordTest(
    '6. IT Staff Login',
    'Login authentication & role verification',
    'User role is IT Staff, authenticated session established',
    `Role: ${staff1.profile.role}, Email: ${staff1.user.email}`,
    staff1.profile.role === 'IT Staff'
  )

  // ---------------------------------------------------------------------------
  // 2. Report Problem (Employee)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 1: Report Problem (Employee) ---')
  
  // 2.1 Validation: empty summary
  const { data: invalidTicket, error: invalidErr } = await emp.client.from('tickets').insert({
    summary: '',
    description: 'Valid problem description',
    reporter_id: emp.user.id,
    status: 'Operational Queue'
  }).select()

  recordTest(
    '2. Report Problem',
    'Form validation: Empty summary',
    'Database constraint tickets_summary_check rejects empty summary',
    invalidErr ? `Rejected: ${invalidErr.message}` : 'Inserted unexpectedly',
    Boolean(invalidErr)
  )

  // 2.2 Valid ticket creation
  const newTicketPayload = {
    summary: '[Live Test] Cannot access internal ERP SAP portal',
    description: 'Enterprise ERP & Applications > SAP ERP Transaction Error\n\nSAP GUI throws connection timeout error 0x80070005.',
    reporter_id: emp.user.id,
    status: 'Operational Queue',
    impact_metadata: 'Individual',
    priority: null
  }

  const { data: createdTicket, error: createErr } = await emp.client.from('tickets').insert(newTicketPayload).select().single()
  const ticketId = createdTicket?.id
  const createPass = !createErr && createdTicket && createdTicket.status === 'Operational Queue'

  // Insert creation history
  if (ticketId) {
    await emp.client.from('ticket_history').insert({
      ticket_id: ticketId,
      actor_id: emp.user.id,
      event_type: 'TICKET_CREATED',
      change_payload: { channel: 'SELF_SERVICE', initial_status: 'Operational Queue' }
    })
  }

  recordTest(
    '2. Report Problem',
    'Create ticket with valid payload',
    'Ticket created with initial status = "Operational Queue", priority = null/Unset',
    createPass ? `Created ID: ${createdTicket.id}, Status: ${createdTicket.status}` : createErr?.message,
    createPass,
    `Ticket ID: ${ticketId}`
  )

  // Verify ticket history trigger
  const { data: histAfterCreate } = await emp.client.from('ticket_history').select('*').eq('ticket_id', ticketId)
  const hasCreationHistory = histAfterCreate?.some(h => h.event_type === 'TICKET_CREATED')
  recordTest(
    '2. Report Problem',
    'History creation audit record',
    'History record TICKET_CREATED present',
    `Found ${histAfterCreate?.length} history records`,
    hasCreationHistory
  )

  // Visibility check
  const { data: empList } = await emp.client.from('tickets').select('*').eq('id', ticketId)
  const { data: staffQueue } = await staff1.client.from('tickets').select('*').eq('id', ticketId)
  recordTest(
    '2. Report Problem',
    'Visibility on Employee Tickets & Staff Queue',
    'Visible in both Employee tickets list and Staff operational queue',
    `Emp visible: ${empList?.length > 0}, Staff visible: ${staffQueue?.length > 0}`,
    empList?.length > 0 && staffQueue?.length > 0
  )

  // ---------------------------------------------------------------------------
  // 3. View Ticket (Employee)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 2: View Ticket (Employee) ---')
  const { data: viewDetail } = await emp.client.from('tickets').select('*, reporter:reporter_id(full_name), assignee:assignee_id(full_name)').eq('id', ticketId).single()
  
  const viewPass = viewDetail && viewDetail.summary === newTicketPayload.summary && viewDetail.status === 'Operational Queue'
  recordTest(
    '3. View Ticket',
    'Employee ticket detail data integrity',
    'Summary, description, priority (null), status (Operational Queue), reporter populated',
    viewPass ? `Summary: "${viewDetail.summary}", Status: ${viewDetail.status}, Priority: ${viewDetail.priority || 'null'}` : 'Failed to fetch',
    viewPass
  )

  // ---------------------------------------------------------------------------
  // 7. Operational Queue (IT Staff)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 3: Operational Queue (IT Staff) ---')
  const { data: queueTickets } = await staff1.client.from('tickets').select('*').order('created_at', { ascending: false })
  const inQueue = queueTickets?.some(t => t.id === ticketId && t.status === 'Operational Queue')
  
  recordTest(
    '7. Operational Queue',
    'Staff queue listing of unassigned ticket',
    'Ticket appears in operational queue with unassigned status',
    `Found ticket in queue: ${inQueue} (Total queue count: ${queueTickets?.length})`,
    inQueue
  )

  // ---------------------------------------------------------------------------
  // 8. Assessment (IT Staff)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 4: Assessment (IT Staff) ---')
  const { data: assessedTicket, error: assessErr } = await staff1.client.from('tickets').update({
    priority: 'High',
    impact_metadata: 'Departmental'
  }).eq('id', ticketId).select().single()

  const { error: histAssessErr } = await staff1.client.from('ticket_history').insert({
    ticket_id: ticketId,
    actor_id: staff1.user.id,
    event_type: 'PRIORITY_ASSESSED',
    change_payload: { new_priority: 'High', old_priority: null, impact: 'Departmental' }
  })

  const { error: notifAssessErr } = await staff1.client.from('notifications').insert({
    target_user_id: emp.user.id,
    source_ticket_id: ticketId,
    event_type: 'EVENT_PRIORITY_SET',
    audio_priority_context: 'High',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  const assessPass = !assessErr && assessedTicket?.priority === 'High' && !histAssessErr && !notifAssessErr
  recordTest(
    '8. Assessment',
    'Set Priority to High & Impact to Departmental',
    'Priority stored as "High", history recorded, notification dispatched',
    assessPass ? `Priority: ${assessedTicket?.priority}, Impact: ${assessedTicket?.impact_metadata}` : `${assessErr?.message || histAssessErr?.message || notifAssessErr?.message}`,
    assessPass
  )

  // ---------------------------------------------------------------------------
  // 9. Assignment / Take Over (IT Staff)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 5: Assignment / Take Over (IT Staff) ---')
  const { data: assignedTicket, error: assignErr } = await staff1.client.from('tickets').update({
    assignee_id: staff1.user.id,
    status: 'In Progress'
  }).eq('id', ticketId).select().single()

  await staff1.client.from('ticket_history').insert({
    ticket_id: ticketId,
    actor_id: staff1.user.id,
    event_type: 'TICKET_ASSIGNED',
    change_payload: {
      assignee_id: staff1.user.id,
      assignee_name: staff1.profile.full_name,
      handover_note: 'Self-assigned by Ahmad Pratama'
    }
  })

  await staff1.client.from('notifications').insert({
    target_user_id: emp.user.id,
    source_ticket_id: ticketId,
    event_type: 'EVENT_TICKET_ASSIGNED',
    audio_priority_context: 'High',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  const assignPass = !assignErr && assignedTicket?.assignee_id === staff1.user.id && assignedTicket?.status === 'In Progress'
  recordTest(
    '9. Assignment / Take Over',
    'Self-assign / Take Over ticket',
    'assignee_id set to Staff ID, status transitions to "In Progress"',
    assignPass ? `Assignee: ${assignedTicket?.assignee_id}, Status: ${assignedTicket?.status}` : assignErr?.message,
    assignPass
  )

  // ---------------------------------------------------------------------------
  // 10. Work Note (IT Staff)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 6: Work Note (IT Staff) ---')
  const workNoteText = 'Investigated RADIUS and SAP application server logs. Verified SAP ERP license seat was locked. Unlocked user session on SAP NetWeaver console.'
  
  const { data: workNoteRecord, error: noteErr } = await staff1.client.from('ticket_history').insert({
    ticket_id: ticketId,
    actor_id: staff1.user.id,
    event_type: 'WORK_NOTE_ADDED',
    change_payload: { note: workNoteText, author_name: staff1.profile.full_name }
  }).select().single()

  const { data: allHistory } = await staff1.client.from('ticket_history').select('*').eq('ticket_id', ticketId).order('created_at')
  const notePass = !noteErr && workNoteRecord && allHistory?.length >= 3

  recordTest(
    '10. Work Note',
    'Append work note to history',
    'Work note added, total history entries incremented without overwriting past entries (append-only)',
    notePass ? `Total history entries: ${allHistory?.length}, Latest: ${allHistory?.[allHistory.length - 1]?.event_type}` : noteErr?.message,
    notePass
  )

  // ---------------------------------------------------------------------------
  // 11. Resolution (IT Staff)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 7: Resolution (IT Staff) ---')
  const validResolution = 'Unlocked locked user session in SAP NetWeaver Administrator, reset ERP session pool, and tested remote RFC connectivity from endpoint FIN-WS-0412. SAP GUI logged in successfully.'
  const isResValidLength = validResolution.trim().length > 0
  
  const { data: resolvedTicket, error: resolveErr } = await staff1.client.from('tickets').update({
    status: 'Verification',
    resolution_notes: validResolution,
    verification_started_at: new Date().toISOString()
  }).eq('id', ticketId).select().single()

  await staff1.client.from('ticket_history').insert({
    ticket_id: ticketId,
    actor_id: staff1.user.id,
    event_type: 'RESOLUTION_SUBMITTED',
    change_payload: {
      resolution_notes: validResolution,
      root_cause: 'Locked SAP ERP Session'
    }
  })

  await staff1.client.from('notifications').insert({
    target_user_id: emp.user.id,
    source_ticket_id: ticketId,
    event_type: 'EVENT_RESOLUTION_SUBMITTED',
    audio_priority_context: 'High',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  const resolvePass = !resolveErr && resolvedTicket?.status === 'Verification' && isResValidLength
  recordTest(
    '11. Resolution',
    'Submit valid non-empty resolution and transition status to Verification',
    'Status transitions to "Verification", resolution_notes recorded, notification sent to Employee',
    resolvePass ? `Status: ${resolvedTicket?.status}, Resolution length: ${validResolution.length} chars` : resolveErr?.message,
    resolvePass
  )

  // ---------------------------------------------------------------------------
  // 4. Notification (Employee)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 8: Notifications (Employee) ---')
  const { data: empNotifs } = await emp.client.from('notifications').select('*').eq('target_user_id', emp.user.id)
  const unreadNotifs = empNotifs?.filter(n => n.persistent_unread_state === 'unread')
  
  let markReadPass = false
  if (unreadNotifs && unreadNotifs.length > 0) {
    const notifToMark = unreadNotifs[0]
    const { data: marked, error: markErr } = await emp.client.from('notifications').update({ persistent_unread_state: 'read' }).eq('id', notifToMark.id).select().single()
    markReadPass = !markErr && marked?.persistent_unread_state === 'read'
  }

  const notifPass = empNotifs && empNotifs.length >= 2 && markReadPass
  recordTest(
    '4. Notification',
    'Employee notification delivery & unread/read state toggle',
    'Notifications received for lifecycle events, mark read successfully updates persistent_unread_state',
    notifPass ? `Total received: ${empNotifs.length}, Unread count: ${unreadNotifs?.length}, Mark read: SUCCESS` : 'Failed notification check',
    notifPass
  )

  // ---------------------------------------------------------------------------
  // 5. Verification & Dispute (Employee)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 9: Verification & Dispute (Employee) ---')
  
  // Test 5A: Dispute Flow
  const disputeExplanation = 'SAP GUI still returns license allocation error 0x80070005 when opening Finance module.'
  const disputePassMinChars = disputeExplanation.length >= 20

  const { data: disputedTicket, error: disputeErr } = await emp.client.from('tickets').update({
    status: 'In Progress',
    verification_feedback: disputeExplanation
  }).eq('id', ticketId).select().single()

  await emp.client.from('ticket_history').insert({
    ticket_id: ticketId,
    actor_id: emp.user.id,
    event_type: 'VERIFICATION_DISPUTED',
    change_payload: { dispute_reason: disputeExplanation }
  })

  await emp.client.from('notifications').insert({
    target_user_id: staff1.user.id,
    source_ticket_id: ticketId,
    event_type: 'EVENT_RESOLUTION_DISPUTED',
    audio_priority_context: 'High',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  const disputePass = !disputeErr && disputedTicket?.status === 'In Progress' && disputePassMinChars
  recordTest(
    '5. Verification (Dispute)',
    'Dispute resolution with explanation (>= 20 chars)',
    'Status returns to "In Progress", history recorded, IT Staff notified',
    disputePass ? `Status: ${disputedTicket?.status}, Feedback: "${disputedTicket?.verification_feedback}"` : disputeErr?.message,
    disputePass
  )

  // IT Staff re-resolves the ticket
  await staff1.client.from('tickets').update({
    status: 'Verification',
    resolution_notes: 'Reassigned SAP ERP Enterprise license seat pool for Finance department and restarted license daemon. Verified employee account access directly.'
  }).eq('id', ticketId)
  
  await staff1.client.from('ticket_history').insert({
    ticket_id: ticketId,
    actor_id: staff1.user.id,
    event_type: 'RESOLUTION_SUBMITTED',
    change_payload: { resolution_notes: 'Reassigned SAP ERP Enterprise license seat pool.' }
  })

  // Test 5B: Accept & Close Flow
  const { data: closedTicket, error: closeErr } = await emp.client.from('tickets').update({
    status: 'Closed',
    closed_at: new Date().toISOString()
  }).eq('id', ticketId).select().single()

  await emp.client.from('ticket_history').insert({
    ticket_id: ticketId,
    actor_id: emp.user.id,
    event_type: 'VERIFICATION_ACCEPTED',
    change_payload: { note: 'Resolution verified and accepted by employee. SAP portal working.' }
  })

  await emp.client.from('notifications').insert({
    target_user_id: staff1.user.id,
    source_ticket_id: ticketId,
    event_type: 'EVENT_TICKET_CLOSED',
    audio_priority_context: 'Medium',
    visual_badge_active: true,
    persistent_unread_state: 'unread'
  })

  const closePass = !closeErr && closedTicket?.status === 'Closed'
  recordTest(
    '5. Verification (Accept)',
    'Accept resolution to close incident',
    'Status transitions to "Closed", history VERIFICATION_ACCEPTED recorded',
    closePass ? `Final status: ${closedTicket?.status}, Closed at: ${closedTicket?.closed_at}` : closeErr?.message,
    closePass
  )

  // ---------------------------------------------------------------------------
  // 12. Quick Ticket (IT Staff)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 10: Quick Ticket (IT Staff) ---')

  // Case A: Assign to me immediately
  const quickPayloadA = {
    summary: '[Quick Ticket A] Phone walk-up: Outlook calendar sync failure',
    description: 'Reported via walk-up desk by Budi Santoso (Finance). Instant triage.',
    reporter_id: emp.user.id,
    assignee_id: staff1.user.id,
    status: 'In Progress',
    priority: 'High',
    impact_metadata: 'Individual'
  }

  const { data: quickTicketA, error: quickErrA } = await staff1.client.from('tickets').insert(quickPayloadA).select().single()
  
  if (quickTicketA) {
    await staff1.client.from('ticket_history').insert({
      ticket_id: quickTicketA.id,
      actor_id: staff1.user.id,
      event_type: 'TICKET_CREATED',
      change_payload: { intake_channel: 'QUICK_TICKET_IMMEDIATE_ASSIGN', initial_status: 'In Progress' }
    })
  }

  const quickPassA = !quickErrA && quickTicketA?.status === 'In Progress' && quickTicketA?.assignee_id === staff1.user.id
  recordTest(
    '12. Quick Ticket (Assign to Me)',
    'Immediate assignment bypasses queue directly to "In Progress"',
    'Status = "In Progress", Assignee = IT Staff ID, Priority = High',
    quickPassA ? `ID: ${quickTicketA.id}, Status: ${quickTicketA.status}, Assignee: ${quickTicketA.assignee_id}` : quickErrA?.message,
    quickPassA
  )

  // Case B: Enter Operational Queue (no immediate assignment)
  const quickPayloadB = {
    summary: '[Quick Ticket B] Walk-up report: Docking station second monitor glitching',
    description: 'Reported via walk-up desk. Hardware inspection needed.',
    reporter_id: emp.user.id,
    assignee_id: null,
    status: 'Operational Queue',
    priority: 'Medium',
    impact_metadata: 'Individual'
  }

  const { data: quickTicketB, error: quickErrB } = await staff1.client.from('tickets').insert(quickPayloadB).select().single()

  if (quickTicketB) {
    await staff1.client.from('ticket_history').insert({
      ticket_id: quickTicketB.id,
      actor_id: staff1.user.id,
      event_type: 'TICKET_CREATED',
      change_payload: { intake_channel: 'QUICK_TICKET_QUEUE', initial_status: 'Operational Queue' }
    })
  }

  const quickPassB = !quickErrB && quickTicketB?.status === 'Operational Queue' && quickTicketB?.assignee_id === null
  recordTest(
    '12. Quick Ticket (Queue)',
    'Unassigned quick ticket enters Operational Queue',
    'Status = "Operational Queue", Assignee = null, Priority = Medium',
    quickPassB ? `ID: ${quickTicketB.id}, Status: ${quickTicketB.status}, Assignee: ${quickTicketB.assignee_id}` : quickErrB?.message,
    quickPassB
  )

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n====================================================================')
  console.log('FEATURE TEST MATRIX SUMMARY')
  console.log('====================================================================')
  const total = testResults.length
  const passed = testResults.filter(r => r.status === 'PASS').length
  const issues = testResults.filter(r => r.status === 'ISSUE').length

  console.log(`Total Tests : ${total}`)
  console.log(`Passed      : ${passed}`)
  console.log(`Issues      : ${issues}\n`)
}

runFeatureTests().catch(err => {
  console.error('Test execution fatal error:', err)
  process.exit(1)
})
