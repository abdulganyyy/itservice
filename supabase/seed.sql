-- ==============================================================================
-- INTERNAL IT SERVICE PLATFORM - DEVELOPMENT SEED DATA
-- Specification Source: docs/analysis/implementation-plan.md (Stage 2 Task 3)
-- ==============================================================================

-- 1. SEED USERS (1 Employee, 2 IT Staff)
-- Fixed UUIDs for predictable testing and development linkage
INSERT INTO public.users (id, full_name, email, role, created_at)
VALUES
    ('11111111-1111-4111-a111-111111111111', 'Budi Santoso', 'budi.santoso@corp.internal', 'Employee', CURRENT_TIMESTAMP - INTERVAL '10 DAYS'),
    ('22222222-2222-4222-a222-222222222222', 'Ahmad Pratama', 'ahmad.pratama@corp.internal', 'IT Staff', CURRENT_TIMESTAMP - INTERVAL '30 DAYS'),
    ('33333333-3333-4333-a333-333333333333', 'Siti Rahma', 'siti.rahma@corp.internal', 'IT Staff', CURRENT_TIMESTAMP - INTERVAL '30 DAYS')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

-- 2. SEED TICKETS (Covering Key Operational Lifecycle States)

-- Ticket 1: Freshly Reported Incident in Operational Queue (Unassigned, Unassessed)
INSERT INTO public.tickets (
    id,
    reporter_id,
    assignee_id,
    summary,
    description,
    priority,
    status,
    impact_metadata,
    created_at
) VALUES (
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-4111-a111-111111111111',
    NULL,
    'Cannot connect to corporate VPN after AD password reset',
    'I updated my Active Directory password this morning via self-service identity manager. Immediately after rebooting, GlobalProtect prompts Authentication failed: Code SEC-401.',
    NULL,
    'Operational Queue',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '2 HOURS'
) ON CONFLICT (id) DO NOTHING;

-- Ticket 2: Urgent Active Incident In Progress (Assigned to Ahmad Pratama)
INSERT INTO public.tickets (
    id,
    reporter_id,
    assignee_id,
    summary,
    description,
    priority,
    status,
    impact_metadata,
    created_at
) VALUES (
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-4111-a111-111111111111',
    '22222222-2222-4222-a222-222222222222',
    'Finance Month-End Reconciliation Spreadsheet Upload Blocked',
    'Attempted to restart the network adapter twice without success. Finance month-end reconciliation spreadsheet uploads to ERP are blocked.',
    'High',
    'In Progress',
    'Departmental',
    CURRENT_TIMESTAMP - INTERVAL '5 HOURS'
) ON CONFLICT (id) DO NOTHING;

-- Ticket 3: Resolved Incident Pending Employee Verification (Assigned to Siti Rahma)
INSERT INTO public.tickets (
    id,
    reporter_id,
    assignee_id,
    summary,
    description,
    priority,
    status,
    impact_metadata,
    resolution_notes,
    verification_started_at,
    created_at
) VALUES (
    'cccccccc-cccc-4ccc-cccc-cccccccccccc',
    '11111111-1111-4111-a111-111111111111',
    '33333333-3333-4333-a333-333333333333',
    'Local Outlook client fails to sync shared mailbox archives',
    'Shared finance mailbox archives stopped updating with error code 0x8004010F.',
    'Medium',
    'Verification',
    'Individual',
    'Rebuilt local Outlook .ost profile and re-established Kerberos token handshake. Verified sync with Exchange server.',
    CURRENT_TIMESTAMP - INTERVAL '6 HOURS',
    CURRENT_TIMESTAMP - INTERVAL '1 DAY'
) ON CONFLICT (id) DO NOTHING;

-- Ticket 4: Terminal Closed Incident (Historical Traceable Record)
INSERT INTO public.tickets (
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
    closed_at
) VALUES (
    'dddddddd-dddd-4ddd-dddd-dddddddddddd',
    '11111111-1111-4111-a111-111111111111',
    '22222222-2222-4222-a222-222222222222',
    'Workstation Monitor Display Flickering intermittently on HDMI',
    'Second display monitor goes black every 15 minutes during CAD usage.',
    'Low',
    'Closed',
    'Individual',
    'Replaced damaged HDMI 2.1 cable with certified braided cable. Ran 30-min stress test without signal loss.',
    'Confirmed working smoothly now. Thank you for the quick cable replacement!',
    CURRENT_TIMESTAMP - INTERVAL '4 DAYS',
    CURRENT_TIMESTAMP - INTERVAL '5 DAYS',
    CURRENT_TIMESTAMP - INTERVAL '3 DAYS'
) ON CONFLICT (id) DO NOTHING;

-- 3. SEED AUDIT LOG (ticket_history)
INSERT INTO public.ticket_history (ticket_id, actor_id, event_type, change_payload, created_at)
VALUES
    ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', '11111111-1111-4111-a111-111111111111', 'TICKET_CREATED', '{"channel": "SELF_SERVICE", "initial_status": "Report"}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '2 HOURS'),
    ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', '11111111-1111-4111-a111-111111111111', 'TICKET_CREATED', '{"channel": "SELF_SERVICE"}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '5 HOURS'),
    ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', '22222222-2222-4222-a222-222222222222', 'PRIORITY_ASSESSED', '{"old_priority": null, "new_priority": "High", "impact": "Departmental"}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '4 HOURS 45 MINUTES'),
    ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', '22222222-2222-4222-a222-222222222222', 'TICKET_ASSIGNED', '{"assignee_id": "22222222-2222-4222-a222-222222222222", "assignee_name": "Ahmad Pratama"}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '4 HOURS 30 MINUTES'),
    ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', '22222222-2222-4222-a222-222222222222', 'WORK_NOTE_ADDED', '{"note": "Inspected network adapter routing table. Testing firewall exception for ERP subnet."}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '3 HOURS');

-- 4. SEED NOTIFICATIONS (Persistent Unread / Read Badges)
INSERT INTO public.notifications (
    target_user_id,
    source_ticket_id,
    event_type,
    visual_badge_active,
    audio_priority_context,
    persistent_unread_state,
    created_at
) VALUES
    -- Unread high-priority assignment alert for Ahmad Pratama
    ('22222222-2222-4222-a222-222222222222', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'EVENT_TICKET_ASSIGNED', TRUE, 'High', 'unread', CURRENT_TIMESTAMP - INTERVAL '4 HOURS 30 MINUTES'),
    -- Unread verification prompt alert for Budi Santoso
    ('11111111-1111-4111-a111-111111111111', 'cccccccc-cccc-4ccc-cccc-cccccccccccc', 'EVENT_RESOLUTION_SUBMITTED', TRUE, 'Medium', 'unread', CURRENT_TIMESTAMP - INTERVAL '6 HOURS'),
    -- Read past closure notice for Budi Santoso
    ('11111111-1111-4111-a111-111111111111', 'dddddddd-dddd-4ddd-dddd-dddddddddddd', 'EVENT_TICKET_CLOSED', FALSE, 'Low', 'read', CURRENT_TIMESTAMP - INTERVAL '3 DAYS');
