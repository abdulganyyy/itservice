-- ==============================================================================
-- INTERNAL IT SERVICE PLATFORM - OPTIONAL DEV AUTH USERS PROVISIONING SCRIPT
-- ==============================================================================
-- Run this script ONLY in development / staging environments via Supabase SQL Editor.
-- It inserts 3 test accounts into auth.users with password: Password123!
--
-- The trigger `on_auth_user_created` in schema.sql will automatically sync them
-- into public.users with their correct roles ('Employee' and 'IT Staff').
-- ==============================================================================

DO $$
DECLARE
    v_user_1_id UUID := gen_random_uuid();
    v_user_2_id UUID := gen_random_uuid();
    v_user_3_id UUID := gen_random_uuid();
    v_encrypted_pw TEXT;
BEGIN
    -- Password hash for 'Password123!' using standard bcrypt
    v_encrypted_pw := crypt('Password123!', gen_salt('bf'));

    -- 1. Employee: Budi Santoso
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'budi.santoso@corp.internal') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            v_user_1_id,
            '00000000-0000-0000-0000-000000000000',
            'budi.santoso@corp.internal',
            v_encrypted_pw,
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Budi Santoso","role":"Employee"}'::jsonb,
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
        RAISE NOTICE 'Created auth user: budi.santoso@corp.internal (Employee)';
    ELSE
        RAISE NOTICE 'Auth user budi.santoso@corp.internal already exists.';
    END IF;

    -- 2. IT Staff 1: Ahmad Pratama
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ahmad.pratama@corp.internal') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            v_user_2_id,
            '00000000-0000-0000-0000-000000000000',
            'ahmad.pratama@corp.internal',
            v_encrypted_pw,
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Ahmad Pratama","role":"IT Staff"}'::jsonb,
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
        RAISE NOTICE 'Created auth user: ahmad.pratama@corp.internal (IT Staff)';
    ELSE
        RAISE NOTICE 'Auth user ahmad.pratama@corp.internal already exists.';
    END IF;

    -- 3. IT Staff 2: Siti Rahma
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'siti.rahma@corp.internal') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            v_user_3_id,
            '00000000-0000-0000-0000-000000000000',
            'siti.rahma@corp.internal',
            v_encrypted_pw,
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Siti Rahma","role":"IT Staff"}'::jsonb,
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
        RAISE NOTICE 'Created auth user: siti.rahma@corp.internal (IT Staff)';
    ELSE
        RAISE NOTICE 'Auth user siti.rahma@corp.internal already exists.';
    END IF;

    RAISE NOTICE 'Development Auth Users provisioning finished successfully.';
END;
$$;
