# Supabase Database Deployment Guide

This directory contains the canonical SQL deployment files for the **Internal IT Service Platform (Core V1)**, directly translated from `docs/analysis/database-schema.md` and `docs/analysis/permissions.md`.

## File Structure

1. **`schema.sql`**: Core DDL
   - Tables: `users`, `tickets`, `notifications`, `ticket_history`
   - Data types, constraints, foreign keys, and indexes
   - System invariant triggers (Clear Ownership, Mandatory Notes, Terminal Closed Immutability, Append-Only History)
2. **`rls.sql`**: Security Layer
   - Enables Row Level Security (RLS) across all 4 tables
   - Enforces Employee data isolation and IT Staff shared operational queue access
   - Protects notification targets and audit log integrity
3. **`seed.sql`**: Development / Testing Data
   - 3 Test Users (1 Employee: Budi Santoso, 2 IT Staff: Ahmad Pratama & Siti Rahma)
   - 4 Sample Tickets covering key lifecycle states (`Operational Queue`, `In Progress`, `Verification`, `Closed`)
   - Audit trail entries in `ticket_history`
   - Persistent notification records in `notifications`

## Execution via Supabase Dashboard (Recommended)

1. Open your project in the [Supabase Dashboard](https://app.supabase.com).
2. Navigate to **SQL Editor** from the left navigation bar.
3. Click **New Query**, copy the contents of `schema.sql`, and click **Run**.
4. Create another query, copy the contents of `rls.sql`, and click **Run**.
5. (Optional for local/staging test): Create another query, copy the contents of `seed.sql`, and click **Run**.

## Verification Query

Run this query in SQL Editor to confirm table creation and row counts:

```sql
SELECT
    table_name,
    (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('users', 'tickets', 'notifications', 'ticket_history');
```
