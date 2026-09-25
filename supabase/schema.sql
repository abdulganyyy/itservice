-- ==============================================================================
-- INTERNAL IT SERVICE PLATFORM - CORE V1 DATABASE DDL SCHEMA
-- Specification Source: docs/analysis/database-schema.md
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean teardown (for fresh rebuilds if needed)
-- DROP TABLE IF EXISTS public.ticket_history CASCADE;
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.tickets CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 Table: users
-- Represents authenticated organizational users with strictly two canonical roles (FR-02)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Employee', 'IT Staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.users IS 'Stores user identity and strictly enforces dual roles (Employee vs IT Staff)';

-- 2.2 Table: tickets
-- Central transactional entity for IT incidents across 10 canonical stages (FR-11)
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id),
    assignee_id UUID NULL REFERENCES public.users(id),
    summary VARCHAR(150) NOT NULL CHECK (char_length(trim(summary)) >= 5),
    description TEXT NOT NULL,
    priority VARCHAR(15) NULL CHECK (priority IN ('Low', 'Medium', 'High')),
    status VARCHAR(30) NOT NULL DEFAULT 'Report' CHECK (
        status IN (
            'Report',
            'Notification',
            'Operational Queue',
            'Initial Assessment',
            'Assignment',
            'In Progress',
            'Resolution',
            'Employee Notification',
            'Verification',
            'Closed'
        )
    ),
    impact_metadata VARCHAR(50) NULL CHECK (
        impact_metadata IN ('Individual', 'Departmental', 'Organization-Wide')
    ),
    resolution_notes TEXT NULL,
    verification_feedback TEXT NULL,
    verification_started_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ NULL
);

COMMENT ON TABLE public.tickets IS 'Primary incident record tracking 10-stage lifecycle, priority, and resolution notes';

-- 2.3 Table: notifications
-- Manages persistent unread state and visual/audio alert dispatch (FR-12..15)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_user_id UUID NOT NULL REFERENCES public.users(id),
    source_ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    visual_badge_active BOOLEAN NOT NULL DEFAULT TRUE,
    audio_priority_context VARCHAR(15) NULL CHECK (
        audio_priority_context IN ('Low', 'Medium', 'High')
    ),
    persistent_unread_state VARCHAR(15) NOT NULL DEFAULT 'unread' CHECK (
        persistent_unread_state IN ('unread', 'read')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.notifications IS 'Persists visual and audio alerts across sessions until acknowledged or auto-read';

-- 2.4 Table: ticket_history
-- Append-only chronological audit log preserving traceable incident timeline (FR-18)
CREATE TABLE IF NOT EXISTS public.ticket_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.users(id),
    event_type VARCHAR(50) NOT NULL,
    change_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.ticket_history IS 'Immutable chronological audit log capturing every lifecycle mutation';

-- ==============================================================================
-- 3. PERFORMANCE INDEXES
-- ==============================================================================

-- Index for Employee Personal Dashboard (Query tickets reported by specific Employee)
CREATE INDEX IF NOT EXISTS idx_tickets_reporter_id ON public.tickets (reporter_id);

-- Index for IT Staff Operational Queue (Query active unresolved tickets)
CREATE INDEX IF NOT EXISTS idx_tickets_status_active ON public.tickets (status) WHERE status != 'Closed';

-- Index for Assigned IT Staff (Query tickets assigned to specific IT Staff)
CREATE INDEX IF NOT EXISTS idx_tickets_assignee_id ON public.tickets (assignee_id) WHERE assignee_id IS NOT NULL;

-- Index for Persistent Unread Notifications (Query unread badges by Target User)
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (target_user_id, persistent_unread_state);

-- Index for Ticket Audit Log Timeline (Query chronological history by Ticket ID)
CREATE INDEX IF NOT EXISTS idx_ticket_history_timeline ON public.ticket_history (ticket_id, created_at ASC);

-- Index for Verification Auto-Close Evaluator (Query tickets pending verification)
CREATE INDEX IF NOT EXISTS idx_tickets_verification_timeout ON public.tickets (verification_started_at) WHERE status = 'Verification';

-- ==============================================================================
-- 4. SYSTEM INVARIANT GUARDS (DATABASE TRIGGERS)
-- ==============================================================================

-- Function 4.1: Enforce Ticket Lifecycle Invariants & Guards
CREATE OR REPLACE FUNCTION public.trg_enforce_ticket_invariants()
RETURNS TRIGGER AS $$
BEGIN
    -- INVARIANT 5: Terminal Closed State Invariant
    -- Once a ticket reaches 'Closed', NO FURTHER FIELD MUTATIONS ARE PERMITTED.
    IF (OLD.status = 'Closed') THEN
        RAISE EXCEPTION 'Terminal Closed State Invariant Violated: closed tickets are permanently locked and immutable.';
    END IF;

    -- INVARIANT 1: Clear Ownership Invariant
    -- If Ticket Status is 'In Progress', Assignee ID MUST NOT BE NULL.
    IF (NEW.status = 'In Progress' AND NEW.assignee_id IS NULL) THEN
        RAISE EXCEPTION 'Clear Ownership Invariant Violated: status In Progress requires non-null assignee_id.';
    END IF;

    -- INVARIANT 3: Mandatory Resolution Notes Guard
    -- Transitioning to 'Resolution' requires non-empty resolution_notes.
    IF (NEW.status = 'Resolution' AND (NEW.resolution_notes IS NULL OR trim(NEW.resolution_notes) = '')) THEN
        RAISE EXCEPTION 'Mandatory Resolution Notes Guard Violated: resolution_notes cannot be empty on Resolution.';
    END IF;

    -- INVARIANT 4: Mandatory Dispute Feedback Guard
    -- Returning to 'In Progress' from 'Verification' (Dispute) requires non-empty verification_feedback.
    IF (OLD.status = 'Verification' AND NEW.status = 'In Progress' AND (NEW.verification_feedback IS NULL OR trim(NEW.verification_feedback) = '')) THEN
        RAISE EXCEPTION 'Mandatory Dispute Guard Violated: dispute transition requires non-empty verification_feedback.';
    END IF;

    -- Auto-record closed_at timestamp when entering 'Closed'
    IF (NEW.status = 'Closed' AND OLD.status != 'Closed') THEN
        NEW.closed_at = CURRENT_TIMESTAMP;
    END IF;

    -- Auto-record verification_started_at when entering 'Verification'
    IF (NEW.status = 'Verification' AND OLD.status != 'Verification') THEN
        NEW.verification_started_at = CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tickets_invariants_guard ON public.tickets;
CREATE TRIGGER trg_tickets_invariants_guard
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.trg_enforce_ticket_invariants();

-- Function 4.2: Enforce Append-Only History (Audit Log Integrity)
CREATE OR REPLACE FUNCTION public.trg_enforce_history_append_only()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit Log Integrity Violated: ticket_history is strictly append-only and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ticket_history_no_update_delete ON public.ticket_history;
CREATE TRIGGER trg_ticket_history_no_update_delete
BEFORE UPDATE OR DELETE ON public.ticket_history
FOR EACH ROW
EXECUTE FUNCTION public.trg_enforce_history_append_only();
