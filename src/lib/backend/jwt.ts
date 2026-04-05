import { jwtVerify, SignJWT } from 'jose';
import { getEnv } from './env';
import { HttpError } from './errors';

const secret = new TextEncoder().encode(getEnv('JWT_SECRET'));

export type AccessTokenPayload = {
  sub: string;
  role: string;
  sessionId: string;
  email: string;
};

export async function signAccessToken(payload: AccessTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as unknown as AccessTokenPayload;
  } catch {
    throw new HttpError('Token is invalid or expired', 401, 'TOKEN_INVALID');
  }
}
