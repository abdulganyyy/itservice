# Supabase Database Deployment Guide

This directory contains the canonical SQL deployment files for the **Internal IT Service Platform (Core V1)**, directly aligned with `docs/analysis/database-schema.md` and `docs/analysis/permissions.md`.

## File Structure

1. **`schema.sql`**: Core DDL & Triggers
   - Tables: `public.users`, `public.tickets`, `public.notifications`, `public.ticket_history`.
   - `public.users.id` references `auth.users(id)` directly with cascading delete.
   - Trigger `on_auth_user_created`: Automatically creates a `public.users` profile whenever a user is created in Supabase Auth.
   - Trigger `trg_users_immutable_role`: Strictly blocks client mutation of user roles (anti-privilege escalation).
   - Invariant Triggers: Enforces Clear Ownership (Inv 1), Mandatory Resolution Notes (Inv 3), Mandatory Dispute Feedback (Inv 4), Terminal Closed Immutability (Inv 5), Resolution Ownership (TBD #6 Option B), and Employee verification tampering guards.
   - Trigger `trg_ticket_history_no_update_delete`: Enforces strictly append-only audit trail.
2. **`rls.sql`**: Security Layer
   - Helper function `public.get_current_user_role()` with secure `search_path = public, pg_temp;`.
   - Enables Row Level Security (RLS) across all 4 domain tables.
   - Strictly enforces Employee isolation (`reporter_id = auth.uid()`) and IT Staff shared operational queue access.
   - Scopes notification and history insertion to genuine ticket participants (anti-spoofing / anti-spam).
3. **`fix_existing_users_role.sql`**: One-Time Migration Script for Existing Users
   - Corrects `raw_user_meta_data` in `auth.users` and syncs `role = 'IT Staff'` in `public.users` for Ahmad Pratama and Siti Rahma.
   - Run this if accounts were already created via the Supabase Dashboard UI without metadata.
4. **`dev_auth_users.sql`** *(Optional Automated Development Provisioning)*:
   - Provisions all 3 development test accounts directly into `auth.users` with metadata and default password `Password123!`.
   - When run, the `on_auth_user_created` trigger automatically provisions their matching `public.users` rows with correct roles.
5. **`seed.sql`**: Domain Seed Data
   - Operates strictly on domain data (tickets, history, notifications).
   - Dynamically resolves user UUIDs by querying `public.users` by email (`budi.santoso@corp.internal`, `ahmad.pratama@corp.internal`, `siti.rahma@corp.internal`).
   - Requires that the 3 development users exist with correct roles before executing.

---

## Deployment Sequence

> [!IMPORTANT]
> **DO NOT RUN SCRIPTS ON REMOTE SUPABASE UNTIL EXPLICITLY APPROVED.**
> Keep these scripts reviewed and tested locally.

When ready to apply changes to Remote Supabase:

### Step 1: Update Schema Triggers
Run the updated trigger definitions in `supabase/schema.sql` (specifically `handle_new_auth_user` and `trg_prevent_user_role_change`).

### Step 2: Fix Roles for Existing Users (Option A)
Run `supabase/fix_existing_users_role.sql` in Supabase SQL Editor.
This updates `raw_user_meta_data` in `auth.users` and sets the expected roles in `public.users`:
- Budi Santoso -> `Employee`
- Ahmad Pratama -> `IT Staff`
- Siti Rahma -> `IT Staff`

### Step 3: Run `seed.sql`
Populates domain tickets, audit trail logs, and persistent notifications bound dynamically to the verified user accounts.

---

## Verification Query

Run this query in SQL Editor to confirm table creation and row counts:

```sql
SELECT
    t.table_name,
    (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('users', 'tickets', 'notifications', 'ticket_history');
```
