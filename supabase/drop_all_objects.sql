-- supabase/drop_all_objects.sql
-- Single-file teardown for a PostgreSQL (Supabase) database
-- WARNING: This will permanently remove data and database objects. BACKUP BEFORE RUNNING.
-- Recommended: run from a psql session or the Supabase SQL editor as a database superuser.

/*
Option A (fast, destructive): Drop and recreate the public schema.
This is the simplest way to remove all tables, views, functions, sequences, types, etc.
*/
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres; -- adjust role if needed
-- GRANT ALL ON SCHEMA public TO public;

/*
Option B (granular): Safe-ish iterative drop of common object types in the public schema.
This attempts to drop views, tables, sequences, functions and types with CASCADE.
*/
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop views
    FOR r IN (
        SELECT table_schema, table_name
        FROM information_schema.views
        WHERE table_schema = 'public'
    ) LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', r.table_schema, r.table_name);
    END LOOP;

    -- Drop materialized views
    FOR r IN (
        SELECT matviewname AS name
        FROM pg_matviews
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS public.%I CASCADE', r.name);
    END LOOP;

    -- Drop tables
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.tablename);
    END LOOP;

    -- Drop sequences
    FOR r IN (
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
    ) LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS public.%I CASCADE', r.sequence_name);
    END LOOP;

    -- Drop functions (by name; overloaded functions will be dropped via CASCADE)
    FOR r IN (
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_schema = 'public'
    ) LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I CASCADE', r.routine_name);
    END LOOP;

    -- Drop types
    FOR r IN (
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
          AND t.typtype IN ('c','e','d') -- composite, enum, domain
    ) LOOP
        EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', r.typname);
    END LOOP;

    -- Drop extensions if you want to remove them too (uncomment to enable)
    -- FOR r IN (SELECT extname FROM pg_extension) LOOP
    --     EXECUTE format('DROP EXTENSION IF EXISTS %I CASCADE', r.extname);
    -- END LOOP;
END
$$;

-- Final note: some objects (like roles, extensions, or objects in other schemas)
-- will not be removed by this script. Use Option A if you want a full public schema
-- reset. Always take a backup first:
--
-- Backup example (pg_dump):
-- pg_dump --format=custom --file=before_teardown.dump --dbname=$DATABASE_URL

-- To run this file with psql:
-- psql $DATABASE_URL -f supabase/drop_all_objects.sql
