'use client';

export async function requireLoginClient() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Bạn chưa đăng nhập');

  const data = await res.json();
  return data.user; // { id, username, isAdmin }
}

