export type AppRole = 'SUPER_ADMIN' | 'CA' | 'CLIENT' | 'STAFF' | null;

const ROLE_DASHBOARD_MAP: Record<Exclude<AppRole, null>, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  CA: '/ca/dashboard',
  CLIENT: '/portal/dashboard',
  STAFF: '/ca/dashboard',
};

export function normalizeRole(role?: string | null): AppRole {
  if (!role) return null;

  const value = role.trim().toUpperCase();

  if (value === 'CLIENT' || value === 'CA' || value === 'STAFF' || value === 'SUPER_ADMIN') {
    return value;
  }

  if (value === 'ADMIN' || value === 'FIRM_ADMIN') {
    return 'SUPER_ADMIN';
  }

  return null;
}

export function getDashboardPathForRole(role?: string | null): string {
  const normalized = normalizeRole(role) ?? 'CLIENT';
  return ROLE_DASHBOARD_MAP[normalized];
}

export function getAuthRedirectForRole(role?: string | null): string {
  return getDashboardPathForRole(role);
}

export const CA_PRACTICE_SUBPATHS = [
  'dashboard', 'clients', 'tasks', 'documents', 'compliance', 'invoices',
  'chat', 'calls', 'analytics', 'appointments', 'settings', 'profile',
  'accounting', 'availability', 'calendar', 'cases', 'crm', 'document-requests',
  'edit-profile', 'gst', 'income-tax', 'meetings', 'messages', 'notifications',
  'onboarding', 'payments', 'projects', 'proposals', 'reports', 'reviews',
  'services', 'support', 'tax-calculator', 'wallet', 'bookmarks', 'ai-assistant',
];

export const LEGACY_CA_ROUTES = [
  '/dashboard',
  '/clients',
  '/tasks',
  '/documents',
  '/compliance',
  '/invoices',
  '/messages',
  '/appointments',
  '/analytics',
  '/expenses',
  '/time',
  '/profile',
  '/settings',
];

export function isCaPracticeOsPath(pathname: string): boolean {
  if (!pathname.startsWith('/ca/')) return false;
  const sub = pathname.slice(4).split('/')[0];
  return CA_PRACTICE_SUBPATHS.includes(sub);
}

export function isLegacyCaPath(pathname: string): boolean {
  if (!pathname) return false;
  return LEGACY_CA_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isCaProtectedPath(pathname: string): boolean {
  return isCaPracticeOsPath(pathname) || isLegacyCaPath(pathname);
}

export const PUBLIC_ROUTES = [
  '/',
  '/landing',
  '/about',
  '/services',
  '/tax-services',
  '/ca-services',
  '/pricing',
  '/how-it-works',
  '/features',
  '/find-ca',
  '/find-ca/directory',
  '/testimonials',
  '/faq',
  '/contact',
  '/blog',
  '/resources',
  '/tax-resources',
  '/tax-calculator',
  '/tax-calendar',
  '/careers',
  '/terms',
  '/terms-of-service',
  '/privacy-policy',
  '/cookie-policy',
  '/refund-policy',
  '/talk-sales',
  '/demo',
  '/help',
  '/maintenance',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-otp',
  '/verify-phone',
  '/create-password',
  '/accept-terms',
  '/choose-role',
  '/auth/callback',
  '/auth/auth-code-error',
  '/auth/onboarding',
  '/portal/login',
  '/admin/login',
  '/system',
];

export function isPublicPath(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname.startsWith('/ca/') && !isCaPracticeOsPath(pathname)) {
    return true; // Public CA directory profile: /ca/[username]
  }
  return PUBLIC_ROUTES.some((route) =>
    route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`)
  );
}
