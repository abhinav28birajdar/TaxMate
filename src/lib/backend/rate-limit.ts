import { HttpError } from './errors';

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function enforceRateLimit(key: string, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= max) {
    throw new HttpError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
  }

  bucket.count += 1;
}
