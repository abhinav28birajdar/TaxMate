# TaxMate

Production-grade SaaS backend architecture for identity, RBAC, onboarding, notifications, analytics, support operations, and secure file metadata handling.

## Project Overview

This revision introduces a unified backend architecture under src/app/api/v1 and src/lib/backend, with a single authoritative SQL schema at supabase/production_schema.sql.

The system now provides:

- Hardened authentication with account lockout and session tracking
- Role-based access control through roles, permissions, and user-role mappings
- Enhanced profile, onboarding, settings, notification, support, and audit capabilities
- Standardized API response envelopes and centralized error handling
- Database-level protections through constraints, indexes, triggers, and RLS

## Features

### Core

- Signup, login, logout, forgot password, reset password, change password
- JWT access token + multi-device session tracking
- Account lock after repeated failed login attempts
- Role management and permission mappings
- Profile management with social links and public/private toggle
- Smart multi-step onboarding
- Notification history with read/unread state
- User activity and audit logging
- File upload metadata and signed URL access pattern
- Support ticket lifecycle for users and admins
- User settings for theme, preferences, and notification settings
- Feature flags for controlled rollouts

### Security and Reliability

- Strict response envelope with no raw server error exposure
- Input validation with Zod
- Basic per-IP rate limiting for auth-sensitive endpoints
- RLS policies across user-owned and admin-managed data
- Audit trigger support for sensitive table changes

## Tech Stack

- Next.js App Router API routes
- TypeScript
- Supabase Postgres + RLS + Realtime + Storage
- jose for JWT signing/verification
- bcryptjs for password hashing
- Zod for runtime request validation

## Architecture Overview

### Backend layers

- API Layer: src/app/api/v1/*
- Application Core: src/lib/backend/*
- Database: supabase/production_schema.sql

### Core backend modules

- src/lib/backend/response.ts: standardized success/error responses
- src/lib/backend/errors.ts: typed HTTP error model
- src/lib/backend/env.ts: backend env validation
- src/lib/backend/rate-limit.ts: in-memory rate limiter
- src/lib/backend/jwt.ts: access token signing and verification
- src/lib/backend/supabase.ts: service-role data client and auth guard
- src/lib/backend/auth-service.ts: signup/login/session/password workflows
- src/lib/backend/rbac.ts: role checks
- src/lib/backend/audit.ts: activity and audit writes
- src/lib/backend/validation.ts: request schemas

## Database Design Summary

Single schema file: supabase/production_schema.sql

### Core tables

- users
- profiles
- roles
- permissions
- user_roles
- sessions
- activity_logs
- notifications
- onboarding_data

### Advanced tables

- audit_logs
- user_settings
- file_uploads
- support_tickets
- system_logs
- feature_flags

### Database guarantees

- Primary keys and foreign keys on all related entities
- Unique constraints for identity and lookup keys
- Performance indexes for auth, feed, and support workloads
- Updated-at triggers
- RBAC helper functions
- Sensitive-change audit triggers
- Row-level security policies
- Soft-delete fields for lifecycle-safe deletion

## Setup Instructions

1. Install dependencies

npm install

2. Prepare environment

Copy .env.example to .env.local and fill all required variables.

3. Apply database schema

Execute supabase/production_schema.sql in your Supabase SQL editor.

4. Create storage bucket

Create uploads bucket in Supabase Storage.

5. Start the app

npm run dev

## Environment Variables

Required backend runtime variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET
- BCRYPT_SALT_ROUNDS
- NEXT_PUBLIC_APP_URL

Recommended additional variables:

- RESEND_API_KEY
- NEXTAUTH_SECRET
- SENTRY_DSN
- REDIS_URL

## API Endpoints

### Auth

- POST /api/v1/auth/signup
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- POST /api/v1/auth/change-password
- GET /api/v1/auth/sessions
- DELETE /api/v1/auth/sessions

### User domain

- GET /api/v1/profile
- PATCH /api/v1/profile
- GET /api/v1/onboarding
- PUT /api/v1/onboarding
- GET /api/v1/notifications
- POST /api/v1/notifications
- PATCH /api/v1/notifications
- GET /api/v1/settings
- PUT /api/v1/settings
- POST /api/v1/files/upload
- GET /api/v1/support-tickets
- POST /api/v1/support-tickets
- PATCH /api/v1/support-tickets

### Admin and analytics

- GET /api/v1/admin/users
- PATCH /api/v1/admin/users
- GET /api/v1/admin/feature-flags
- POST /api/v1/admin/feature-flags
- GET /api/v1/activity

### Response format

All v1 APIs return:

{
   "success": true,
   "message": "...",
   "data": {}
}

or

{
   "success": false,
   "message": "...",
   "error": {
      "code": "...",
      "details": {}
   }
}

## Folder Structure

- src/app/api/v1/auth: authentication and session management
- src/app/api/v1/profile: profile read/update
- src/app/api/v1/onboarding: onboarding state management
- src/app/api/v1/notifications: notification feed and mutation
- src/app/api/v1/settings: user preferences and settings
- src/app/api/v1/files/upload: secure file uploads metadata flow
- src/app/api/v1/support-tickets: support workflow
- src/app/api/v1/admin: admin-only management endpoints
- src/app/api/v1/activity: admin analytics reads
- src/lib/backend: shared backend platform code
- supabase/production_schema.sql: only active DB schema source
- supabase/archive: archived legacy SQL assets

## Security Practices

- Passwords stored as bcrypt hashes
- JWT with short-lived access token
- Session revocation and multi-device tracking
- Account lockout after repeated failures
- Strict authorization checks on privileged APIs
- RLS policies at database layer
- Audit trail for sensitive operations
- Structured error responses without raw stack traces

## Testing and Reliability Checklist

- Validate signup/login/logout flows
- Verify session listing and revocation
- Confirm password reset and change-password paths
- Test profile and onboarding updates
- Validate notification read/unread transitions
- Test support ticket create/respond workflows
- Verify admin role restrictions
- Verify SQL schema executes cleanly in a fresh database

## Future Enhancements

- Refresh-token rotation and token binding
- Dedicated email service integration for verification/reset
- Redis-backed distributed rate limiting
- Queue-backed asynchronous audit and notification fanout
- OpenAPI spec generation for endpoint contracts
- Integration tests for all v1 endpoints
