#!/bin/bash

# TAXMATE DEPLOYMENT TO VERCEL - QUICK START SCRIPT
# Run this script to prepare for Vercel deployment

echo "=========================================="
echo "TAXMATE VERCEL DEPLOYMENT PREPARATION"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo -e "${BLUE}1. Checking Node.js version...${NC}"
NODE_VERSION=$(node -v)
echo -e "   ${GREEN}✓${NC} Node version: $NODE_VERSION"
echo ""

# Check Git status
echo -e "${BLUE}2. Checking Git status...${NC}"
if git diff-index --quiet HEAD --; then
    echo -e "   ${GREEN}✓${NC} All changes committed"
else
    echo -e "   ${YELLOW}⚠${NC} Uncommitted changes detected"
    echo "   Run: git add . && git commit -m 'Your message'"
fi
echo ""

# Build locally
echo -e "${BLUE}3. Testing production build locally...${NC}"
echo "   Running: npm run build"
npm run build

if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✓${NC} Build successful!"
else
    echo -e "   ${YELLOW}✗${NC} Build failed - check errors above"
    exit 1
fi
echo ""

# Verify environment
echo -e "${BLUE}4. Checking environment variables...${NC}"
if [ -f ".env.local" ]; then
    echo -e "   ${GREEN}✓${NC} .env.local exists"
    # Check for required variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo -e "   ${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL found"
    else
        echo -e "   ${YELLOW}⚠${NC} NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} .env.local not found"
    echo "   Create: cp .env.local.example .env.local"
fi
echo ""

# Git information
echo -e "${BLUE}5. Git Repository Information${NC}"
REMOTE=$(git remote get-url origin)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT=$(git rev-parse --short HEAD)
echo -e "   Repository: $REMOTE"
echo -e "   Current Branch: ${GREEN}$BRANCH${NC}"
echo -e "   Latest Commit: $COMMIT"
echo ""

# Next steps
echo "=========================================="
echo -e "${GREEN}✓ READY FOR DEPLOYMENT!${NC}"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo -e "${BLUE}1. Go to: https://vercel.com/new${NC}"
echo "   - Import: abhinav28birajdar/TaxMate"
echo "   - Framework: Next.js"
echo "   - Click: Deploy"
echo ""
echo -e "${BLUE}2. In Vercel Dashboard, add Environment Variables:${NC}"
echo "   Settings → Environment Variables"
echo ""
echo "   REQUIRED (All environments):"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"  
echo "   - NEXT_PUBLIC_APP_URL"
echo "   - NODE_ENV=production"
echo ""
echo "   SECRET (Production & Preview only):"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - JWT_SECRET"
echo "   - RESEND_API_KEY"
echo ""
echo -e "${BLUE}3. Push code to master:${NC}"
echo "   git push origin master"
echo ""
echo -e "${BLUE}4. Vercel auto-deploys within 2-3 minutes${NC}"
echo ""
echo "For detailed guides, see:"
echo "  - VERCEL_DEPLOYMENT_GUIDE.md"
echo "  - ENV_CONFIGURATION_GUIDE.md"
echo "  - BUILD_RESOLUTION_SUMMARY.md"
echo ""
