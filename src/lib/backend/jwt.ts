import { jwtVerify, SignJWT, errors } from 'jose';
import { env } from './env';
import { unauthorized } from './errors';

const getSecretBytes = () => {
  const raw = env.JWT_SECRET || process.env.JWT_SECRET || '';
  if (!raw || raw.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return new TextEncoder().encode(raw);
};

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
}

export async function signAccessToken(payload: {
  userId: string;
  email: string;
  roles: string[];
  sessionId: string;
}): Promise<string> {
  try {
    const token = await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      roles: payload.roles,
      sessionId: payload.sessionId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(getSecretBytes());

    return token;
  } catch (error) {
    console.error('Error signing JWT:', error);
    throw new Error('Failed to sign authentication token');
  }
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  try {
    const verified = await jwtVerify(token, getSecretBytes());
    return verified.payload as unknown as JWTPayload;
  } catch (error) {
    if (error instanceof errors.JWTClaimValidationFailed) {
      throw unauthorized('Token claims invalid');
    }
    if (error instanceof errors.JWTExpired) {
      throw unauthorized('Token expired');
    }
    throw unauthorized('Invalid or malformed token');
  }
}

export function extractBearerToken(authorizationHeader: string | null | undefined): string | null {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}
