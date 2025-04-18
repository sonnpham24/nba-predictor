'use client';

export async function requireAdminClient(): Promise<void> {
  const res = await fetch('/api/auth/me', { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Bạn chưa đăng nhập');
  }

  const data = await res.json();

  if (!data.user?.isAdmin) {
    throw new Error('Bạn không có quyền admin');
  }
}


