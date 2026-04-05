import { HttpError } from './errors';

export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export function ensureRole(role: string, allowed: string[]) {
  if (!allowed.includes(role)) {
    throw new HttpError('Forbidden', 403, 'FORBIDDEN');
  }
}
