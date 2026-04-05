// Middleware and authentication helpers
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

// Get auth token from cookies
export async function getAuthToken() {
  const cookieStore = await cookies()
  return cookieStore.get('auth-token')?.value
}

// Verify JWT token
export async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload
  } catch (error) {
    return null
  }
}

// Middleware to check authentication
export async function checkAuth() {
  const token = await getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const payload = await verifyAuth(token)
  if (!payload) throw new Error('Invalid token')

  return payload
}

// Extract user from request
export function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  return token
}

// Extract headers from request
export function extractHeadersFromRequest(request: Request) {
  return {
    userId: request.headers.get('x-user-id'),
    caId: request.headers.get('x-ca-id'),
    clientId: request.headers.get('x-client-id'),
  }
}

// CORS Headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

// Rate limiting helper (simple in-memory)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(key: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count < limit) {
    record.count++
    return true
  }

  return false
}
