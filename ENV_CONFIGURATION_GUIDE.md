# TAXMATE ENVIRONMENT CONFIGURATION GUIDE

## Overview
This guide helps you set up all required environment variables for the Taxmate application to work properly with the complete auth system.

---

## Environment Files

### Development (`.env.local`)
Create this file in the root directory for local development.

### Production (`.env.production`)
Create this file in the root directory for production deployment.

---

## Required Environment Variables

### 1. Supabase Configuration
```bash
# Supabase Project URL
# Format: https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (public, safe to expose)
# Get from: Supabase Dashboard → Settings → API Keys → Anon Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (SECRET - never expose)
# Get from: Supabase Dashboard → Settings → API Keys → Service Role
# Only use in .env.local (development) or backend environment variables
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Database Configuration
```bash
# PostgreSQL Connection String
# Format: postgresql://user:password@host:5432/database_name
DATABASE_URL=postgresql://user:password@localhost:5432/taxmate

# Direct Database Connection (for migrations)
# Same as DATABASE_URL but with pooling disabled
DIRECT_URL=postgresql://user:password@localhost:5432/taxmate
```

### 3. JWT Configuration
```bash
# Secret key for JWT signing
# Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-generate-strong-random-string-min-32-chars

# JWT Expiration
# Default: 7d (7 days)
# Options: 1d, 7d, 30d, 90d, 1y
JWT_EXPIRY=7d
```

### 4. Email Service Configuration (Resend)
```bash
# Resend API Key (for sending transactional emails)
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email sender address
# Format: Name <email@domain.com>
RESEND_FROM_EMAIL=Taxmate <noreply@taxmate.in>
```

### 5. Node Environment
```bash
# Development, Production, or Testing
NODE_ENV=development
```

### 6. Application URLs
```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://taxmate.com

# API Base URL (optional, if different from app)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 7. Optional: Social OAuth (Supabase configured)
```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft/Azure AD
NEXT_PUBLIC_AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 8. Optional: Monitoring & Analytics
```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/projectid

# Google Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Posthog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxx
```

### 9. Optional: Rate Limiting & Security
```bash
# Redis (optional, for rate limiting)
REDIS_URL=redis://localhost:6379

# CORS Domain
NEXT_PUBLIC_CORS_ORIGIN=http://localhost:3000

# API Rate Limit (requests per minute)
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

---

## Complete .env.local Template

```bash
# ==========================================
# SUPABASE CONFIGURATION
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==========================================
# DATABASE CONFIGURATION
# ==========================================
DATABASE_URL=postgresql://user:password@localhost:5432/taxmate
DIRECT_URL=postgresql://user:password@localhost:5432/taxmate

# ==========================================
# JWT CONFIGURATION
# ==========================================
JWT_SECRET=your-super-secret-jwt-key-generate-strong-random-string
JWT_EXPIRY=7d

# ==========================================
# EMAIL SERVICE (RESEND)
# ==========================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Taxmate <noreply@taxmate.in>

# ==========================================
# APPLICATION CONFIGURATION
# ==========================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_CORS_ORIGIN=http://localhost:3000

# ==========================================
# OPTIONAL: SOCIAL OAUTH
# ==========================================
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# ==========================================
# OPTIONAL: MONITORING
# ==========================================
# NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/projectid
# NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## How to Generate Required Values

### JWT_SECRET
Generate a strong random string:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Supabase Keys
1. Go to [Supabase Dashboard](https://supabase.com/)
2. Select your project
3. Navigate to: Settings → API
4. Copy the required keys:
   - **NEXT_PUBLIC_SUPABASE_URL**: Project URL
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Anon Key
   - **SUPABASE_SERVICE_ROLE_KEY**: Service Role Key

### Resend API Key
1. Go to [Resend Console](https://resend.com/)
2. Navigate to: API Keys
3. Create a new API key
4. Copy the key (starts with `re_`)

### Database Connection String
```bash
# PostgreSQL format:
postgresql://[user]:[password]@[host]:[port]/[database]

