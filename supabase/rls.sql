-- ==============================================================================
-- INTERNAL IT SERVICE PLATFORM - ROW LEVEL SECURITY (RLS) POLICIES
-- Specification Source: docs/analysis/permissions.md
-- ==============================================================================

-- 1. Helper Security Function: Get Authenticated User Role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

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
-- Needed for assignee display, assignment dropdowns, and reporter lookups
DROP POLICY IF EXISTS "users_select_all_authenticated" ON public.users;
CREATE POLICY "users_select_all_authenticated" ON public.users
FOR SELECT TO authenticated
USING (TRUE);

-- 3.2 UPDATE: Users can only update their own profile record
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
CREATE POLICY "users_update_own_profile" ON public.users
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

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
-- Employees can report for self; IT Staff can report Quick Tickets on behalf of others
DROP POLICY IF EXISTS "tickets_insert_policy" ON public.tickets;
CREATE POLICY "tickets_insert_policy" ON public.tickets
FOR INSERT TO authenticated
WITH CHECK (
    (public.get_current_user_role() = 'Employee' AND reporter_id = auth.uid())
    OR (public.get_current_user_role() = 'IT Staff')
);

-- 4.3 UPDATE Policy:
-- Employee can only update own tickets during 'Verification' (Accept -> Closed, Dispute -> In Progress).
-- IT Staff can update tickets along operational workflows.
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

-- 5.3 INSERT Policy:
-- Authenticated actors and system triggers can insert notifications for target recipients
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;
CREATE POLICY "notifications_insert_authenticated" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

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
-- Authenticated users can record history logs with their own actor_id
DROP POLICY IF EXISTS "ticket_history_insert_policy" ON public.ticket_history;
CREATE POLICY "ticket_history_insert_policy" ON public.ticket_history
FOR INSERT TO authenticated
WITH CHECK (
    auth.role() = 'authenticated'
    AND actor_id = auth.uid()
);

-- Note: No UPDATE or DELETE policy exists for ticket_history (Append-only enforced).
