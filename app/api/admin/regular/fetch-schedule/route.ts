import { NextRequest, NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/auth';
import { fetchUpcomingSchedule } from '@/lib/scraper';

export async function POST(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);

    const result = await fetchUpcomingSchedule(7);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
