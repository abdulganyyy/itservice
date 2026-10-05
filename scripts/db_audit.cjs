const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://unquzddtylzqufnvrlhb.supabase.co', 'sb_publishable_qPpybL3kqSusSL9DfkkGJA_MqGI5gkU');

async function main() {
    const { data: auth } = await supabase.auth.signInWithPassword({
        email: 'ahmad.pratama@corp.internal',
        password: 'Password123!'
    });

    // USERS
    const { data: users } = await supabase.from('users').select('*').order('created_at');
    console.log('=== USERS (' + users.length + ') ===');
    users.forEach(u => {
        console.log('  id=' + u.id + ' | ' + u.full_name + ' | ' + u.email + ' | role=' + u.role);
    });

    // TICKETS  
    const { data: tickets } = await supabase.from('tickets').select('*').order('created_at');
    console.log('\n=== TICKETS (' + tickets.length + ') ===');
    
    const seedIds = [
        'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
        'cccccccc-cccc-4ccc-cccc-cccccccccccc',
        'dddddddd-dddd-4ddd-dddd-dddddddddddd'
    ];
    
    tickets.forEach(t => {
        const tag = seedIds.includes(t.id) ? 'SEED' : 'TEST';
        console.log('  [' + tag + '] id=' + t.id);
        console.log('         status=' + t.status + ' | priority=' + (t.priority || 'NULL'));
        console.log('         summary=' + t.summary);
        console.log('         reporter=' + t.reporter_id + ' | assignee=' + (t.assignee_id || 'NULL'));
        console.log('         created=' + t.created_at);
        console.log('');
    });

    // HISTORY
    const { data: history } = await supabase.from('ticket_history').select('*').order('created_at');
    console.log('=== TICKET_HISTORY (' + history.length + ') ===');
    
    const histBySeedTicket = history.filter(h => seedIds.includes(h.ticket_id));
    const histByTestTicket = history.filter(h => !seedIds.includes(h.ticket_id));
    console.log('  Seed-ticket history: ' + histBySeedTicket.length);
    console.log('  Test-ticket history: ' + histByTestTicket.length);

    // Group test history by ticket_id
    const testTicketIds = [...new Set(histByTestTicket.map(h => h.ticket_id))];
    testTicketIds.forEach(tid => {
        const records = histByTestTicket.filter(h => h.ticket_id === tid);
        console.log('  ticket_id=' + tid + ' -> ' + records.length + ' history records');
        records.forEach(r => {
            console.log('    event=' + r.event_type + ' actor=' + r.actor_id + ' at=' + r.created_at);
        });
    });

    // NOTIFICATIONS
    const { data: notifs } = await supabase.from('notifications').select('*').order('created_at');
    console.log('\n=== NOTIFICATIONS (' + notifs.length + ') ===');
    
    const seedNotifs = notifs.filter(n => seedIds.includes(n.source_ticket_id));
    const testNotifs = notifs.filter(n => !seedIds.includes(n.source_ticket_id));
    console.log('  Seed-ticket notifications: ' + seedNotifs.length);
    console.log('  Test-ticket notifications: ' + testNotifs.length);
    
    testNotifs.forEach(n => {
        console.log('  [TEST] notif_id=' + n.id);
        console.log('         ticket=' + n.source_ticket_id + ' | event=' + n.event_type);
        console.log('         target_user=' + n.target_user_id + ' | state=' + n.persistent_unread_state);
    });

    // Also check seed ticket statuses
    console.log('\n=== SEED TICKET STATUS CHECK ===');
    const expectedStatuses = {
        'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa': 'Operational Queue',
        'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb': 'In Progress',
        'cccccccc-cccc-4ccc-cccc-cccccccccccc': 'Verification',
        'dddddddd-dddd-4ddd-dddd-dddddddddddd': 'Closed'
    };
    
    for (const [id, expected] of Object.entries(expectedStatuses)) {
        const t = tickets.find(x => x.id === id);
        if (t) {
            const match = t.status === expected ? 'OK' : 'MODIFIED';
            console.log('  [' + match + '] ' + id.substring(0, 8) + '... expected=' + expected + ' actual=' + t.status);
        } else {
            console.log('  [MISSING] ' + id.substring(0, 8) + '...');
        }
    }

    await supabase.auth.signOut();
}
main().catch(e => { console.error(e); process.exit(1); });
