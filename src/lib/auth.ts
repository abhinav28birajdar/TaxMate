/**
 * UNIFIED AUTH SYSTEM - Supabase based (Single Source of Truth)
 * All authentication is handled through Supabase
 * 
 * DO NOT MIX WITH NextAuth - Use this exclusively
 * Updated: 2026-04-08
 */

export {
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
  signUp,
  signIn,
  signOut,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  enableTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
  verify2FAToken,
} from './auth-service';
