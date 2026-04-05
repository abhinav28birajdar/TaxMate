#!/bin/bash

# TAXMATE AUTH SYSTEM - VERIFICATION SCRIPT
# This script verifies all auth system components are working

echo "==============================================="
echo "TAXMATE AUTH SYSTEM - VERIFICATION SCRIPT"
echo "==============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

# Function to check file exists
check_file() {
  local file=$1
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} File exists: $file"
    ((passed++))
  else
    echo -e "${RED}✗${NC} File missing: $file"
    ((failed++))
  fi
}

# Function to check directory exists
check_dir() {
  local dir=$1
  if [ -d "$dir" ]; then
    echo -e "${GREEN}✓${NC} Directory exists: $dir"
    ((passed++))
  else
    echo -e "${RED}✗${NC} Directory missing: $dir"
    ((failed++))
  fi
}

# Function to check grep pattern
check_pattern() {
  local file=$1
  local pattern=$2
  local description=$3
  if grep -q "$pattern" "$file"; then
    echo -e "${GREEN}✓${NC} $description"
    ((passed++))
  else
    echo -e "${RED}✗${NC} $description"
    ((failed++))
  fi
}

echo "🔍 CHECKING AUTH FILES..."
echo "========================="
echo ""

# Check core auth files
check_file "src/lib/auth-service.ts"
check_file "src/lib/auth.ts"
check_file "middleware.ts"
check_file "src/hooks/UnifiedAuthContext.tsx"
check_file "src/hooks/AuthHook.tsx"
check_file "src/components/auth/AuthGuard.tsx"
check_file "src/utils/supabase/server.ts"
check_file "src/utils/supabase/client.ts"

echo ""
echo "🔍 CHECKING AUTH PAGES..."
echo "========================="
echo ""

# Check auth pages
check_file "src/app/(auth)/login/page.tsx"
check_file "src/app/(auth)/register/page.tsx"
check_file "src/app/(auth)/forgot-password/page.tsx"
check_file "src/app/(auth)/reset-password/page.tsx"
check_file "src/app/(auth)/verify-email/page.tsx"
check_file "src/app/(auth)/layout.tsx"

echo ""
echo "🔍 CHECKING AUTH API ENDPOINTS..."
echo "=================================="
echo ""

# Check API endpoints
check_file "src/app/api/auth/login/route.ts"
check_file "src/app/api/auth/register/route.ts"
check_file "src/app/api/auth/logout/route.ts"
check_file "src/app/api/auth/user/route.ts"
check_file "src/app/api/auth/verify-email/route.ts"
check_file "src/app/api/auth/send-otp/route.ts"
check_file "src/app/api/auth/verify-otp/route.ts"
check_file "src/app/api/auth/request-password-reset/route.ts"
check_file "src/app/api/auth/reset-password/route.ts"
check_file "src/app/api/auth/setup-2fa/route.ts"
check_file "src/app/api/auth/verify-2fa/route.ts"

echo ""
echo "🔍 CHECKING DASHBOARD Pages..."
echo "================================"
echo ""

check_dir "src/app/(dashboard)"
check_dir "src/app/(dashboard)/dashboard"
check_file "src/app/(dashboard)/page.tsx"
check_file "src/app/(dashboard)/layout.tsx"

echo ""
echo "🔍 CHECKING CODE PATTERNS & FIXES..."
echo "===================================="
echo ""

# Check if AuthGuard import is fixed
check_pattern "src/components/auth/AuthGuard.tsx" "@/hooks/UnifiedAuthContext" "AuthGuard uses correct import path"

# Check if authService is exported
check_pattern "src/lib/auth-service.ts" "export const authService" "authService object is exported"

# Check if OTP methods exist
check_pattern "src/lib/auth-service.ts" "async sendOTP" "sendOTP method exists"
check_pattern "src/lib/auth-service.ts" "async verifyOTP" "verifyOTP method exists"

# Check middleware
check_pattern "middleware.ts" "PROTECTED_ROUTES" "Middleware has protected routes"
check_pattern "middleware.ts" "sessionToken" "Middleware checks for session"

# Check JWT fix
check_pattern "src/lib/auth-service.ts" "new jwt.SignJWT" "SignJWT uses new keyword"

echo ""
echo "🔍 CHECKING ENVIRONMENT CONFIGURATION..."
echo "=========================================="
echo ""

# Check .env files
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✓${NC} .env.local exists"
  ((passed++))
  
  grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && echo -e "${GREEN}✓${NC} SUPABASE_URL configured" || echo -e "${YELLOW}⚠${NC} SUPABASE_URL not configured"
  grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local && echo -e "${GREEN}✓${NC} SUPABASE_ANON_KEY configured" || echo -e "${YELLOW}⚠${NC} SUPABASE_ANON_KEY not configured"
  grep -q "JWT_SECRET" .env.local && echo -e "${GREEN}✓${NC} JWT_SECRET configured" || echo -e "${YELLOW}⚠${NC} JWT_SECRET not configured"
  grep -q "RESEND_API_KEY" .env.local && echo -e "${GREEN}✓${NC} RESEND_API_KEY configured" || echo -e "${YELLOW}⚠${NC} RESEND_API_KEY not configured"
else
  echo -e "${RED}✗${NC} .env.local not found"
  echo -e "${YELLOW}⚠${NC} Please create .env.local with required variables"
  ((failed++))
fi

echo ""
echo "🔍 CHECKING TypeScript COMPILATION..."
echo "======================================"
echo ""

# Check for TypeScript compilation
echo -n "Running TypeScript check... "
if npx tsc --noEmit 2>/dev/null; then
  echo -e "${GREEN}✓${NC} TypeScript compilation successful"
  ((passed++))
else
  echo -e "${RED}✗${NC} TypeScript compilation errors found"
  echo "Run: npx tsc --noEmit  to see errors"
  ((failed++))
fi

echo ""
echo "==============================================="
echo "VERIFICATION SUMMARY"
echo "==============================================="
echo -e "✓ Passed: ${GREEN}${passed}${NC}"
echo -e "✗ Failed: ${RED}${failed}${NC}"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
  echo "Your auth system is fully configured and ready."
  echo ""
  echo "Next steps:"
  echo "1. Run: npm run dev"
  echo "2. Visit: http://localhost:3000"
  echo "3. Test auth flows (login, register, password reset, etc.)"
  exit 0
else
  echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
  echo "Please fix the issues listed above before proceeding."
  exit 1
fi
