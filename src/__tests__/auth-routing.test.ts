import { normalizeRole, getDashboardPathForRole, PUBLIC_ROUTES } from '@/lib/auth-routing';

describe('Auth Routing & Role Normalization', () => {
  it('correctly normalizes user roles from metadata', () => {
    expect(normalizeRole('ca')).toBe('CA');
    expect(normalizeRole('client')).toBe('CLIENT');
    expect(normalizeRole('staff')).toBe('STAFF');
    expect(normalizeRole('super_admin')).toBe('SUPER_ADMIN');
    expect(normalizeRole('admin')).toBe('SUPER_ADMIN');
    expect(normalizeRole('firm_admin')).toBe('SUPER_ADMIN');
    expect(normalizeRole(null)).toBeNull();
    expect(normalizeRole(undefined)).toBeNull();
    expect(normalizeRole('unknown_role')).toBeNull();
  });

  it('routes roles to their appropriate dashboard paths', () => {
    expect(getDashboardPathForRole('CA')).toBe('/ca/dashboard');
    expect(getDashboardPathForRole('STAFF')).toBe('/ca/dashboard');
    expect(getDashboardPathForRole('SUPER_ADMIN')).toBe('/admin/dashboard');
    expect(getDashboardPathForRole('CLIENT')).toBe('/portal/dashboard');
    expect(getDashboardPathForRole(null)).toBe('/portal/dashboard');
  });

  it('defines required public routes for unauthenticated users', () => {
    expect(PUBLIC_ROUTES).toContain('/');
    expect(PUBLIC_ROUTES).toContain('/login');
    expect(PUBLIC_ROUTES).toContain('/register');
    expect(PUBLIC_ROUTES).toContain('/forgot-password');
  });
});
