import { HttpError } from './errors';

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
] as const;

export function getEnv(key: (typeof requiredVars)[number]) {
  const value = process.env[key];
  if (!value) {
    throw new HttpError(`Missing environment variable: ${key}`, 500, 'ENV_MISSING');
  }
  return value;
}

export function validateBackendEnv() {
  requiredVars.forEach((key) => {
    if (!process.env[key]) {
      throw new HttpError(`Missing environment variable: ${key}`, 500, 'ENV_MISSING');
    }
  });
}
