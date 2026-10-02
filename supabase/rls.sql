-- ==============================================================================
-- INTERNAL IT SERVICE PLATFORM - ROW LEVEL SECURITY (RLS) POLICIES
-- Specification Source: docs/analysis/permissions.md
-- ==============================================================================

-- 1. Helper Security Function: Get Authenticated User Role
-- Uses explicit search_path to prevent search_path hijacking vulnerabilities
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.get_current_user_role() FROM public;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- ==============================================================================
-- 2. ENABLE ROW LEVEL SECURITY ON ALL DOMAIN TABLES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. POLICIES FOR: users
-- ==============================================================================

-- 3.1 SELECT: Authenticated users can view all users
-- Required for assignee display, assignment dropdowns, and reporter lookups
DROP POLICY IF EXISTS "users_select_all_authenticated" ON public.users;
CREATE POLICY "users_select_all_authenticated" ON public.users
FOR SELECT TO authenticated
USING (TRUE);

-- 3.2 UPDATE: Users can only update their own profile record
-- Role escalation is strictly blocked at both RLS (WITH CHECK) and Trigger levels
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
CREATE POLICY "users_update_own_profile" ON public.users
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
    id = auth.uid()
    AND role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid())
);

-- Note: No INSERT policy for public.users via client API.
-- New users are inserted strictly via on_auth_user_created trigger from auth.users.

-- ==============================================================================
-- 4. POLICIES FOR: tickets
-- ==============================================================================

-- 4.1 SELECT Policy:
-- Employees see only tickets they reported; IT Staff sees all operational tickets
DROP POLICY IF EXISTS "tickets_select_policy" ON public.tickets;
CREATE POLICY "tickets_select_policy" ON public.tickets
FOR SELECT TO authenticated
USING (
    reporter_id = auth.uid()
    OR public.get_current_user_role() = 'IT Staff'
);

-- 4.2 INSERT Policy:
-- Employees: Can only report for self, cannot assign, cannot set priority, cannot pre-close
-- IT Staff: Can create Quick Tickets on behalf of employees with allowed initial states
DROP POLICY IF EXISTS "tickets_insert_policy" ON public.tickets;
CREATE POLICY "tickets_insert_policy" ON public.tickets
FOR INSERT TO authenticated
WITH CHECK (
    -- Employee self-service path
    (
        public.get_current_user_role() = 'Employee'
        AND reporter_id = auth.uid()
        AND assignee_id IS NULL
        AND priority IS NULL
        AND status IN ('Report', 'Operational Queue')
        AND resolution_notes IS NULL
        AND verification_feedback IS NULL
        AND closed_at IS NULL
    )
    -- IT Staff quick-ticket path
    OR (
        public.get_current_user_role() = 'IT Staff'
        AND status IN ('Report', 'Operational Queue', 'In Progress')
        AND resolution_notes IS NULL
        AND closed_at IS NULL
    )
);

-- 4.3 UPDATE Policy:
-- Employee: Can only update own tickets during 'Verification' (Accept -> Closed, Dispute -> In Progress)
-- IT Staff: Can update active tickets (resolution submission guarded by trigger to active assignee)
DROP POLICY IF EXISTS "tickets_update_policy" ON public.tickets;
CREATE POLICY "tickets_update_policy" ON public.tickets
FOR UPDATE TO authenticated
USING (
    (reporter_id = auth.uid() AND status = 'Verification')
    OR (public.get_current_user_role() = 'IT Staff')
)
WITH CHECK (
    (reporter_id = auth.uid() AND status IN ('Closed', 'In Progress'))
    OR (public.get_current_user_role() = 'IT Staff')
);

-- Note: No DELETE policy is created. Tickets are permanent records.

-- ==============================================================================
-- 5. POLICIES FOR: notifications
-- ==============================================================================

-- 5.1 SELECT Policy:
-- Users can only read notifications specifically addressed to them
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
FOR SELECT TO authenticated
USING (target_user_id = auth.uid());

-- 5.2 UPDATE Policy:
-- Users can only update persistent unread / badge state of their own notifications
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
FOR UPDATE TO authenticated
USING (target_user_id = auth.uid())
WITH CHECK (target_user_id = auth.uid());

-- 5.3 Helper Function: Check Notification Participant Authorization
-- Resolves PostgreSQL RLS subquery scoping limitations during INSERT WITH CHECK
CREATE OR REPLACE FUNCTION public.can_insert_notification(
    p_ticket_id UUID,
    p_target_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_role VARCHAR(20);
    v_reporter_id UUID;
    v_assignee_id UUID;
BEGIN
    SELECT role INTO v_role
    FROM public.users
    WHERE id = auth.uid();

    IF v_role IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT reporter_id, assignee_id
    INTO v_reporter_id, v_assignee_id
    FROM public.tickets
    WHERE id = p_ticket_id;

    IF v_reporter_id IS NULL AND v_assignee_id IS NULL THEN
        RETURN FALSE;
    END IF;

    IF v_role = 'IT Staff'
       AND (
           p_target_user_id = v_reporter_id
           OR (
               v_assignee_id IS NOT NULL
               AND p_target_user_id = v_assignee_id
           )
       )
    THEN
        RETURN TRUE;
    END IF;

    IF v_role = 'Employee'
       AND v_reporter_id = auth.uid()
       AND v_assignee_id IS NOT NULL
       AND p_target_user_id = v_assignee_id
    THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp;

REVOKE EXECUTE
ON FUNCTION public.can_insert_notification(UUID, UUID)
FROM public;

GRANT EXECUTE
ON FUNCTION public.can_insert_notification(UUID, UUID)
TO authenticated;

-- 5.4 INSERT Policy:
-- Users cannot spam arbitrary notifications. Insertion is restricted to participants of the ticket.
DROP POLICY IF EXISTS "notifications_insert_policy"
ON public.notifications;

CREATE POLICY "notifications_insert_policy"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
    public.can_insert_notification(
        source_ticket_id,
        target_user_id
    )
);

-- ==============================================================================
-- 6. POLICIES FOR: ticket_history
-- ==============================================================================

-- 6.1 SELECT Policy:
-- Employees see audit timeline for own reported tickets; IT Staff sees timeline for all tickets
DROP POLICY IF EXISTS "ticket_history_select_policy" ON public.ticket_history;
CREATE POLICY "ticket_history_select_policy" ON public.ticket_history
FOR SELECT TO authenticated
USING (
    public.get_current_user_role() = 'IT Staff'
    OR EXISTS (
        SELECT 1 FROM public.tickets t
        WHERE t.id = ticket_history.ticket_id
        AND t.reporter_id = auth.uid()
    )
);

-- 6.2 INSERT Policy:
-- Actor ID MUST match authenticated user, and user must have permission to access that ticket
DROP POLICY IF EXISTS "ticket_history_insert_policy" ON public.ticket_history;
CREATE POLICY "ticket_history_insert_policy" ON public.ticket_history
FOR INSERT TO authenticated
WITH CHECK (
    auth.role() = 'authenticated'
    AND actor_id = auth.uid()
    AND (
        public.get_current_user_role() = 'IT Staff'
        OR EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_history.ticket_id
            AND t.reporter_id = auth.uid()
        )
    )
);

-- Note: No UPDATE or DELETE policy exists for ticket_history (Append-only enforced by trigger & RLS).
