import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL').optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key required').optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key required').optional(),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof envSchema>;

let validated: Env | null = null;

export function getEnv(): Env {
  if (validated) {
    return validated;
  }

  const getVal = (val: string | undefined, fallback: string) => {
    if (!val || val.trim() === '') return fallback;
    return val;
  };

  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: getVal(process.env.NEXT_PUBLIC_SUPABASE_URL, ''),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: getVal(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, ''),
    SUPABASE_SERVICE_ROLE_KEY: getVal(process.env.SUPABASE_SERVICE_ROLE_KEY, ''),
    JWT_SECRET: getVal(process.env.JWT_SECRET, ''),
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,
    NEXT_PUBLIC_APP_URL: getVal(process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'),
    NODE_ENV: process.env.NODE_ENV,
  };

  const result = envSchema.safeParse(envVars);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    console.warn(`Environment validation warning: ${errors}`);
  }

  validated = result.data || ({} as Env);
  return validated;
}

export const env = getEnv();
