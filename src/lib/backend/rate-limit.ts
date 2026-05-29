import { tooManyRequests } from './errors';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitBucket>();

function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, bucket] of store.entries()) {
    if (now > bucket.resetAt) {
      store.delete(key);
    }
  }
}

function scheduleCleanup(): void {
  // Clean up expired entries every 5 minutes
  setInterval(cleanupExpired, 5 * 60 * 1000);
}

// Initialize cleanup on module load (only once)
let cleanupScheduled = false;
if (!cleanupScheduled) {
  scheduleCleanup();
  cleanupScheduled = true;
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = store.get(key);

  // If no bucket or window expired, create new bucket
  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  // Check if limit exceeded
  if (bucket.count >= limit) {
    return false;
  }

  // Increment counter
  bucket.count += 1;
  return true;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): void {
  if (!rateLimit(key, limit, windowMs)) {
    throw tooManyRequests('Rate limit exceeded. Please try again later.');
  }
}

export const rateLimitPresets = {
  authRateLimit: (ip: string): boolean => rateLimit(`auth:${ip}`, 10, 15 * 60 * 1000), // 10 per 15 min
  signupRateLimit: (ip: string): boolean => rateLimit(`signup:${ip}`, 5, 15 * 60 * 1000), // 5 per 15 min
  forgotPasswordRateLimit: (ip: string): boolean => rateLimit(`forgot:${ip}`, 3, 15 * 60 * 1000), // 3 per 15 min
  uploadRateLimit: (userId: string): boolean => rateLimit(`upload:${userId}`, 20, 60 * 60 * 1000), // 20 per hour
  apiRateLimit: (ip: string): boolean => rateLimit(`api:${ip}`, 100, 60 * 1000), // 100 per minute
};

export function getStorageStats(): { size: number; keys: number } {
  return {
    size: store.size,
    keys: store.size,
  };
}

// Alias for API endpoints
export const enforceRateLimit = checkRateLimit;
