-- ==============================================================================
-- INTERNAL IT SERVICE PLATFORM - DOMAIN SEED DATA
-- Specification Source: docs/analysis/implementation-plan.md (Stage 2 Task 3)
-- ==============================================================================
-- IMPORTANT NOTE:
-- This seed script operates strictly on DOMAIN DATA (tickets, notifications, history).
-- It does NOT hardcode fake auth user IDs.
--
-- PREREQUISITE:
-- Before running this script, the 3 development users MUST exist in Supabase Auth:
--   1. budi.santoso@corp.internal  (Role: Employee, Name: Budi Santoso)
--   2. ahmad.pratama@corp.internal (Role: IT Staff, Name: Ahmad Pratama)
--   3. siti.rahma@corp.internal    (Role: IT Staff, Name: Siti Rahma)
--
-- You can create these users via:
--   - Supabase Dashboard > Authentication > Users > "Add user"
--   - OR by running the companion script: supabase/dev_auth_users.sql
-- ==============================================================================

DO $$
DECLARE
    v_employee_id UUID;
    v_staff_ahmad_id UUID;
    v_staff_siti_id UUID;
    v_ticket_1_id UUID := 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
    v_ticket_2_id UUID := 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    v_ticket_3_id UUID := 'cccccccc-cccc-4ccc-cccc-cccccccccccc';
    v_ticket_4_id UUID := 'dddddddd-dddd-4ddd-dddd-dddddddddddd';
BEGIN
    -- 1. Lookup genuine user IDs from public.users (populated by Supabase Auth sync)
    SELECT id INTO v_employee_id FROM public.users WHERE email = 'budi.santoso@corp.internal';
    SELECT id INTO v_staff_ahmad_id FROM public.users WHERE email = 'ahmad.pratama@corp.internal';
    SELECT id INTO v_staff_siti_id FROM public.users WHERE email = 'siti.rahma@corp.internal';

    -- 2. Validate that all required auth accounts exist
    IF v_employee_id IS NULL OR v_staff_ahmad_id IS NULL OR v_staff_siti_id IS NULL THEN
        RAISE EXCEPTION 'Domain Seed Aborted: One or more development users are missing in public.users. Please create the 3 development users in Supabase Auth first (budi.santoso@corp.internal, ahmad.pratama@corp.internal, siti.rahma@corp.internal). See supabase/README.md for instructions.';
    END IF;

    RAISE NOTICE 'Found development users: Employee=%, IT Staff 1=%, IT Staff 2=%', v_employee_id, v_staff_ahmad_id, v_staff_siti_id;

    -- ==========================================================================
    -- 3. SEED SAMPLE TICKETS (Covering Canonical Lifecycle States)
    -- ==========================================================================

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
        v_ticket_1_id,
        v_employee_id,
        NULL,
        'Cannot connect to corporate VPN after AD password reset',
        'I updated my Active Directory password this morning via self-service identity manager. Immediately after rebooting, GlobalProtect prompts Authentication failed: Code SEC-401.',
        NULL,
        'Operational Queue',
        NULL,
        CURRENT_TIMESTAMP - INTERVAL '2 HOURS'
    ) ON CONFLICT (id) DO UPDATE SET
        reporter_id = EXCLUDED.reporter_id,
        summary = EXCLUDED.summary;

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
        v_ticket_2_id,
        v_employee_id,
        v_staff_ahmad_id,
        'Finance Month-End Reconciliation Spreadsheet Upload Blocked',
        'Attempted to restart the network adapter twice without success. Finance month-end reconciliation spreadsheet uploads to ERP are blocked.',
        'High',
        'In Progress',
        'Departmental',
        CURRENT_TIMESTAMP - INTERVAL '5 HOURS'
    ) ON CONFLICT (id) DO UPDATE SET
        reporter_id = EXCLUDED.reporter_id,
        assignee_id = EXCLUDED.assignee_id,
        priority = EXCLUDED.priority,
        status = EXCLUDED.status;

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
        v_ticket_3_id,
        v_employee_id,
        v_staff_siti_id,
        'Local Outlook client fails to sync shared mailbox archives',
        'Shared finance mailbox archives stopped updating with error code 0x8004010F.',
        'Medium',
        'Verification',
        'Individual',
        'Rebuilt local Outlook .ost profile and re-established Kerberos token handshake. Verified sync with Exchange server.',
        CURRENT_TIMESTAMP - INTERVAL '6 HOURS',
        CURRENT_TIMESTAMP - INTERVAL '1 DAY'
    ) ON CONFLICT (id) DO UPDATE SET
        reporter_id = EXCLUDED.reporter_id,
        assignee_id = EXCLUDED.assignee_id,
        status = EXCLUDED.status,
        resolution_notes = EXCLUDED.resolution_notes;

    -- Ticket 4: Terminal Closed Incident (Historical Traceable Record)
    -- Insert directly with final state
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
        v_ticket_4_id,
        v_employee_id,
        v_staff_ahmad_id,
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

    -- ==========================================================================
    -- 4. SEED AUDIT LOG (ticket_history)
    -- ==========================================================================
    INSERT INTO public.ticket_history (ticket_id, actor_id, event_type, change_payload, created_at)
    VALUES
        (v_ticket_1_id, v_employee_id, 'TICKET_CREATED', '{"channel": "SELF_SERVICE", "initial_status": "Report"}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '2 HOURS'),
        (v_ticket_2_id, v_employee_id, 'TICKET_CREATED', '{"channel": "SELF_SERVICE"}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '5 HOURS'),
        (v_ticket_2_id, v_staff_ahmad_id, 'PRIORITY_ASSESSED', '{"old_priority": null, "new_priority": "High", "impact": "Departmental"}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '4 HOURS 45 MINUTES'),
        (v_ticket_2_id, v_staff_ahmad_id, 'TICKET_ASSIGNED', jsonb_build_object('assignee_id', v_staff_ahmad_id, 'assignee_name', 'Ahmad Pratama'), CURRENT_TIMESTAMP - INTERVAL '4 HOURS 30 MINUTES'),
        (v_ticket_2_id, v_staff_ahmad_id, 'WORK_NOTE_ADDED', '{"note": "Inspected network adapter routing table. Testing firewall exception for ERP subnet."}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '3 HOURS')
    ON CONFLICT DO NOTHING;

    -- ==========================================================================
    -- 5. SEED NOTIFICATIONS (Persistent Unread / Read Badges)
    -- ==========================================================================
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
        (v_staff_ahmad_id, v_ticket_2_id, 'EVENT_TICKET_ASSIGNED', TRUE, 'High', 'unread', CURRENT_TIMESTAMP - INTERVAL '4 HOURS 30 MINUTES'),
        -- Unread verification prompt alert for Budi Santoso
        (v_employee_id, v_ticket_3_id, 'EVENT_RESOLUTION_SUBMITTED', TRUE, 'Medium', 'unread', CURRENT_TIMESTAMP - INTERVAL '6 HOURS'),
        -- Read past closure notice for Budi Santoso
        (v_employee_id, v_ticket_4_id, 'EVENT_TICKET_CLOSED', FALSE, 'Low', 'read', CURRENT_TIMESTAMP - INTERVAL '3 DAYS')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Domain Seed Completed Successfully!';
END;
$$;
