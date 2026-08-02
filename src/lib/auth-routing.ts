export type AppRole = 'SUPER_ADMIN' | 'CA' | 'CLIENT' | 'STAFF' | null;

const ROLE_DASHBOARD_MAP: Record<Exclude<AppRole, null>, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  CA: '/ca/dashboard',
  CLIENT: '/client/dashboard',
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

export const PUBLIC_ROUTES = [
  '/',
  '/landing',
  '/about',
  '/contact',
  '/demo',
  '/faq',
  '/help',
  '/maintenance',
  '/pricing',
  '/privacy-policy',
  '/refund-policy',
  '/talk-sales',
  '/terms-of-service',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/callback',
  '/auth/auth-code-error',
  '/auth/onboarding',
];