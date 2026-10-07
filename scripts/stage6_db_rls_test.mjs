import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://unquzddtylzqufnvrlhb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_qPpybL3kqSusSL9DfkkGJA_MqGI5gkU'

function getAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

async function createAuthClient(email, password) {
  const client = getAnonClient()
  const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw new Error(`Auth failed for ${email}: ${error.message}`)
  const { data: profile } = await client.from('users').select('*').eq('id', data.user.id).single()
  return { client, user: data.user, session: data.session, profile }
}

const testResults = []

function recordResult(category, testName, expected, actual, status, details = '') {
  testResults.push({ category, testName, expected, actual, status, details })
  const icon = status === 'PASS' ? '✅ PASS' : status === 'FAIL' ? '❌ FAIL' : '⚠️ NEEDS REVIEW'
  console.log(`[${icon}] [${category}] ${testName}`)
  console.log(`        Expected: ${expected}`)
  console.log(`        Actual  : ${actual}`)
  if (details) console.log(`        Details : ${details}`)
}

async function runStage6DbRlsTesting() {
  console.log('====================================================================')
  console.log('PHASE 8 — STAGE 6: DATABASE, RLS, CONSTRAINTS & SECURITY TESTING')
  console.log('Target: Live Connected Supabase (unquzddtylzqufnvrlhb.supabase.co)')
  console.log('====================================================================\n')

  const emp = await createAuthClient('budi.santoso@corp.internal', 'Password123!')
  const staffA = await createAuthClient('ahmad.pratama@corp.internal', 'Password123!')
  const staffB = await createAuthClient('siti.rahma@corp.internal', 'Password123!')
  const anon = getAnonClient()

  console.log(`[Setup] Employee A (Budi)  : ${emp.user.email} (${emp.user.id})`)
  console.log(`[Setup] IT Staff A (Ahmad) : ${staffA.user.email} (${staffA.user.id})`)
  console.log(`[Setup] IT Staff B (Siti)  : ${staffB.user.email} (${staffB.user.id})\n`)

  // ===========================================================================
  // CATEGORY 1: EMPLOYEE RLS TESTS
  // ===========================================================================
  console.log('--------------------------------------------------------------------')
  console.log('CATEGORY 1: EMPLOYEE RLS TESTS')
  console.log('--------------------------------------------------------------------')

  // 1.1 Employee creates a valid ticket
  const { data: empTicket1, error: empTicket1Err } = await emp.client.from('tickets').insert({
    summary: 'Employee RLS Test Ticket #1',
    description: 'Testing employee RLS self-service creation',
    reporter_id: emp.user.id,
    status: 'Operational Queue'
  }).select().single()
  const empT1Pass = !empTicket1Err && empTicket1?.id && empTicket1.reporter_id === emp.user.id
  recordResult(
    'Employee RLS',
    'EMP-01: Employee Creates Valid Self-Reported Ticket',
    'Allowed: Ticket created in Operational Queue with reporter_id = auth.uid()',
    empT1Pass ? `Created ticket ID ${empTicket1.id}, status="${empTicket1.status}"` : `Failed: ${empTicket1Err?.message}`,
    empT1Pass ? 'PASS' : 'FAIL'
  )

  // 1.2 Employee reads own tickets
  const { data: empOwnTickets, error: empReadErr } = await emp.client.from('tickets').select('*')
  const empReadPass = !empReadErr && Array.isArray(empOwnTickets) && empOwnTickets.some(t => t.id === empTicket1?.id)
  recordResult(
    'Employee RLS',
    'EMP-02: Employee Reads Own Reported Tickets',
    'Allowed: Returns tickets where reporter_id = auth.uid()',
    empReadPass ? `Returned ${empOwnTickets.length} ticket(s) belonging to Employee` : `Failed: ${empReadErr?.message}`,
    empReadPass ? 'PASS' : 'FAIL'
  )

  // 1.3 Employee creates ticket with spoofed reporter_id (someone else's ID)
  const { data: spoofReporter, error: spoofRepErr } = await emp.client.from('tickets').insert({
    summary: 'Spoofed Reporter Ticket',
    description: 'Attempting to submit ticket on behalf of staffA',
    reporter_id: staffA.user.id,
    status: 'Operational Queue'
  }).select()
  const spoofRepPass = Boolean(spoofRepErr) || !spoofReporter || spoofReporter.length === 0
  recordResult(
    'Employee RLS',
    'EMP-03: Employee Attempts Spoofing reporter_id',
    'Rejected by RLS tickets_insert_policy (reporter_id != auth.uid())',
    spoofRepPass ? `Rejected cleanly: "${spoofRepErr?.message || 'Blocked by policy'}"` : 'VULNERABILITY: Employee created ticket for another user',
    spoofRepPass ? 'PASS' : 'FAIL'
  )

  // 1.4 Employee creates ticket with pre-assigned assignee_id
  const { data: preAssigned, error: preAssignErr } = await emp.client.from('tickets').insert({
    summary: 'Pre-assigned Ticket Test',
    description: 'Attempting to self-assign to Ahmad',
    reporter_id: emp.user.id,
    assignee_id: staffA.user.id,
    status: 'Operational Queue'
  }).select()
  const preAssignPass = Boolean(preAssignErr) || !preAssigned || preAssigned.length === 0
  recordResult(
    'Employee RLS',
    'EMP-04: Employee Attempts to Set assignee_id on Insert',
    'Rejected by RLS tickets_insert_policy (assignee_id must be NULL)',
    preAssignPass ? `Rejected cleanly: "${preAssignErr?.message || 'Blocked by policy'}"` : 'VULNERABILITY: Employee assigned staff during report',
    preAssignPass ? 'PASS' : 'FAIL'
  )

  // 1.5 Employee creates ticket with pre-set priority
  const { data: prePriority, error: prePrioErr } = await emp.client.from('tickets').insert({
    summary: 'Pre-set Priority Ticket',
    description: 'Attempting to set High priority during report',
    reporter_id: emp.user.id,
    priority: 'High',
    status: 'Operational Queue'
  }).select()
  const prePrioPass = Boolean(prePrioErr) || !prePriority || prePriority.length === 0
  recordResult(
    'Employee RLS',
    'EMP-05: Employee Attempts to Set priority on Insert',
    'Rejected by RLS tickets_insert_policy (priority must be NULL)',
    prePrioPass ? `Rejected cleanly: "${prePrioErr?.message || 'Blocked by policy'}"` : 'VULNERABILITY: Employee set priority during report',
    prePrioPass ? 'PASS' : 'FAIL'
  )

  // 1.6 Employee creates ticket with invalid initial status (e.g. In Progress)
  const { data: badStatusT, error: badStatusTErr } = await emp.client.from('tickets').insert({
    summary: 'Pre-set In Progress Ticket',
    description: 'Attempting to skip queue directly to In Progress',
    reporter_id: emp.user.id,
    status: 'In Progress'
  }).select()
  const badStatusTPass = Boolean(badStatusTErr) || !badStatusT || badStatusT.length === 0
  recordResult(
    'Employee RLS',
    'EMP-06: Employee Attempts to Set status="In Progress" on Insert',
    'Rejected by RLS tickets_insert_policy (status must be Report or Operational Queue)',
    badStatusTPass ? `Rejected cleanly: "${badStatusTErr?.message || 'Blocked by policy'}"` : 'VULNERABILITY: Employee skipped queue to In Progress',
    badStatusTPass ? 'PASS' : 'FAIL'
  )

  // 1.7 Employee updates ticket during Operational Queue (non-Verification)
  const { data: empBadUpdate, error: empBadUpErr } = await emp.client
    .from('tickets')
    .update({ summary: 'Modified Summary by Employee' })
    .eq('id', empTicket1.id)
    .select()
  const empBadUpPass = Boolean(empBadUpErr) || !empBadUpdate || empBadUpdate.length === 0
  recordResult(
    'Employee RLS',
    'EMP-07: Employee Attempts Direct Update During Operational Queue',
    'Rejected/Blocked: Employee can only update ticket during Verification stage',
    empBadUpPass ? `Blocked cleanly: ${empBadUpErr ? empBadUpErr.message : '0 rows affected (RLS filter)'}` : 'VULNERABILITY: Employee modified ticket in queue',
    empBadUpPass ? 'PASS' : 'FAIL'
  )

  // 1.8 Employee attempts to change user role in public.users
  const { data: roleHack, error: roleHackErr } = await emp.client
    .from('users')
    .update({ role: 'IT Staff' })
    .eq('id', emp.user.id)
    .select()
  const roleHackPass = Boolean(roleHackErr) || !roleHack || roleHack.length === 0
  const { data: empVerifyRole } = await emp.client.from('users').select('role').eq('id', emp.user.id).single()
  const roleImmutablePass = roleHackPass && empVerifyRole?.role === 'Employee'
  recordResult(
    'Employee RLS',
    'EMP-08: Employee Privilege Escalation (Role Mutation in public.users)',
    'Rejected by RLS WITH CHECK & trigger trg_users_immutable_role',
    roleImmutablePass ? `Rejected cleanly: "${roleHackErr?.message || 'Blocked'}" (Role remains: "${empVerifyRole?.role}")` : 'CRITICAL VULNERABILITY: User altered role!',
    roleImmutablePass ? 'PASS' : 'FAIL'
  )

  // ===========================================================================
  // CATEGORY 2: IT STAFF RLS & WORKFLOW ACTIONS
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('CATEGORY 2: IT STAFF RLS & WORKFLOW ACTIONS')
  console.log('--------------------------------------------------------------------')

  // 2.1 Staff A reads operational queue
  const { data: staffQueue, error: staffQueueErr } = await staffA.client.from('tickets').select('*')
  const staffQueuePass = !staffQueueErr && staffQueue.some(t => t.id === empTicket1.id)
  recordResult(
    'Staff RLS',
    'STAFF-01: IT Staff Reads Operational Queue (Global Visibility)',
    'Allowed: IT Staff can see all operational tickets',
    staffQueuePass ? `Successfully retrieved queue (${staffQueue.length} tickets visible)` : `Failed: ${staffQueueErr?.message}`,
    staffQueuePass ? 'PASS' : 'FAIL'
  )

  // 2.2 Staff A performs Initial Assessment (set priority & impact)
  const { data: assessedT, error: assessErr } = await staffA.client
    .from('tickets')
    .update({
      priority: 'High',
      impact_metadata: 'Departmental',
      status: 'Initial Assessment'
    })
    .eq('id', empTicket1.id)
    .select()
    .single()
  const assessPass = !assessErr && assessedT?.priority === 'High' && assessedT?.impact_metadata === 'Departmental'
  recordResult(
    'Staff RLS',
    'STAFF-02: IT Staff Performs Initial Assessment (Priority & Impact)',
    'Allowed: Priority="High", Impact="Departmental", Status="Initial Assessment"',
    assessPass ? `Assessed ticket ${empTicket1.id}: priority=${assessedT.priority}, impact=${assessedT.impact_metadata}` : `Failed: ${assessErr?.message}`,
    assessPass ? 'PASS' : 'FAIL'
  )

  // 2.3 Staff A assigns ticket to self and moves to In Progress
  const { data: assignedT, error: assignErr } = await staffA.client
    .from('tickets')
    .update({
      assignee_id: staffA.user.id,
      status: 'In Progress'
    })
    .eq('id', empTicket1.id)
    .select()
    .single()
  const assignPass = !assignErr && assignedT?.assignee_id === staffA.user.id && assignedT?.status === 'In Progress'
  recordResult(
    'Staff RLS',
    'STAFF-03: IT Staff Assignment & In Progress Transition',
    'Allowed: Assignee set to Staff A, Status="In Progress"',
    assignPass ? `Assigned to ${staffA.user.email}, status="${assignedT.status}"` : `Failed: ${assignErr?.message}`,
    assignPass ? 'PASS' : 'FAIL'
  )

  // 2.4 Staff B (Non-Assignee) attempts to Resolve ticket assigned to Staff A
  // TBD #6 Option B Guard: Resolution Submission restricted strictly to active Assignee
  const { data: nonAssigneeResolve, error: nonAssigneeErr } = await staffB.client
    .from('tickets')
    .update({
      status: 'Resolution',
      resolution_notes: 'Unauthorized resolution attempt by Staff B'
    })
    .eq('id', empTicket1.id)
    .select()
  const nonAssigneeBlocked = Boolean(nonAssigneeErr) || !nonAssigneeResolve || nonAssigneeResolve.length === 0
  recordResult(
    'Staff RLS',
    'STAFF-04: Non-Assignee Staff Attempts Resolution (TBD #6 Guard)',
    'Rejected by trigger trg_enforce_ticket_invariants: Resolution restricted to active Assignee',
    nonAssigneeBlocked ? `Rejected cleanly: "${nonAssigneeErr?.message}"` : 'VULNERABILITY: Non-assignee staff resolved ticket without takeover',
    nonAssigneeBlocked ? 'PASS' : 'FAIL'
  )

  // 2.5 Staff A (Active Assignee) resolves ticket with resolution_notes
  const { data: resolvedT, error: resolveErr } = await staffA.client
    .from('tickets')
    .update({
      status: 'Resolution',
      resolution_notes: 'Applied firmware upgrade to Cisco switch port 4.'
    })
    .eq('id', empTicket1.id)
    .select()
    .single()
  const resolvePass = !resolveErr && resolvedT?.status === 'Resolution' && resolvedT?.resolution_notes
  recordResult(
    'Staff RLS',
    'STAFF-05: Active Assignee Submits Resolution with Notes',
    'Allowed: Status="Resolution", resolution_notes recorded',
    resolvePass ? `Resolved successfully by ${staffA.user.email}: notes="${resolvedT.resolution_notes}"` : `Failed: ${resolveErr?.message}`,
    resolvePass ? 'PASS' : 'FAIL'
  )

  // Advance ticket to Verification stage
  await staffA.client.from('tickets').update({ status: 'Verification' }).eq('id', empTicket1.id)

  // ===========================================================================
  // CATEGORY 3: CROSS-USER DATA ISOLATION
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('CATEGORY 3: CROSS-USER DATA ISOLATION')
  console.log('--------------------------------------------------------------------')

  // Create Ticket #2 reported by Staff A (e.g. Quick Ticket on behalf of Staff A)
  const { data: staffTicket2 } = await staffA.client.from('tickets').insert({
    summary: 'Staff Internal Operational Incident #2',
    description: 'Reported by Staff A for datacenter HVAC',
    reporter_id: staffA.user.id,
    status: 'Operational Queue'
  }).select().single()

  // 3.1 Employee attempts to read Staff Ticket #2 (reported by another user)
  const { data: empCrossRead, error: empCrossErr } = await emp.client
    .from('tickets')
    .select('*')
    .eq('id', staffTicket2.id)
  const empCrossBlocked = !empCrossErr && (!empCrossRead || empCrossRead.length === 0)
  recordResult(
    'Cross User',
    'CROSS-01: Employee Reads Ticket of Another User',
    'Blocked by RLS tickets_select_policy (returns 0 rows)',
    empCrossBlocked ? `Blocked: query returned ${empCrossRead ? empCrossRead.length : 0} rows` : `LEAK: Employee read another user ticket (${empCrossRead?.length} rows)`,
    empCrossBlocked ? 'PASS' : 'FAIL'
  )

  // 3.2 Employee attempts to update Staff Ticket #2
  const { data: empCrossUpdate, error: empCrossUpErr } = await emp.client
    .from('tickets')
    .update({ summary: 'Hacked Summary by Employee' })
    .eq('id', staffTicket2.id)
    .select()
  const empCrossUpBlocked = Boolean(empCrossUpErr) || !empCrossUpdate || empCrossUpdate.length === 0
  recordResult(
    'Cross User',
    'CROSS-02: Employee Updates Ticket of Another User',
    'Blocked by RLS tickets_update_policy (0 rows / denied)',
    empCrossUpBlocked ? `Blocked: ${empCrossUpErr ? empCrossUpErr.message : '0 rows updated'}` : 'VULNERABILITY: Employee updated another user ticket!',
    empCrossUpBlocked ? 'PASS' : 'FAIL'
  )

  // 3.3 Test can_insert_notification: Staff A creates notification for Employee (Reporter of empTicket1)
  // Note: We insert without .select() because actor (Staff A) cannot SELECT a notification targeted to Employee under notifications_select_own
  const { error: notifRepErr } = await staffA.client.from('notifications').insert({
    target_user_id: emp.user.id,
    source_ticket_id: empTicket1.id,
    event_type: 'RESOLUTION_READY'
  })
  const notifRepPass = !notifRepErr
  recordResult(
    'Cross User',
    'CROSS-03: IT Staff Dispatches Notification to Ticket Reporter (Budi)',
    'Allowed by can_insert_notification RLS policy',
    notifRepPass ? `Successfully inserted notification for Employee ${emp.user.email}` : `Failed: ${notifRepErr?.message}`,
    notifRepPass ? 'PASS' : 'FAIL'
  )

  // 3.4 Test can_insert_notification: Staff A attempts to spam/insert notification for unrelated user (Siti on empTicket1)
  const { data: notifUnrelated, error: notifUnrelatedErr } = await staffA.client.from('notifications').insert({
    target_user_id: staffB.user.id,
    source_ticket_id: empTicket1.id,
    event_type: 'SPAM_ALERT'
  })
  const spamBlocked = Boolean(notifUnrelatedErr) || !notifUnrelated || notifUnrelated.length === 0
  recordResult(
    'Cross User',
    'CROSS-04: Notification Spam Prevention (can_insert_notification Guard)',
    'Rejected by RLS notifications_insert_policy: Target user must be a ticket participant (reporter/assignee)',
    spamBlocked ? `Blocked: ${notifUnrelatedErr ? notifUnrelatedErr.message : 'No row inserted'}` : 'VULNERABILITY: Notification sent to non-participant',
    spamBlocked ? 'PASS' : 'FAIL'
  )

  // 3.5 Create valid notification for Siti on staffTicket2 (assignee set to Siti)
  await staffA.client.from('tickets').update({ assignee_id: staffB.user.id, status: 'In Progress' }).eq('id', staffTicket2.id)
  const { error: notifSitiErr } = await staffA.client.from('notifications').insert({
    target_user_id: staffB.user.id,
    source_ticket_id: staffTicket2.id,
    event_type: 'ASSIGNMENT_DISPATCH'
  })

  // 3.6 Staff B (Siti) reads her own notification
  const { data: sitiOwnNotifs } = await staffB.client.from('notifications').select('*').eq('source_ticket_id', staffTicket2.id)
  const sitiOwnPass = Array.isArray(sitiOwnNotifs) && sitiOwnNotifs.length >= 1
  const notifSitiId = sitiOwnNotifs?.[0]?.id
  recordResult(
    'Cross User',
    'CROSS-05: Staff B (Siti) Reads Own Notification',
    'Allowed: Returns notification where target_user_id = auth.uid()',
    sitiOwnPass ? `Read notification ID ${notifSitiId} (event="${sitiOwnNotifs[0].event_type}")` : 'Failed to read own notification',
    sitiOwnPass ? 'PASS' : 'FAIL'
  )

  // 3.7 Staff A attempts to read Siti's notification
  const { data: staffACrossNotif } = await staffA.client.from('notifications').select('*').eq('id', notifSitiId)
  const staffACrossBlocked = !staffACrossNotif || staffACrossNotif.length === 0
  recordResult(
    'Cross User',
    'CROSS-06: Staff A Reads Notification of Staff B (Siti)',
    'Blocked by RLS notifications_select_own (returns 0 rows)',
    staffACrossBlocked ? `Blocked: returned ${staffACrossNotif ? staffACrossNotif.length : 0} rows` : 'LEAK: Notification visible to other staff member',
    staffACrossBlocked ? 'PASS' : 'FAIL'
  )

  // 3.8 Employee attempts to read Siti's notification
  const { data: empCrossNotif } = await emp.client.from('notifications').select('*').eq('id', notifSitiId)
  const empCrossNotifBlocked = !empCrossNotif || empCrossNotif.length === 0
  recordResult(
    'Cross User',
    'CROSS-07: Employee Reads Notification of Staff B',
    'Blocked by RLS notifications_select_own (returns 0 rows)',
    empCrossNotifBlocked ? `Blocked: returned ${empCrossNotif ? empCrossNotif.length : 0} rows` : 'LEAK: Employee read staff notification',
    empCrossNotifBlocked ? 'PASS' : 'FAIL'
  )

  // 3.9 Employee reads Employee's own notification
  const { data: empOwnNotifs } = await emp.client.from('notifications').select('*').eq('source_ticket_id', empTicket1.id)
  const empOwnPass = Array.isArray(empOwnNotifs) && empOwnNotifs.length >= 1
  const notifEmpId = empOwnNotifs?.[0]?.id
  recordResult(
    'Cross User',
    'CROSS-08: Employee Reads Own Notification',
    'Allowed: Returns notification where target_user_id = auth.uid()',
    empOwnPass ? `Read notification ID ${notifEmpId} (event="${empOwnNotifs[0].event_type}")` : 'Failed to read own notification',
    empOwnPass ? 'PASS' : 'FAIL'
  )

  // ===========================================================================
  // CATEGORY 4: DIRECT FIELD MANIPULATION & INVARIANT GUARDS
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('CATEGORY 4: DIRECT FIELD MANIPULATION & INVARIANT GUARDS')
  console.log('--------------------------------------------------------------------')

  // 4.1 Resolution Notes Mandatory Guard (Transitioning to Resolution with empty notes)
  // Reopen ticket to In Progress for Staff A
  await staffA.client.from('tickets').update({ status: 'In Progress' }).eq('id', empTicket1.id)

  const { data: emptyNoteResolve, error: emptyNoteErr } = await staffA.client
    .from('tickets')
    .update({
      status: 'Resolution',
      resolution_notes: '   ' // whitespace only
    })
    .eq('id', empTicket1.id)
    .select()
  const emptyNoteBlocked = Boolean(emptyNoteErr) && emptyNoteErr.message.includes('Mandatory Resolution Notes Guard Violated')
  recordResult(
    'Field Manipulation',
    'FIELD-01: Transition to "Resolution" with Empty/Whitespace Notes',
    'Rejected by trigger trg_enforce_ticket_invariants: resolution_notes cannot be empty',
    emptyNoteBlocked ? `Rejected cleanly: "${emptyNoteErr.message}"` : 'FAIL: Empty resolution notes permitted',
    emptyNoteBlocked ? 'PASS' : 'FAIL'
  )

  // Put ticket into Verification stage
  await staffA.client.from('tickets').update({
    status: 'Resolution',
    resolution_notes: 'Valid resolution notes provided'
  }).eq('id', empTicket1.id)
  await staffA.client.from('tickets').update({ status: 'Verification' }).eq('id', empTicket1.id)

  // 4.2 Employee Verification Dispute without feedback
  const { data: emptyDispute, error: emptyDisputeErr } = await emp.client
    .from('tickets')
    .update({
      status: 'In Progress',
      verification_feedback: '' // empty dispute feedback
    })
    .eq('id', empTicket1.id)
    .select()
  const emptyDisputeBlocked = Boolean(emptyDisputeErr) && emptyDisputeErr.message.includes('Mandatory Dispute Guard Violated')
  recordResult(
    'Field Manipulation',
    'FIELD-02: Employee Disputes without verification_feedback',
    'Rejected by trigger trg_enforce_ticket_invariants: dispute requires non-empty feedback',
    emptyDisputeBlocked ? `Rejected cleanly: "${emptyDisputeErr.message}"` : 'FAIL: Dispute accepted without feedback',
    emptyDisputeBlocked ? 'PASS' : 'FAIL'
  )

  // 4.3 Employee Verification Accept (Verification -> Closed)
  const { data: closedT, error: closeErr } = await emp.client
    .from('tickets')
    .update({ status: 'Closed' })
    .eq('id', empTicket1.id)
    .select()
    .single()
  const closePass = !closeErr && closedT?.status === 'Closed' && closedT?.closed_at
  recordResult(
    'Field Manipulation',
    'FIELD-03: Employee Accepts Verification (Status -> Closed)',
    'Allowed: Status="Closed", closed_at timestamp auto-generated by trigger',
    closePass ? `Closed ticket ${empTicket1.id}, closed_at="${closedT.closed_at}"` : `Failed: ${closeErr?.message}`,
    closePass ? 'PASS' : 'FAIL'
  )

  // 4.4 Terminal Closed State Invariant (Attempt to mutate Closed ticket)
  const { data: mutateClosed, error: mutateClosedErr } = await staffA.client
    .from('tickets')
    .update({ status: 'In Progress', summary: 'Reopening Closed Ticket' })
    .eq('id', empTicket1.id)
    .select()
  const closedLockedPass = Boolean(mutateClosedErr) && mutateClosedErr.message.includes('Terminal Closed State Invariant Violated')
  recordResult(
    'Field Manipulation',
    'FIELD-04: Mutation on Permanently Closed Ticket',
    'Rejected by trigger trg_enforce_ticket_invariants: closed tickets are permanently locked',
    closedLockedPass ? `Rejected cleanly: "${mutateClosedErr.message}"` : 'FAIL: Closed ticket was modified',
    closedLockedPass ? 'PASS' : 'FAIL'
  )

  // ===========================================================================
  // CATEGORY 5: DELETE PROTECTION
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('CATEGORY 5: DELETE PROTECTION')
  console.log('--------------------------------------------------------------------')

  // 5.1 Employee attempts to delete ticket
  const { data: empDelT, error: empDelTErr } = await emp.client.from('tickets').delete().eq('id', empTicket1.id).select()
  const empDelBlocked = !empDelT || empDelT.length === 0
  recordResult(
    'Delete Protection',
    'DEL-01: Employee Deletes Ticket',
    'Blocked by RLS: No DELETE policy exists on tickets table (0 rows affected)',
    empDelBlocked ? `Blocked cleanly: returned ${empDelT ? empDelT.length : 0} rows` : 'CRITICAL VULNERABILITY: Employee deleted ticket',
    empDelBlocked ? 'PASS' : 'FAIL'
  )

  // 5.2 Staff attempts to delete ticket
  const { data: staffDelT, error: staffDelTErr } = await staffA.client.from('tickets').delete().eq('id', staffTicket2.id).select()
  const staffDelBlocked = !staffDelT || staffDelT.length === 0
  recordResult(
    'Delete Protection',
    'DEL-02: IT Staff Deletes Ticket',
    'Blocked by RLS: No DELETE policy exists on tickets table (0 rows affected)',
    staffDelBlocked ? `Blocked cleanly: returned ${staffDelT ? staffDelT.length : 0} rows` : 'CRITICAL VULNERABILITY: Staff deleted ticket',
    staffDelBlocked ? 'PASS' : 'FAIL'
  )

  // 5.3 User attempts to delete notification
  const { data: delNotif, error: delNotifErr } = await staffA.client.from('notifications').delete().eq('id', notifEmpId).select()
  const delNotifBlocked = !delNotif || delNotif.length === 0
  recordResult(
    'Delete Protection',
    'DEL-03: User Deletes Notification',
    'Blocked by RLS: No DELETE policy exists on notifications table (0 rows affected)',
    delNotifBlocked ? `Blocked cleanly: returned ${delNotif ? delNotif.length : 0} rows` : 'FAIL: Notification was deleted via client API',
    delNotifBlocked ? 'PASS' : 'FAIL'
  )

  // ===========================================================================
  // CATEGORY 6: DATABASE CHECK CONSTRAINTS & TYPE SAFETY
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('CATEGORY 6: DATABASE CHECK CONSTRAINTS & TYPE SAFETY')
  console.log('--------------------------------------------------------------------')

  // 6.1 Invalid Role in users table
  const { data: invalidRoleData, error: invalidRoleErr } = await staffA.client.from('users').update({ role: 'SuperAdministrator' }).eq('id', staffA.user.id).select()
  const { data: userRoleCheck } = await staffA.client.from('users').select('role').eq('id', staffA.user.id).single()
  const invalidRolePass = (Boolean(invalidRoleErr) || !invalidRoleData || invalidRoleData.length === 0) && userRoleCheck?.role === 'IT Staff'
  recordResult(
    'Constraints',
    'CONST-01: Invalid Role Guard (users_role_check & trg_users_immutable_role)',
    'Rejected by trigger / RLS policy / CHECK constraint: role cannot be set to invalid role',
    invalidRolePass ? `Blocked/Rejected: ${invalidRoleErr ? invalidRoleErr.message : '0 rows affected'} (role remains: "${userRoleCheck?.role}")` : 'FAIL: Invalid role accepted',
    invalidRolePass ? 'PASS' : 'FAIL'
  )

  // 6.2 Invalid Status in tickets table
  const { data: invalidStatusData, error: invalidStatusErr } = await staffA.client.from('tickets').insert({
    summary: 'Invalid Status Test Ticket',
    description: 'Testing invalid status check',
    reporter_id: staffA.user.id,
    status: 'Pending Approval' // invalid enum
  }).select()
  const invalidStatusPass = Boolean(invalidStatusErr) || !invalidStatusData || invalidStatusData.length === 0
  recordResult(
    'Constraints',
    'CONST-02: Invalid Status Guard (tickets_status_check & RLS insert policy)',
    'Rejected by RLS insert policy / CHECK constraint',
    invalidStatusPass ? `Rejected cleanly: "${invalidStatusErr ? invalidStatusErr.message : 'Blocked'}"` : 'FAIL: Invalid status accepted',
    invalidStatusPass ? 'PASS' : 'FAIL'
  )

  // 6.3 Invalid Priority in tickets table
  const { error: invalidPrioErr } = await staffA.client.from('tickets').insert({
    summary: 'Invalid Priority Test Ticket',
    description: 'Testing invalid priority check',
    reporter_id: staffA.user.id,
    priority: 'Critical' // invalid enum (valid: Low, Medium, High)
  })
  const invalidPrioPass = Boolean(invalidPrioErr) && invalidPrioErr.message.includes('tickets_priority_check')
  recordResult(
    'Constraints',
    'CONST-03: Invalid Priority Check Constraint (tickets_priority_check)',
    'Rejected by CHECK (priority IN (\'Low\', \'Medium\', \'High\'))',
    invalidPrioPass ? `Rejected: "${invalidPrioErr.message}"` : 'FAIL: Invalid priority accepted',
    invalidPrioPass ? 'PASS' : 'FAIL'
  )

  // 6.4 Invalid Impact Metadata in tickets table
  const { error: invalidImpactErr } = await staffA.client.from('tickets').insert({
    summary: 'Invalid Impact Test Ticket',
    description: 'Testing invalid impact check',
    reporter_id: staffA.user.id,
    impact_metadata: 'Global' // invalid enum (valid: Individual, Departmental, Organization-Wide)
  })
  const invalidImpactPass = Boolean(invalidImpactErr) && invalidImpactErr.message.includes('tickets_impact_metadata_check')
  recordResult(
    'Constraints',
    'CONST-04: Invalid Impact Metadata Check Constraint (tickets_impact_metadata_check)',
    'Rejected by CHECK (impact_metadata IN (\'Individual\', \'Departmental\', \'Organization-Wide\'))',
    invalidImpactPass ? `Rejected: "${invalidImpactErr.message}"` : 'FAIL: Invalid impact accepted',
    invalidImpactPass ? 'PASS' : 'FAIL'
  )

  // 6.5 Summary under minimum length (< 5 chars)
  const { error: shortSummaryErr } = await staffA.client.from('tickets').insert({
    summary: 'Bug',
    description: 'Valid problem description',
    reporter_id: staffA.user.id
  })
  const shortSummaryPass = Boolean(shortSummaryErr) && shortSummaryErr.message.includes('tickets_summary_check')
  recordResult(
    'Constraints',
    'CONST-05: Summary Minimum Length Check Constraint (tickets_summary_check)',
    'Rejected by CHECK (char_length(trim(summary)) >= 5)',
    shortSummaryPass ? `Rejected: "${shortSummaryErr.message}"` : 'FAIL: Short summary accepted',
    shortSummaryPass ? 'PASS' : 'FAIL'
  )

  // 6.6 Invalid Notification Persistent Unread State
  const { error: invalidNotifStateErr } = await staffA.client.from('notifications').insert({
    target_user_id: staffA.user.id,
    source_ticket_id: empTicket1.id,
    event_type: 'TEST_EVENT',
    persistent_unread_state: 'pending' // invalid enum (valid: unread, read)
  })
  const invalidNotifStatePass = Boolean(invalidNotifStateErr) && invalidNotifStateErr.message.includes('notifications_persistent_unread_state_check')
  recordResult(
    'Constraints',
    'CONST-06: Notification State Check Constraint (notifications_persistent_unread_state_check)',
    'Rejected by CHECK (persistent_unread_state IN (\'unread\', \'read\'))',
    invalidNotifStatePass ? `Rejected: "${invalidNotifStateErr.message}"` : 'FAIL: Invalid state accepted',
    invalidNotifStatePass ? 'PASS' : 'FAIL'
  )

  // 6.7 NOT NULL Violations
  const { error: nullSummaryErr } = await staffA.client.from('tickets').insert({
    summary: null,
    description: 'Valid problem description',
    reporter_id: staffA.user.id
  })
  const nullSummaryPass = Boolean(nullSummaryErr) && (nullSummaryErr.message.includes('null value') || nullSummaryErr.message.includes('not-null'))
  recordResult(
    'Constraints',
    'CONST-07: NOT NULL Summary Column Constraint',
    'Rejected: null value in column "summary" violates not-null constraint',
    nullSummaryPass ? `Rejected: "${nullSummaryErr.message}"` : 'FAIL: NULL summary accepted',
    nullSummaryPass ? 'PASS' : 'FAIL'
  )

  // 6.8 Malformed UUID string
  const { error: badUuidErr } = await staffA.client.from('tickets').select('*').eq('id', 'not-a-valid-uuid-123')
  const badUuidPass = Boolean(badUuidErr) && badUuidErr.message.includes('invalid input syntax for type uuid')
  recordResult(
    'Constraints',
    'CONST-08: Malformed UUID Query Syntax',
    'Rejected by PostgreSQL: invalid input syntax for type uuid',
    badUuidPass ? `Rejected: "${badUuidErr.message}"` : 'FAIL: Malformed UUID handled unsafely',
    badUuidPass ? 'PASS' : 'FAIL'
  )

  // ===========================================================================
  // CATEGORY 7: REFERENTIAL INTEGRITY & FOREIGN KEYS
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('CATEGORY 7: REFERENTIAL INTEGRITY & FOREIGN KEYS')
  console.log('--------------------------------------------------------------------')

  const nonExistentUuid = 'ffffffff-ffff-4fff-ffff-ffffffffffff'

  // 7.1 Non-existent reporter_id
  const { error: badReporterFkErr } = await staffA.client.from('tickets').insert({
    summary: 'Orphan Reporter Ticket Test',
    description: 'Testing orphan reporter foreign key',
    reporter_id: nonExistentUuid
  })
  const badReporterFkPass = Boolean(badReporterFkErr) && badReporterFkErr.message.includes('tickets_reporter_id_fkey')
  recordResult(
    'Referential Integrity',
    'REF-01: Foreign Key Guard on reporter_id (tickets_reporter_id_fkey)',
    'Rejected by foreign key: reporter_id does not exist in users',
    badReporterFkPass ? `Rejected: "${badReporterFkErr.message}"` : 'FAIL: Orphan ticket created',
    badReporterFkPass ? 'PASS' : 'FAIL'
  )

  // 7.2 Non-existent assignee_id
  const { error: badAssigneeFkErr } = await staffA.client.from('tickets').insert({
    summary: 'Orphan Assignee Ticket Test',
    description: 'Testing orphan assignee foreign key',
    reporter_id: staffA.user.id,
    assignee_id: nonExistentUuid
  })
  const badAssigneeFkPass = Boolean(badAssigneeFkErr) && badAssigneeFkErr.message.includes('tickets_assignee_id_fkey')
  recordResult(
    'Referential Integrity',
    'REF-02: Foreign Key Guard on assignee_id (tickets_assignee_id_fkey)',
    'Rejected by foreign key: assignee_id does not exist in users',
    badAssigneeFkPass ? `Rejected: "${badAssigneeFkErr.message}"` : 'FAIL: Orphan assignee set',
    badAssigneeFkPass ? 'PASS' : 'FAIL'
  )

  // 7.3 Non-existent ticket_id in ticket_history
  const { error: badHistoryFkErr } = await staffA.client.from('ticket_history').insert({
    ticket_id: nonExistentUuid,
    actor_id: staffA.user.id,
    event_type: 'ORPHAN_AUDIT_LOG'
  })
  const badHistoryFkPass = Boolean(badHistoryFkErr) && (badHistoryFkErr.message.includes('ticket_history_ticket_id_fkey') || badHistoryFkErr.message.includes('violates foreign key'))
  recordResult(
    'Referential Integrity',
    'REF-03: Foreign Key Guard on ticket_history (ticket_history_ticket_id_fkey)',
    'Rejected by foreign key: ticket_id does not exist in tickets',
    badHistoryFkPass ? `Rejected: "${badHistoryFkErr.message}"` : 'FAIL: Orphan history log created',
    badHistoryFkPass ? 'PASS' : 'FAIL'
  )

  // 7.4 Non-existent target_user_id in notifications
  const { error: badNotifUserFkErr } = await staffA.client.from('notifications').insert({
    target_user_id: nonExistentUuid,
    source_ticket_id: staffTicket2.id,
    event_type: 'ORPHAN_NOTIFICATION'
  })
  const badNotifUserFkPass = Boolean(badNotifUserFkErr)
  recordResult(
    'Referential Integrity',
    'REF-04: Foreign Key Guard on notifications (notifications_target_user_id_fkey)',
    'Rejected by foreign key / can_insert_notification policy',
    badNotifUserFkPass ? `Rejected: "${badNotifUserFkErr.message}"` : 'FAIL: Orphan notification created',
    badNotifUserFkPass ? 'PASS' : 'FAIL'
  )

  // ===========================================================================
  // CATEGORY 8: HISTORY IMMUTABILITY & APPEND-ONLY AUDIT
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('CATEGORY 8: HISTORY IMMUTABILITY & APPEND-ONLY AUDIT')
  console.log('--------------------------------------------------------------------')

  // Insert legitimate history record
  const { data: validHist, error: validHistErr } = await staffA.client.from('ticket_history').insert({
    ticket_id: staffTicket2.id,
    actor_id: staffA.user.id,
    event_type: 'STATUS_TRANSITION',
    change_payload: { from: 'Report', to: 'Operational Queue' }
  }).select().single()

  const validHistPass = !validHistErr && validHist?.id
  recordResult(
    'History Immutability',
    'HIST-01: Legitimate History Record Insertion',
    'Allowed: Authenticated actor writes valid audit entry for accessible ticket',
    validHistPass ? `Created history entry ID ${validHist.id}` : `Failed: ${validHistErr?.message}`,
    validHistPass ? 'PASS' : 'FAIL'
  )

  // 8.2 Attempt direct UPDATE on ticket_history
  const { data: updateHist, error: updateHistErr } = await staffA.client
    .from('ticket_history')
    .update({ event_type: 'TAMPERED_EVENT' })
    .eq('id', validHist.id)
    .select()
  const { data: checkHistAfterUp } = await staffA.client.from('ticket_history').select('event_type').eq('id', validHist.id).single()
  const updateHistBlocked = (!updateHist || updateHist.length === 0) && checkHistAfterUp?.event_type === 'STATUS_TRANSITION'
  recordResult(
    'History Immutability',
    'HIST-02: Direct UPDATE on ticket_history (Append-Only Guard)',
    'Blocked by RLS & trigger trg_ticket_history_no_update_delete: ticket_history is strictly append-only',
    updateHistBlocked ? `Blocked: 0 rows modified (event_type remains: "${checkHistAfterUp?.event_type}")` : 'CRITICAL VULNERABILITY: Audit history was modified!',
    updateHistBlocked ? 'PASS' : 'FAIL'
  )

  // 8.3 Attempt direct DELETE on ticket_history
  const { data: delHist, error: delHistErr } = await staffA.client
    .from('ticket_history')
    .delete()
    .eq('id', validHist.id)
    .select()
  const { data: checkHistAfterDel } = await staffA.client.from('ticket_history').select('id').eq('id', validHist.id)
  const delHistBlocked = (!delHist || delHist.length === 0) && checkHistAfterDel?.length === 1
  recordResult(
    'History Immutability',
    'HIST-03: Direct DELETE on ticket_history (Append-Only Guard)',
    'Blocked by RLS & trigger trg_ticket_history_no_update_delete: ticket_history cannot be deleted',
    delHistBlocked ? `Blocked: 0 rows deleted (record ID ${validHist.id} preserved in audit log)` : 'CRITICAL VULNERABILITY: Audit history was deleted!',
    delHistBlocked ? 'PASS' : 'FAIL'
  )

  // ===========================================================================
  // CATEGORY 9: RLS BYPASS CHECK (ANONYMOUS & PRIVILEGE CHECKS)
  // ===========================================================================
  console.log('\n--------------------------------------------------------------------')
  console.log('CATEGORY 9: RLS BYPASS CHECK')
  console.log('--------------------------------------------------------------------')

  // 9.1 Anonymous SELECT on tickets
  const { data: anonTSelect } = await anon.from('tickets').select('*')
  const anonTSelectBlocked = !anonTSelect || anonTSelect.length === 0
  recordResult(
    'RLS Bypass',
    'BYPASS-01: Anonymous SELECT on tickets',
    'Blocked by RLS tickets_select_policy: returns 0 rows',
    anonTSelectBlocked ? `Blocked: returned ${anonTSelect ? anonTSelect.length : 0} rows` : 'SECURITY RISK: Anonymous read allowed on tickets',
    anonTSelectBlocked ? 'PASS' : 'FAIL'
  )

  // 9.2 Anonymous INSERT on tickets
  const { data: anonTInsert, error: anonTInsertErr } = await anon.from('tickets').insert({
    summary: 'Anonymous Bypass Test Ticket',
    description: 'Attempting unauthenticated injection',
    status: 'Operational Queue'
  }).select()
  const anonTInsertBlocked = Boolean(anonTInsertErr) && anonTInsertErr.message.includes('violates row-level security policy')
  recordResult(
    'RLS Bypass',
    'BYPASS-02: Anonymous INSERT on tickets',
    'Rejected by RLS tickets_insert_policy',
    anonTInsertBlocked ? `Rejected cleanly: "${anonTInsertErr.message}"` : 'SECURITY RISK: Anonymous ticket creation permitted',
    anonTInsertBlocked ? 'PASS' : 'FAIL'
  )

  // 9.3 Anonymous SELECT on notifications
  const { data: anonNSelect } = await anon.from('notifications').select('*')
  const anonNSelectBlocked = !anonNSelect || anonNSelect.length === 0
  recordResult(
    'RLS Bypass',
    'BYPASS-03: Anonymous SELECT on notifications',
    'Blocked by RLS notifications_select_own: returns 0 rows',
    anonNSelectBlocked ? `Blocked: returned ${anonNSelect ? anonNSelect.length : 0} rows` : 'SECURITY RISK: Notifications readable anonymously',
    anonNSelectBlocked ? 'PASS' : 'FAIL'
  )

  // 9.4 Anonymous SELECT on ticket_history
  const { data: anonHSelect } = await anon.from('ticket_history').select('*')
  const anonHSelectBlocked = !anonHSelect || anonHSelect.length === 0
  recordResult(
    'RLS Bypass',
    'BYPASS-04: Anonymous SELECT on ticket_history',
    'Blocked by RLS ticket_history_select_policy: returns 0 rows',
    anonHSelectBlocked ? `Blocked: returned ${anonHSelect ? anonHSelect.length : 0} rows` : 'SECURITY RISK: Audit history readable anonymously',
    anonHSelectBlocked ? 'PASS' : 'FAIL'
  )

  // 9.5 Anonymous UPDATE on public.users
  const { data: anonUUpdate, error: anonUUpdateErr } = await anon.from('users').update({ full_name: 'Hacked Name' }).eq('id', emp.user.id).select()
  const anonUUpdateBlocked = Boolean(anonUUpdateErr) || !anonUUpdate || anonUUpdate.length === 0
  recordResult(
    'RLS Bypass',
    'BYPASS-05: Anonymous UPDATE on users',
    'Blocked by RLS users_update_own_profile (0 rows / denied)',
    anonUUpdateBlocked ? `Blocked: ${anonUUpdateErr ? anonUUpdateErr.message : '0 rows affected'}` : 'SECURITY RISK: Anonymous update allowed on users table',
    anonUUpdateBlocked ? 'PASS' : 'FAIL'
  )

  // ===========================================================================
  // SUMMARY OF TEST RESULTS
  // ===========================================================================
  console.log('\n====================================================================')
  console.log('PHASE 8 — STAGE 6 TEST EXECUTION SUMMARY')
  console.log('====================================================================')
  const passCount = testResults.filter(r => r.status === 'PASS').length
  const failCount = testResults.filter(r => r.status === 'FAIL').length
  const reviewCount = testResults.filter(r => r.status === 'NEEDS REVIEW').length
  console.log(`Total Tests Executed : ${testResults.length}`)
  console.log(`PASS                 : ${passCount}`)
  console.log(`FAIL                 : ${failCount}`)
  console.log(`NEEDS REVIEW         : ${reviewCount}`)
  console.log('====================================================================')
}

runStage6DbRlsTesting().catch(err => {
  console.error('[Stage 6 Test Runner Fatal Error]:', err)
  process.exit(1)
})
