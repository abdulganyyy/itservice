import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://unquzddtylzqufnvrlhb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_qPpybL3kqSusSL9DfkkGJA_MqGI5gkU'

async function createAuthClient(email, password) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`Auth failed for ${email}: ${error.message}`)
  return { client, user: data.user }
}

function createAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

async function runRegression() {
  console.log('====================================================================')
  console.log('STAGE 5 — FINAL NOTIFICATION RLS REGRESSION SUITE')
  console.log('Target: Live Supabase Database (unquzddtylzqufnvrlhb.supabase.co)')
  console.log('====================================================================\n')

  const anon = createAnonClient()
  const employee = await createAuthClient('budi.santoso@corp.internal', 'Password123!')
  const staff1 = await createAuthClient('ahmad.pratama@corp.internal', 'Password123!')
  const staff2 = await createAuthClient('siti.rahma@corp.internal', 'Password123!')

  console.log('Authenticated Users:')
  console.log(`- Employee Budi   : ${employee.user.id}`)
  console.log(`- IT Staff Ahmad  : ${staff1.user.id}`)
  console.log(`- IT Staff Siti   : ${staff2.user.id}\n`)

  // Tickets in DB:
  // 1. Assigned ticket: bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb (Reporter: Budi, Assignee: Ahmad)
  const assignedTicketId = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb'
  
  // 2. Unassigned ticket: aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa (Reporter: Budi, Assignee: NULL)
  const unassignedTicketId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'

  // Arbitrary dummy IDs
  const randomUserId = '11111111-1111-1111-1111-111111111111'
  const foreignTicketId = '00000000-0000-0000-0000-000000000000'

  const testResults = []

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Employee -> assigned IT Staff (ALLOW)
    // -------------------------------------------------------------------------
    const { error: t1Err } = await employee.client
      .from('notifications')
      .insert({
        target_user_id: staff1.user.id,
        source_ticket_id: assignedTicketId,
        event_type: 'EVENT_COMMENT_ADDED',
        visual_badge_active: true,
        persistent_unread_state: 'unread'
      })

    // Verify recipient (Staff Ahmad) can see it
    const { data: staffInbox } = await staff1.client
      .from('notifications')
      .select('id, event_type')
      .eq('source_ticket_id', assignedTicketId)
      .eq('event_type', 'EVENT_COMMENT_ADDED')

    const t1Passed = !t1Err && staffInbox && staffInbox.length > 0
    testResults.push({
      test: 'Employee -> assigned IT Staff',
      expected: 'ALLOW',
      actual: t1Err ? `DENIED (${t1Err.code}: ${t1Err.message})` : `ALLOWED (Received by Staff: ${staffInbox?.length} row)`,
      status: t1Passed ? 'PASS' : 'FAIL'
    })

    // -------------------------------------------------------------------------
    // TEST 2: IT Staff -> ticket reporter (ALLOW)
    // -------------------------------------------------------------------------
    const { error: t2Err } = await staff1.client
      .from('notifications')
      .insert({
        target_user_id: employee.user.id,
        source_ticket_id: assignedTicketId,
        event_type: 'EVENT_STATUS_CHANGED',
        visual_badge_active: true,
        persistent_unread_state: 'unread'
      })

    // Verify recipient (Employee Budi) can see it
    const { data: empInbox } = await employee.client
      .from('notifications')
      .select('id, event_type')
      .eq('source_ticket_id', assignedTicketId)
      .eq('event_type', 'EVENT_STATUS_CHANGED')

    const t2Passed = !t2Err && empInbox && empInbox.length > 0
    testResults.push({
      test: 'IT Staff -> ticket reporter',
      expected: 'ALLOW',
      actual: t2Err ? `DENIED (${t2Err.code}: ${t2Err.message})` : `ALLOWED (Received by Employee: ${empInbox?.length} row)`,
      status: t2Passed ? 'PASS' : 'FAIL'
    })

    // -------------------------------------------------------------------------
    // TEST 3: Employee -> unauthorized target / non-assignee staff (DENY)
    // -------------------------------------------------------------------------
    const { error: t3Err } = await employee.client
      .from('notifications')
      .insert({
        target_user_id: staff2.user.id, // Siti is not assignee on this ticket
        source_ticket_id: assignedTicketId,
        event_type: 'EVENT_COMMENT_ADDED',
        visual_badge_active: true,
        persistent_unread_state: 'unread'
      })

    const t3Pass = Boolean(t3Err)
    testResults.push({
      test: 'Employee -> unauthorized target (non-assignee)',
      expected: 'DENY',
      actual: t3Err ? `DENIED (${t3Err.code})` : 'ALLOWED (UNEXPECTED)',
      status: t3Pass ? 'PASS' : 'FAIL'
    })

    // -------------------------------------------------------------------------
    // TEST 4: Employee -> self on own ticket (DENY)
    // -------------------------------------------------------------------------
    const { error: t4Err } = await employee.client
      .from('notifications')
      .insert({
        target_user_id: employee.user.id, // Budi cannot notify self
        source_ticket_id: assignedTicketId,
        event_type: 'EVENT_COMMENT_ADDED',
        visual_badge_active: true,
        persistent_unread_state: 'unread'
      })

    const t4Pass = Boolean(t4Err)
    testResults.push({
      test: 'Employee -> self on own ticket',
      expected: 'DENY',
      actual: t4Err ? `DENIED (${t4Err.code})` : 'ALLOWED (UNEXPECTED)',
      status: t4Pass ? 'PASS' : 'FAIL'
    })

    // -------------------------------------------------------------------------
    // TEST 5: Employee -> foreign/invalid ticket (DENY)
    // -------------------------------------------------------------------------
    const { error: t5Err } = await employee.client
      .from('notifications')
      .insert({
        target_user_id: staff1.user.id,
        source_ticket_id: foreignTicketId,
        event_type: 'EVENT_COMMENT_ADDED',
        visual_badge_active: true,
        persistent_unread_state: 'unread'
      })

    const t5Pass = Boolean(t5Err)
    testResults.push({
      test: 'Employee -> foreign/invalid ticket',
      expected: 'DENY',
      actual: t5Err ? `DENIED (${t5Err.code})` : 'ALLOWED (UNEXPECTED)',
      status: t5Pass ? 'PASS' : 'FAIL'
    })

    // -------------------------------------------------------------------------
    // TEST 6: Employee -> unassigned ticket (DENY)
    // -------------------------------------------------------------------------
    const { error: t6Err } = await employee.client
      .from('notifications')
      .insert({
        target_user_id: staff1.user.id,
        source_ticket_id: unassignedTicketId, // ticket has assignee = null
        event_type: 'EVENT_COMMENT_ADDED',
        visual_badge_active: true,
        persistent_unread_state: 'unread'
      })

    const t6Pass = Boolean(t6Err)
    testResults.push({
      test: 'Employee -> unassigned ticket',
      expected: 'DENY',
      actual: t6Err ? `DENIED (${t6Err.code})` : 'ALLOWED (UNEXPECTED)',
      status: t6Pass ? 'PASS' : 'FAIL'
    })

    // -------------------------------------------------------------------------
    // TEST 7: IT Staff -> unrelated target on ticket (DENY)
    // -------------------------------------------------------------------------
    const { error: t7Err } = await staff1.client
      .from('notifications')
      .insert({
        target_user_id: randomUserId,
        source_ticket_id: assignedTicketId,
        event_type: 'EVENT_STATUS_CHANGED',
        visual_badge_active: true,
        persistent_unread_state: 'unread'
      })

    const t7Pass = Boolean(t7Err)
    testResults.push({
      test: 'IT Staff -> unrelated target on ticket',
      expected: 'DENY',
      actual: t7Err ? `DENIED (${t7Err.code})` : 'ALLOWED (UNEXPECTED)',
      status: t7Pass ? 'PASS' : 'FAIL'
    })

    // -------------------------------------------------------------------------
    // TEST 8: Anonymous -> anything (DENY)
    // -------------------------------------------------------------------------
    const { error: t8Err } = await anon
      .from('notifications')
      .insert({
        target_user_id: employee.user.id,
        source_ticket_id: assignedTicketId,
        event_type: 'EVENT_STATUS_CHANGED',
        visual_badge_active: true,
        persistent_unread_state: 'unread'
      })

    const t8Pass = Boolean(t8Err)
    testResults.push({
      test: 'Anonymous -> anything',
      expected: 'DENY',
      actual: t8Err ? `DENIED (${t8Err.code})` : 'ALLOWED (UNEXPECTED)',
      status: t8Pass ? 'PASS' : 'FAIL'
    })

  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP: Clean up any created test notifications
    // -------------------------------------------------------------------------
    console.log('Cleaning up temporary test notifications...')
    const { data: testNotifsEmp } = await employee.client.from('notifications').select('id').eq('event_type', 'EVENT_STATUS_CHANGED')
    for (const n of testNotifsEmp || []) {
      await employee.client.from('notifications').delete().eq('id', n.id)
    }

    const { data: testNotifsStaff } = await staff1.client.from('notifications').select('id').eq('event_type', 'EVENT_COMMENT_ADDED')
    for (const n of testNotifsStaff || []) {
      await staff1.client.from('notifications').delete().eq('id', n.id)
    }
    console.log('Test data cleanup finished.\n')
  }

  console.log('====================================================================')
  console.log('REGRESSION TEST RESULTS TABLE')
  console.log('====================================================================')
  console.table(testResults)

  const allPassed = testResults.every(r => r.status === 'PASS')
  console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`)
  console.log('====================================================================\n')
}

runRegression().catch(console.error)