# Example:
postgresql://taxmate_user:p@ssw0rd@localhost:5432/taxmate

# With SSL (production):
postgresql://taxmate_user:p@ssw0rd@host:5432/taxmate?sslmode=require
```

---

## Setup Instructions

### Step 1: Create .env.local
```bash
cp .env.template .env.local
# Edit .env.local and fill in all required values
```

### Step 2: Create .env.production (for deployment)
```bash
cp .env.template .env.production
# Edit .env.production with production values
```

### Step 3: Verify Configuration
```bash
# Run the verification script
bash verify-auth-system.sh

# Or manually verify TypeScript
npx tsc --noEmit
```

### Step 4: Start Development Server
```bash
npm run dev
# Visit http://localhost:3000
```

---

## Security Best Practices

### ✅ DO:
- [x] Keep SECRET keys (.env.local) out of git
- [x] Use strong, random JWT_SECRET (min 32 characters)
- [x] Set NEXT_PUBLIC_* only for non-sensitive values
- [x] Rotate secrets regularly
- [x] Use environment-specific values
- [x] Enable HTTPS in production
- [x] Validate all environment variables on startup
- [x] Use Supabase Service Role Key only on backend

### ❌ DON'T:
- [ ] Commit .env files to git
- [ ] Use weak or predictable secret keys
- [ ] Expose SUPABASE_SERVICE_ROLE_KEY in frontend code
- [ ] Use same secrets across environments
- [ ] Hardcode secrets in code
- [ ] Log sensitive values
- [ ] Use HTTP in production
- [ ] Ignore environment validation

---

## Git Configuration

### .gitignore
Ensure these files are ignored:

```bash
# Environment files
.env
.env.local
.env.production
.env.*.local

# Dependencies
node_modules/
.yarn/

# Build output
.next/
dist/
build/

# Logs
logs/
*.log

# OS files
.DS_Store
.vscode/
*.swp
*.swo
```

---

## Deployment Checklist

### Before Deployment:
- [ ] All environment variables are configured
- [ ] Database migrations are complete
- [ ] Supabase auth is enabled and configured
- [ ] Email provider (Resend) is set up
- [ ] JWT_SECRET is changed to a new value
- [ ] NODE_ENV=production is set
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (optional)
- [ ] Monitoring is configured (optional)

### Environment-Specific Notes:

#### Development
- Use `localhost:3000`
- Can use local database
- Debug mode enabled
- Verbose logging

#### Staging
- Use staging domain
- Use staging Supabase project
- Rate limiting enabled
- Error monitoring enabled

#### Production
- Use production domain
- Use production Supabase project
- HTTPS required
- Rate limiting enforced
- Monitoring & logging critical

---

## Troubleshooting

### Issue: "Supabase credentials are not configured"
**Solution**: Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local

### Issue: "Database connection refused"
**Solution**: Verify DATABASE_URL is correct and PostgreSQL is running

### Issue: "JWT_SECRET not found"
**Solution**: Generate and add JWT_SECRET to .env.local

### Issue: "Resend API key invalid"
**Solution**: Verify RESEND_API_KEY starts with `re_` and is from resend.com

### Issue: "Environment variables not loading"
**Solution**: Restart dev server after changing .env.local

---

## Testing Environment Variables

### Verify Variables are Loaded
```bash
# Create a test script (test-env.js)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('JWT Secret:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('Database URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');

# Run with Node
node test-env.js
```

### Test in Next.js
```typescript
// src/app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    jwtConfigured: !!process.env.JWT_SECRET,
    databaseConfigured: !!process.env.DATABASE_URL,
  });
}
```

---

## Support

For issues with environment configuration:
1. Check this guide first
2. Review the AUTH_SYSTEM_COMPLETE.md document
3. Check Supabase documentation
4. Review Resend email documentation
5. Check Next.js environment variables guide

---

**Last Updated**: April 5, 2026  
**Status**: Production Ready ✅
