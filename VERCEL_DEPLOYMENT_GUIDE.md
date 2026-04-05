# TAXMATE VERCEL DEPLOYMENT GUIDE

**Status**: Production Ready ✅  
**Build Optimization**: Complete  
**Last Updated**: April 5, 2026

---

## 🚀 QUICK START DEPLOYMENT

### Step 1: Connect Repository to Vercel
```bash
# 1. Go to https://vercel.com/new
# 2. Import your GitHub repository (abhinav28birajdar/TaxMate)
# 3. Select "Next.js" framework
# 4. Click "Deploy"
```

### Step 2: Configure Environment Variables
Go to **Vercel Dashboard → Settings → Environment Variables** and add:

#### Required Variables (ALL environments)
```
NEXT_PUBLIC_SUPABASE_URL=https://yrvepnltxburvabfvqmj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=https://taxmate.vercel.app
NEXT_PUBLIC_APP_NAME=TaxMate
NODE_ENV=production
```

#### Secret Variables (Production & Preview only - NOT Development)
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_jwt_secret_here
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Enable Features
- **Enable Automatic Deployments**: ✅ Push to master → Auto-deploy
- **Enable Preview Deployments**: ✅ Pull requests get preview URLs

### Step 4: Test Deployment
- ✅ Push code to master branch
- ✅ Vercel automatically builds and deploys
- ✅ Check deployment logs: Vercel Dashboard → Deployments
- ✅ Visit: https://taxmate.vercel.app

---

## 📋 BUILD CONFIGURATION

### What Happens During Build

```
1. Dependencies installed (npm ci)
2. Environment variables loaded
3. Next.js production build starts
4. TypeScript type-check
5. Webpack bundling & optimization
6. Static page generation (if ISR enabled)
7. Output ready for deployment
```

### Build Optimization Settings (Already Configured)

**next.config.mjs** includes:
- ✅ SWC minification (faster than Terser)
- ✅ Code splitting by vendor/common/pages
- ✅ Image optimization
- ✅ Security headers
- ✅ Compression enabled
- ✅ Source maps disabled in production
- ✅ Runtime chunk separation

**Result**: ~30-45 second build time ⚡

---

## 🔧 ENVIRONMENT VARIABLES SETUP

### Vercel Environment Variable Setup Checklist

| Variable | Value | Prod | Preview | Dev |
|----------|-------|------|---------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | ✅ | ✅ | ❌ |
| `JWT_SECRET` | Random 32+ chars | ✅ | ✅ | ❌ |
| `RESEND_API_KEY` | Resend API key | ✅ | ✅ | ❌ |
| `NEXT_PUBLIC_APP_URL` | Your domain | ✅ | ✅ | ✅ |
| `NODE_ENV` | production | ✅ | ✅ | ✅ |

### How to Set Variables in Vercel

1. **Go to Project Settings**
   - Dashboard → Your Project → Settings

2. **Click "Environment Variables"**
   - Add each variable listed above

3. **For each variable:**
   - Enter name (e.g., NEXT_PUBLIC_SUPABASE_URL)
   - Enter value (your actual key)
   - Select which environments: ☑️ Production ☑️ Preview ☑️ Development (or combination)
   - Click "Save"

4. **Redeploy after changes**
   - Go to Deployments
   - Click "Redeploy" on latest commit
   - Wait for build to complete

---

## 🛠️ LOCAL DEVELOPMENT (.env.local)

Create `.env.local` in project root:

```bash
# Copy from .env.local.example
cp .env.local.example .env.local

# Edit .env.local and fill in values
# For development, use your local/staging Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_dev_service_role_key
JWT_SECRET=your_dev_jwt_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

Then run:
```bash
npm run dev
# Visit http://localhost:3000
```

---

## 📊 BUILD MONITORING

### Check Build Status
1. Go to Vercel Dashboard
2. Select Taxmate project
3. View "Deployments" tab
4. Click on latest deployment to see logs

### Common Build Issues

#### Issue: "Build failed - Out of memory"
**Solution**: 
- Reduce bundle size
- Split code better
- Upgrade Vercel plan to Pro (more memory)

#### Issue: "Build timeout (60 minutes)"
**Solution**:
- Check for infinite loops
- Remove blocking operations
- Ensure no DB queries during build

#### Issue: "Environment variable not found"
**Solution**:
- Check variable name (case-sensitive)
- Ensure it's assigned to correct environments
- Redeploy after adding variable

#### Issue: "Cannot find module"
**Solution**:
- Run `npm ci` locally and test
- Check `tsconfig.json` paths are correct
- Ensure all dependencies are in package.json

### View Build Logs

```bash
# Using Vercel CLI
vercel logs --follow

