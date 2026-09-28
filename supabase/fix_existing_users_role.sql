-- ==============================================================================
-- INTERNAL IT SERVICE PLATFORM - OPTION A: FIX EXISTING USERS ROLE
-- ==============================================================================
-- Run this script ONCE in Supabase SQL Editor to correct Ahmad Pratama and Siti Rahma
-- to 'IT Staff' both in auth.users (metadata) and public.users (profile).
--
-- This script preserves existing auth accounts, passwords, and IDs without recreating them.
-- ==============================================================================

-- 1. Sync metadata in auth.users
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "IT Staff", "full_name": "Ahmad Pratama"}'::jsonb
WHERE email = 'ahmad.pratama@corp.internal';

UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "IT Staff", "full_name": "Siti Rahma"}'::jsonb
WHERE email = 'siti.rahma@corp.internal';

UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "Employee", "full_name": "Budi Santoso"}'::jsonb
WHERE email = 'budi.santoso@corp.internal';

-- 2. Update role and full_name in public.users
UPDATE public.users 
SET role = 'IT Staff', full_name = 'Ahmad Pratama'
WHERE email = 'ahmad.pratama@corp.internal';

UPDATE public.users 
SET role = 'IT Staff', full_name = 'Siti Rahma'
WHERE email = 'siti.rahma@corp.internal';

UPDATE public.users 
SET role = 'Employee', full_name = 'Budi Santoso'
WHERE email = 'budi.santoso@corp.internal';

-- 3. Verification: Inspect all users in public.users
SELECT id, full_name, email, role, created_at FROM public.users ORDER BY role, email;
