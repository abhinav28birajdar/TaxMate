/**
 * UNIFIED AUTH SYSTEM - Supabase based (Single Source of Truth)
 * Exports core hashing and JWT verification helpers.
 */

export {
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
  verify2FAToken,
} from './auth-service';
