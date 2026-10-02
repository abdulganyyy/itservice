import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://unquzddtylzqufnvrlhb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_qPpybL3kqSusSL9DfkkGJA_MqGI5gkU'

// Helper to create an authenticated client using anon key
async function createAuthClient(email, password) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`Auth failed for ${email}: ${error.message}`)
  
  // Fetch public.users profile
  const { data: profile } = await client.from('users').select('*').eq('id', data.user.id).single()
  return { client, user: data.user, profile }
}

function createAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

const results = []
function record(category, testName, expected, actual, passed, details = '') {
  results.push({ category, testName, expected, actual, passed, details })
  const icon = passed ? '✅ PASS' : '❌ FAIL'
  console.log(`[${icon}] [${category}] ${testName}`)
  if (details) console.log(`       Details: ${details}`)
}

async function main() {
  console.log('====================================================================')
  console.log('PHASE 6 — STAGE 5: RLS RUNTIME VERIFICATION SUITE')
  console.log('Target: Live Supabase Database (unquzddtylzqufnvrlhb.supabase.co)')
  console.log('====================================================================\n')

  const anon = createAnonClient()
  const employee = await createAuthClient('budi.santoso@corp.internal', 'Password123!')
  const staff1 = await createAuthClient('ahmad.pratama@corp.internal', 'Password123!')
  const staff2 = await createAuthClient('siti.rahma@corp.internal', 'Password123!')

  console.log(`Authenticated:`)
  console.log(`- Employee: ${employee.user.email} (${employee.profile.role}, id: ${employee.user.id})`)
  console.log(`- Staff 1 : ${staff1.user.email} (${staff1.profile.role}, id: ${staff1.user.id})`)
  console.log(`- Staff 2 : ${staff2.user.email} (${staff2.profile.role}, id: ${staff2.user.id})\n`)

  const cleanupStack = []

  try {
    // -------------------------------------------------------------------------
    // 1. RLS ENABLED & ANONYMOUS ACCESS BLOCK
    // -------------------------------------------------------------------------
    console.log('\n--- 1. ANONYMOUS & RLS ENABLED CHECKS ---')
    
    // Anon SELECT users
    const { data: aUsers } = await anon.from('users').select('*')
    record('RLS_ANON', 'Anon SELECT public.users', '0 rows / rejected', `${aUsers?.length ?? 0} rows`, (aUsers?.length ?? 0) === 0)

    // Anon SELECT tickets
    const { data: aTickets } = await anon.from('tickets').select('*')
    record('RLS_ANON', 'Anon SELECT public.tickets', '0 rows / rejected', `${aTickets?.length ?? 0} rows`, (aTickets?.length ?? 0) === 0)

    // Anon SELECT notifications
    const { data: aNotifs } = await anon.from('notifications').select('*')
    record('RLS_ANON', 'Anon SELECT public.notifications', '0 rows / rejected', `${aNotifs?.length ?? 0} rows`, (aNotifs?.length ?? 0) === 0)

    // Anon SELECT ticket_history
    const { data: aHist } = await anon.from('ticket_history').select('*')
    record('RLS_ANON', 'Anon SELECT public.ticket_history', '0 rows / rejected', `${aHist?.length ?? 0} rows`, (aHist?.length ?? 0) === 0)

    // -------------------------------------------------------------------------
    // 2. USERS TABLE RLS
    // -------------------------------------------------------------------------
    console.log('\n--- 2. USERS TABLE RLS POLICIES ---')

    // 2.1 Authenticated SELECT (allowed for user directory/names)
    const { data: empUsers } = await employee.client.from('users').select('id, full_name, role')
    record('USERS', 'Employee SELECT users directory', 'Returns user list', `${empUsers?.length ?? 0} users returned`, (empUsers?.length ?? 0) >= 3)

    // 2.2 Employee UPDATE own profile (allowed: full_name)
    const originalName = employee.profile.full_name
    const { data: updateSelf, error: updateSelfErr } = await employee.client
      .from('users')
      .update({ full_name: 'Budi Santoso (Updated Test)' })
      .eq('id', employee.user.id)
      .select()
    const selfUpdatePass = !updateSelfErr && updateSelf?.length === 1
    record('USERS', 'Employee UPDATE own profile full_name', 'Success (1 row updated)', selfUpdatePass ? '1 row updated' : updateSelfErr?.message, selfUpdatePass)
    
    // Revert full_name
    await employee.client.from('users').update({ full_name: originalName }).eq('id', employee.user.id)

    // 2.3 Employee UPDATE other user profile (MUST FAIL / 0 rows)
    const { data: updateOther, error: updateOtherErr } = await employee.client
      .from('users')
      .update({ full_name: 'Hacked Name' })
      .eq('id', staff1.user.id)
      .select()
    const otherUpdatePass = (!updateOther || updateOther.length === 0) || Boolean(updateOtherErr)
    record('USERS', 'Employee UPDATE other user profile', 'Blocked / 0 rows', updateOtherErr?.message || `${updateOther?.length ?? 0} rows updated`, otherUpdatePass)

    // 2.4 Employee Role Escalation Attempt (Employee -> IT Staff) (MUST FAIL)
    const { data: escalateSelf, error: escalateSelfErr } = await employee.client
      .from('users')
      .update({ role: 'IT Staff' })
      .eq('id', employee.user.id)
      .select()
    const escalatePass = Boolean(escalateSelfErr) || !escalateSelf || escalateSelf.length === 0 || escalateSelf[0]?.role === 'Employee'
    record('USERS', 'Employee Role Escalation attempt (role -> IT Staff)', 'Blocked by RLS/Trigger', escalateSelfErr?.message || `Result role: ${escalateSelf?.[0]?.role}`, escalatePass)

    // 2.5 INSERT / DELETE on users table (Client disallowed)
    const { error: insertUserErr } = await employee.client.from('users').insert({ id: '00000000-0000-0000-0000-000000000099', email: 'fake@corp.internal', full_name: 'Fake', role: 'Employee' })
    record('USERS', 'Client direct INSERT public.users', 'Blocked (no insert policy)', insertUserErr ? 'Blocked: ' + insertUserErr.message : 'Allowed (FAIL)', Boolean(insertUserErr))

    const { data: deleteUser, error: deleteUserErr } = await employee.client.from('users').delete().eq('id', employee.user.id).select()
    record('USERS', 'Client direct DELETE public.users', 'Blocked (no delete policy)', deleteUserErr ? 'Blocked: ' + deleteUserErr.message : `${deleteUser?.length ?? 0} rows deleted`, Boolean(deleteUserErr) || (deleteUser?.length ?? 0) === 0)

    // -------------------------------------------------------------------------
    // 3. TICKETS TABLE RLS & WORKFLOW ISOLATION
    // -------------------------------------------------------------------------
    console.log('\n--- 3. TICKETS TABLE RLS & ISOLATION ---')

    // 3.1 Employee valid ticket creation (Report status, self as reporter, no assignee, no priority)
    const { data: empTicket, error: empTicketErr } = await employee.client
      .from('tickets')
      .insert({
        summary: 'Employee Laptop Screen Flickering Issue',
        description: 'Testing employee ticket creation compliance under RLS. External monitor works fine.',
        impact_metadata: 'Individual',
        reporter_id: employee.user.id,
        status: 'Report'
      })
      .select()
      .single()
    
    if (empTicket) cleanupStack.push({ table: 'tickets', id: empTicket.id })
    record('TICKETS', 'Employee INSERT compliant ticket', 'Created successfully', empTicketErr ? empTicketErr.message : `Ticket ID ${empTicket?.id} created`, !empTicketErr && Boolean(empTicket))

    // 3.2 Employee illegal ticket creation: impersonating another reporter
    const { error: impTicketErr } = await employee.client
      .from('tickets')
      .insert({
        summary: 'Illegal Impersonation Ticket',
        description: 'Trying to report as staff1',
        reporter_id: staff1.user.id,
        status: 'Report'
      })
    record('TICKETS', 'Employee INSERT with reporter_id != auth.uid()', 'Blocked by RLS', impTicketErr ? `Blocked: ${impTicketErr.message}` : 'Allowed (FAIL)', Boolean(impTicketErr))

    // 3.3 Employee illegal ticket creation: attempting to pre-set priority
    const { error: prePriorityErr } = await employee.client
      .from('tickets')
      .insert({
        summary: 'Illegal Priority Ticket',
        description: 'Trying to self-assign High priority',
        reporter_id: employee.user.id,
        status: 'Report',
        priority: 'High'
      })
    record('TICKETS', 'Employee INSERT with pre-set priority (High)', 'Blocked by RLS', prePriorityErr ? `Blocked: ${prePriorityErr.message}` : 'Allowed (FAIL)', Boolean(prePriorityErr))

    // 3.4 Employee illegal ticket creation: attempting to pre-assign
    const { error: preAssignErr } = await employee.client
      .from('tickets')
      .insert({
        summary: 'Illegal Assignee Ticket',
        description: 'Trying to self-assign staff1',
        reporter_id: employee.user.id,
        status: 'Report',
        assignee_id: staff1.user.id
      })
    record('TICKETS', 'Employee INSERT with pre-set assignee_id', 'Blocked by RLS', preAssignErr ? `Blocked: ${preAssignErr.message}` : 'Allowed (FAIL)', Boolean(preAssignErr))

    // 3.5 Employee illegal ticket creation: attempting to create directly as 'In Progress' or 'Closed'
    const { error: preClosedErr } = await employee.client
      .from('tickets')
      .insert({
        summary: 'Illegal Closed Ticket',
        description: 'Trying to create directly as Closed',
        reporter_id: employee.user.id,
        status: 'Closed'
      })
    record('TICKETS', 'Employee INSERT with status = "Closed"', 'Blocked by RLS', preClosedErr ? `Blocked: ${preClosedErr.message}` : 'Allowed (FAIL)', Boolean(preClosedErr))

    // 3.6 IT Staff Quick Ticket Creation (on behalf of employee with status in Report/Operational Queue/In Progress)
    const { data: staffTicket, error: staffTicketErr } = await staff1.client
      .from('tickets')
      .insert({
        summary: 'Quick Ticket: Core Network Switch Diagnostic',
        description: 'Quick ticket created by staff1 for employee after phone report',
        impact_metadata: 'Departmental',
        reporter_id: employee.user.id,
        status: 'Operational Queue',
        priority: 'Medium'
      })
      .select()
      .single()

    if (staffTicket) cleanupStack.push({ table: 'tickets', id: staffTicket.id })
    record('TICKETS', 'IT Staff INSERT Quick Ticket on behalf of Employee', 'Created successfully', staffTicketErr ? staffTicketErr.message : `Ticket ID ${staffTicket?.id} created`, !staffTicketErr && Boolean(staffTicket))

    // 3.7 Ticket Visibility: IT Staff sees all operational tickets
    const { data: staffAllTickets } = await staff1.client.from('tickets').select('id, summary, reporter_id')
    const staffCanSeeAll = staffAllTickets && staffAllTickets.length >= 2
    record('TICKETS', 'IT Staff SELECT tickets', 'Sees all operational tickets', `${staffAllTickets?.length ?? 0} tickets visible`, staffCanSeeAll)

    // 3.8 Ticket Visibility: Employee sees ONLY their own reported tickets
    const { data: empVisibleTickets } = await employee.client.from('tickets').select('id, summary, reporter_id')
    const allBelongToEmp = empVisibleTickets && empVisibleTickets.every(t => t.reporter_id === employee.user.id)
    record('TICKETS', 'Employee SELECT tickets', 'Only tickets where reporter_id = auth.uid()', `${empVisibleTickets?.length ?? 0} tickets visible, all belong to employee: ${allBelongToEmp}`, allBelongToEmp)

    // 3.9 Employee direct UPDATE ticket while in 'Report' status (MUST FAIL - only allowed during 'Verification')
    if (empTicket) {
      const { data: empUpdateReport, error: empUpdateReportErr } = await employee.client
        .from('tickets')
        .update({ priority: 'High', status: 'In Progress' })
        .eq('id', empTicket.id)
        .select()
      const blockedEmpUpdate = Boolean(empUpdateReportErr) || (!empUpdateReport || empUpdateReport.length === 0)
      record('TICKETS', 'Employee UPDATE ticket in "Report" status (priority/status mutation)', 'Blocked by RLS (0 rows / error)', empUpdateReportErr?.message || `${empUpdateReport?.length ?? 0} rows updated`, blockedEmpUpdate)
    }

    // 3.10 IT Staff Assessment UPDATE: Assess ticket from 'Report' -> 'Operational Queue' with Priority
    if (empTicket) {
      const { data: staffAssess, error: staffAssessErr } = await staff1.client
        .from('tickets')
        .update({
          priority: 'High',
          status: 'Operational Queue'
        })
        .eq('id', empTicket.id)
        .select()
      const staffAssessPass = !staffAssessErr && staffAssess?.length === 1 && staffAssess[0].priority === 'High'
      record('TICKETS', 'IT Staff UPDATE: Assessment (set priority -> High, status -> Operational Queue)', 'Success (1 row updated)', staffAssessPass ? 'Updated to High / Operational Queue' : staffAssessErr?.message, staffAssessPass)
    }

    // 3.11 IT Staff Assignment UPDATE: Assign to Staff 1 -> status 'In Progress'
    if (empTicket) {
      const { data: staffAssign, error: staffAssignErr } = await staff1.client
        .from('tickets')
        .update({
          assignee_id: staff1.user.id,
          status: 'In Progress'
        })
        .eq('id', empTicket.id)
        .select()
      const staffAssignPass = !staffAssignErr && staffAssign?.length === 1 && staffAssign[0].assignee_id === staff1.user.id
      record('TICKETS', 'IT Staff 1 UPDATE: Assignment (assign to self, status -> In Progress)', 'Success (1 row updated)', staffAssignPass ? `Assigned to ${staff1.user.email}` : staffAssignErr?.message, staffAssignPass)
    }

    // 3.12 IT Staff 2 Takeover UPDATE: Reassign ticket from Staff 1 to Staff 2
    if (empTicket) {
      const { data: staffTakeover, error: staffTakeoverErr } = await staff2.client
        .from('tickets')
        .update({
          assignee_id: staff2.user.id
        })
        .eq('id', empTicket.id)
        .select()
      const staffTakeoverPass = !staffTakeoverErr && staffTakeover?.length === 1 && staffTakeover[0].assignee_id === staff2.user.id
      record('TICKETS', 'IT Staff 2 UPDATE: Takeover assignment (reassign to Staff 2)', 'Success (1 row updated)', staffTakeoverPass ? `Reassigned to ${staff2.user.email}` : staffTakeoverErr?.message, staffTakeoverPass)
    }

    // 3.13 IT Staff Resolution UPDATE: Assigned IT Staff resolves ticket (status -> 'Verification', resolution_notes provided)
    if (empTicket) {
      const { data: staffResolve, error: staffResolveErr } = await staff2.client
        .from('tickets')
        .update({
          status: 'Verification',
          resolution_notes: 'Replaced faulty display cable and updated GPU drivers. Screen is stable.'
        })
        .eq('id', empTicket.id)
        .select()
      const staffResolvePass = !staffResolveErr && staffResolve?.length === 1 && staffResolve[0].status === 'Verification'
      record('TICKETS', 'IT Staff 2 UPDATE: Submit Resolution (status -> Verification, resolution_notes set)', 'Success (1 row updated)', staffResolvePass ? 'Status is now Verification' : staffResolveErr?.message, staffResolvePass)
    }

    // 3.14 Employee UPDATE in 'Verification' status: Dispute Resolution (status -> 'In Progress')
    if (empTicket) {
      const { data: empDispute, error: empDisputeErr } = await employee.client
        .from('tickets')
        .update({
          status: 'In Progress',
          verification_feedback: 'Issue still occurs when connecting dual external monitors.'
        })
        .eq('id', empTicket.id)
        .select()
      const empDisputePass = !empDisputeErr && empDispute?.length === 1 && empDispute[0].status === 'In Progress'
      record('TICKETS', 'Employee UPDATE during Verification: Dispute (status -> In Progress, feedback set)', 'Success (1 row updated)', empDisputePass ? 'Status transitioned to In Progress' : empDisputeErr?.message, empDisputePass)
    }

    // 3.15 IT Staff Re-Resolve ticket: status -> 'Verification'
    if (empTicket) {
      await staff2.client
        .from('tickets')
        .update({
          status: 'Verification',
          resolution_notes: 'Updated DisplayPort drivers and firmware. Tested dual monitors successfully.'
        })
        .eq('id', empTicket.id)
    }

    // 3.16 Employee UPDATE in 'Verification' status: Accept Resolution (status -> 'Closed', closed_at timestamp)
    if (empTicket) {
      const { data: empAccept, error: empAcceptErr } = await employee.client
        .from('tickets')
        .update({
          status: 'Closed',
          verification_feedback: 'Confirmed resolved. Thank you!'
        })
        .eq('id', empTicket.id)
        .select()
      const empAcceptPass = !empAcceptErr && empAccept?.length === 1 && empAccept[0].status === 'Closed'
      record('TICKETS', 'Employee UPDATE during Verification: Accept (status -> Closed)', 'Success (1 row updated)', empAcceptPass ? 'Status transitioned to Closed' : empAcceptErr?.message, empAcceptPass)
    }

    // 3.17 Invariant Guard: Closed ticket is permanently immutable (MUST FAIL for any mutation)
    if (empTicket) {
      const { error: lockErr } = await staff1.client
        .from('tickets')
        .update({ status: 'In Progress' })
        .eq('id', empTicket.id)
      record('TICKETS', 'Terminal Closed State Invariant (mutate closed ticket)', 'Blocked by database trigger', lockErr ? `Blocked: ${lockErr.message}` : 'Allowed (FAIL)', Boolean(lockErr))
    }

    // 3.18 DELETE on Tickets (MUST FAIL / 0 rows for everyone - Permanent Records)
    if (empTicket) {
      const { data: empDel, error: empDelErr } = await employee.client.from('tickets').delete().eq('id', empTicket.id).select()
      const empDelBlocked = Boolean(empDelErr) || (!empDel || empDel.length === 0)
      record('TICKETS', 'Employee DELETE ticket', 'Blocked (no delete policy / 0 rows)', empDelErr?.message || `${empDel?.length ?? 0} rows deleted`, empDelBlocked)

      const { data: staffDel, error: staffDelErr } = await staff1.client.from('tickets').delete().eq('id', empTicket.id).select()
      const staffDelBlocked = Boolean(staffDelErr) || (!staffDel || staffDel.length === 0)
      record('TICKETS', 'IT Staff DELETE ticket', 'Blocked (no delete policy / 0 rows)', staffDelErr?.message || `${staffDel?.length ?? 0} rows deleted`, staffDelBlocked)
    }

    // -------------------------------------------------------------------------
    // 4. NOTIFICATIONS TABLE RLS
    // -------------------------------------------------------------------------
    console.log('\n--- 4. NOTIFICATIONS TABLE RLS ---')

    // 4.1 IT Staff INSERT notification for ticket reporter (allowed participant)
    let testNotifId = null
    if (staffTicket) {
      const { data: notifData, error: notifErr } = await staff1.client
        .from('notifications')
        .insert({
          target_user_id: employee.user.id,
          source_ticket_id: staffTicket.id,
          event_type: 'STATUS_CHANGE',
          audio_priority_context: 'Medium',
          visual_badge_active: true,
          persistent_unread_state: 'unread'
        })
        .select()
        .single()
      if (notifData) {
        testNotifId = notifData.id
        cleanupStack.push({ table: 'notifications', id: notifData.id })
      }
      record('NOTIFICATIONS', 'IT Staff INSERT notification targeting ticket reporter', 'Created successfully', notifErr ? notifErr.message : `Notification ID ${notifData?.id} created`, !notifErr && Boolean(notifData))
    }

    // 4.2 Notification SELECT isolation: Employee sees only their own notifications
    const { data: empNotifList } = await employee.client.from('notifications').select('id, target_user_id')
    const empNotifIsolated = empNotifList && empNotifList.every(n => n.target_user_id === employee.user.id)
    record('NOTIFICATIONS', 'Employee SELECT notifications', 'Only notifications for self', `${empNotifList?.length ?? 0} notifications visible, all for employee: ${empNotifIsolated}`, empNotifIsolated)

    // 4.3 Notification SELECT isolation: Staff 1 does not see Employee private notifications
    const { data: staffNotifList } = await staff1.client.from('notifications').select('id, target_user_id')
    const staffNotifIsolated = staffNotifList && staffNotifList.every(n => n.target_user_id === staff1.user.id)
    record('NOTIFICATIONS', 'IT Staff SELECT notifications', 'Only notifications targeted to Staff 1', `${staffNotifList?.length ?? 0} notifications visible, all for staff 1: ${staffNotifIsolated}`, staffNotifIsolated)

    // 4.4 Notification UPDATE: Employee updates their own notification read status
    if (testNotifId) {
      const { data: readUpdate, error: readUpdateErr } = await employee.client
        .from('notifications')
        .update({ persistent_unread_state: 'read' })
        .eq('id', testNotifId)
        .select()
      const readPass = !readUpdateErr && readUpdate?.length === 1 && readUpdate[0].persistent_unread_state === 'read'
      record('NOTIFICATIONS', 'Employee UPDATE own notification (persistent_unread_state -> read)', 'Success (1 row updated)', readPass ? 'Marked as read' : readUpdateErr?.message, readPass)

      // 4.5 Notification UPDATE: Staff 1 tries to update Employee notification (MUST FAIL / 0 rows)
      const { data: illegalNotifUpdate, error: illegalNotifErr } = await staff1.client
        .from('notifications')
        .update({ persistent_unread_state: 'unread' })
        .eq('id', testNotifId)
        .select()
      const illegalNotifPass = Boolean(illegalNotifErr) || (!illegalNotifUpdate || illegalNotifUpdate.length === 0)
      record('NOTIFICATIONS', 'Cross-user UPDATE notification (Staff 1 -> Employee notif)', 'Blocked (0 rows / error)', illegalNotifErr?.message || `${illegalNotifUpdate?.length ?? 0} rows updated`, illegalNotifPass)
    }

    // 4.6 Spam / Unrelated notification INSERT attempt (MUST FAIL)
    const { error: spamNotifErr } = await employee.client
      .from('notifications')
      .insert({
        target_user_id: staff2.user.id,
        source_ticket_id: '00000000-0000-0000-0000-000000000000',
        event_type: 'SPAM',
        persistent_unread_state: 'unread'
      })
    record('NOTIFICATIONS', 'Arbitrary / Unrelated notification INSERT', 'Blocked by RLS policy', spamNotifErr ? `Blocked: ${spamNotifErr.message}` : 'Allowed (FAIL)', Boolean(spamNotifErr))

    // -------------------------------------------------------------------------
    // 5. TICKET_HISTORY TABLE RLS
    // -------------------------------------------------------------------------
    console.log('\n--- 5. TICKET_HISTORY TABLE RLS ---')

    // 5.1 IT Staff INSERT audit history entry
    let testHistoryId = null
    if (staffTicket) {
      const { data: histData, error: histErr } = await staff1.client
        .from('ticket_history')
        .insert({
          ticket_id: staffTicket.id,
          actor_id: staff1.user.id,
          event_type: 'WORK_NOTE_ADDED',
          change_payload: { note: 'Hardware diagnostic test completed. Temperature normal.' }
        })
        .select()
        .single()
      if (histData) {
        testHistoryId = histData.id
        cleanupStack.push({ table: 'ticket_history', id: histData.id })
      }
      record('TICKET_HISTORY', 'IT Staff INSERT ticket_history entry', 'Created successfully', histErr ? histErr.message : `History ID ${histData?.id} created`, !histErr && Boolean(histData))
    }

    // 5.2 Actor forgery attempt: Employee tries to insert history posing as Staff 1 (MUST FAIL)
    if (staffTicket) {
      const { error: forgeHistErr } = await employee.client
        .from('ticket_history')
        .insert({
          ticket_id: staffTicket.id,
          actor_id: staff1.user.id,
          event_type: 'WORK_NOTE_ADDED',
          change_payload: { note: 'Forged entry posing as staff1' }
        })
      record('TICKET_HISTORY', 'INSERT ticket_history with forged actor_id != auth.uid()', 'Blocked by RLS', forgeHistErr ? `Blocked: ${forgeHistErr.message}` : 'Allowed (FAIL)', Boolean(forgeHistErr))
    }

    // 5.3 Ticket History Immutability: UPDATE attempt (MUST FAIL)
    if (testHistoryId) {
      const { data: histUpdate, error: histUpdateErr } = await staff1.client
        .from('ticket_history')
        .update({ change_payload: { note: 'Tampered note' } })
        .eq('id', testHistoryId)
        .select()
      const histUpdateBlocked = Boolean(histUpdateErr) || (!histUpdate || histUpdate.length === 0)
      record('TICKET_HISTORY', 'UPDATE ticket_history (Immutability check)', 'Blocked by RLS/Trigger', histUpdateErr?.message || `${histUpdate?.length ?? 0} rows updated`, histUpdateBlocked)
    }

    // 5.4 Ticket History Immutability: DELETE attempt (MUST FAIL)
    if (testHistoryId) {
      const { data: histDel, error: histDelErr } = await staff1.client
        .from('ticket_history')
        .delete()
        .eq('id', testHistoryId)
        .select()
      const histDelBlocked = Boolean(histDelErr) || (!histDel || histDel.length === 0)
      record('TICKET_HISTORY', 'DELETE ticket_history (Append-only check)', 'Blocked by RLS/Trigger', histDelErr?.message || `${histDel?.length ?? 0} rows deleted`, histDelBlocked)
    }

  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP TEMPORARY TEST DATA
    // -------------------------------------------------------------------------
    console.log('\n--- CLEANUP TEMPORARY TEST RECORDS ---')
    for (const item of cleanupStack) {
      try {
        if (item.table === 'notifications') {
          await employee.client.from('notifications').delete().eq('id', item.id)
        }
      } catch (cleanupErr) {
        console.warn(`Cleanup notice for ${item.table} #${item.id}:`, cleanupErr.message)
      }
    }
    console.log('Cleanup routine finished.\n')
  }

  // Summary
  console.log('====================================================================')
  console.log('STAGE 5 RLS VERIFICATION SUMMARY')
  console.log('====================================================================')
  const total = results.length
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length
  console.log(`Total Runtime Tests: ${total}`)
  console.log(`Passed              : ${passedCount}`)
  console.log(`Failed              : ${failedCount}`)
  console.log(`Final Status        : ${failedCount === 0 ? 'STAGE 5 — PASS' : 'STAGE 5 — FAIL'}`)
  console.log('====================================================================\n')
}

main().catch(err => {
  console.error('CRITICAL TEST RUNNER EXCEPTION:', err)
  process.exit(1)
})
