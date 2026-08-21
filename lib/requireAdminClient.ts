'use client';

import { useRouter } from 'next/navigation';

export async function requireAdminClient(router?: any): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) {
      if (router) router.push('/auth');
      else window.location.href = '/auth';
      throw new Error('Bạn chưa đăng nhập');
    }

    const data = await res.json();
    if (!data.user?.isAdmin) {
      if (router) router.push('/regular-season');
      else window.location.href = '/regular-season';
      throw new Error('Bạn không có quyền admin');
    }
  } catch (err: any) {
    if (router) router.push('/auth');
    else window.location.href = '/auth';
    throw err;
  }
}
