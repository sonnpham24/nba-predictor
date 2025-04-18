import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as { id: number; username: string; isAdmin?: boolean };
  } catch (err) {
    return null;
  }
}

export function requireAdminFromRequest(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || !user.isAdmin) {
    throw new Error('Bạn không có quyền admin');
  }
  return user;
}

