import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Đăng xuất thành công' });

  // Xóa cookie token triệt để ở phía Server
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}
