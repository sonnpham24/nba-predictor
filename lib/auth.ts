import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

export interface JwtPayload {
  id: number;
  username: string;
  isAdmin?: boolean;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  return new TextEncoder().encode(secret);
}

export async function createJwtToken(payload: JwtPayload, expiresIn = '7d'): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function getUserFromRequest(req: NextRequest): Promise<JwtPayload | null> {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as JwtPayload;
  } catch (err) {
    return null;
  }
}

export async function requireAdminFromRequest(req: NextRequest): Promise<JwtPayload> {
  const user = await getUserFromRequest(req);
  if (!user || !user.isAdmin) {
    throw new Error('Bạn không có quyền admin');
  }
  return user;
}