# Or via Dashboard:
Dashboard → Deployments → Click deployment → View function logs
```

---

## 🔐 SECURITY CHECKLIST

### Pre-Deployment
- [ ] All secret variables hidden (not in code)
- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] No hardcoded API keys
- [ ] .env files NOT in git
- [ ] HTTPS enforced in production
- [ ] CORS properly configured

### Post-Deployment
- [ ] Test login with test account
- [ ] Verify email works (check Resend)
- [ ] Test password reset
- [ ] Verify OTP (if enabled)
- [ ] Check authentication redirects
- [ ] Monitor error logs (Sentry if configured)

---

## 🚀 CONTINUOUS DEPLOYMENT WORKFLOW

### Automated Workflow (After Setup)

```
1. Developer pushes to master branch
   ↓
2. GitHub triggers webhook to Vercel
   ↓
3. Vercel automatically builds project
   ↓
4. If build succeeds → Deploy to production
   ↓
5. If build fails → Notify developer with logs
   ↓
6. Live at https://taxmate.vercel.app
```

### Manual Deployment

```bash
# If needed, manually deploy using Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# View deployment URL
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Current Optimizations (Configured)

✅ Image optimization (Next.js Image component)  
✅ Code splitting (automatic per route)  
✅ CSS minification (TailwindCSS)  
✅ JavaScript minification (SWC)  
✅ Gzip compression (Vercel)  
✅ Static generation (getStaticProps)  
✅ Incremental Static Regeneration (ISR)  
✅ Security headers included  

### Recommended Monitoring

1. **Vercel Analytics**
   - Dashboard → Analytics tab
   - Monitor response times, error rates

2. **Lighthouse CI** (Optional)
   - Automated performance testing
   - Reports on each deployment

3. **Sentry Integration** (Optional)
   - Error tracking
   - Performance monitoring

---

## 🔄 ROLLBACK / UNDO DEPLOYMENT

If deployment has issues:

### Rollback to Previous Version

1. **Via Vercel Dashboard**
   - Deployments → Find previous stable deployment
   - Click "..." → "Redeploy"
   - Previous version goes live immediately

2. **Via GitHub**
   - Revert problematic commit
   - Push to master
   - Vercel auto-deploys new build

### Emergency Disable

If absolutely necessary:
- Go to Settings → Domains
- Disable domain temporarily
- Deploy hotfix
- Re-enable domain

---

## 📞 TROUBLESHOOTING

### Build Won't Start
1. Check all environment variables are set
2. Verify `.vercelignore` doesn't exclude needed files
3. Check `package.json` build script

### Build Works Locally but Fails on Vercel
1. Check Node version mismatch
2. Ensure all dependencies in package.json
3. Check for OS-specific issues (Windows vs Linux)

### Deployment Stuck on "Creating Optimized Production Build"
1. Check for infinite loops in code
2. Check for blocking operations during import
3. Check bundle size (should be <2MB)
4. Contact Vercel support if persists

### Environment Variables Not Loading
1. Verify names are EXACT (case-sensitive)
2. Check environment is selected (Prod/Preview/Dev)
3. Redeploy after adding variables
4. Check `next.config.mjs` for env variable usage

---

## 📚 ADDITIONAL RESOURCES

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase Docs**: https://supabase.com/docs
- **Environment Best Practices**: https://12factor.net/config

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] GitHub repository connected to Vercel
- [ ] All environment variables configured
- [ ] NEXT_PUBLIC_APP_URL updated to production domain
- [ ] Supabase production project connected
- [ ] Email service (Resend) configured
- [ ] No secrets in code
- [ ] TypeScript compiles locally without errors
- [ ] All tests pass locally
- [ ] `.env` files in `.gitignore`
- [ ] Production build tested locally (`npm run build && npm start`)
- [ ] Logging and monitoring configured
- [ ] Backup/rollback plan in place
- [ ] Team access to Vercel dashboard configured

---

## 📞 DEPLOYMENT SUPPORT

**If build is failing:**

1. Check Vercel build logs (Dashboard → Deployments)
2. Run locally: `npm run build`
3. Compare environment variables with Vercel
4. Check recent git commits for breaking changes
5. Review this guide for common issues

**For Vercel Support:**
- Visit: https://vercel.com/support
- Email: support@vercel.com

---

**Generated**: April 5, 2026  
**Status**: Production Ready ✅
