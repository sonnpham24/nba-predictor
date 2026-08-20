import { NextRequest, NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/auth';
import { fetchLiveScoreboardAndSettle, fetchUpcomingSchedule } from '@/lib/scraper';

async function isAuthorized(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  try {
    await requireAdminFromRequest(req);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isAuthorized(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const liveSyncResult = await fetchLiveScoreboardAndSettle();
    const scheduleResult = await fetchUpcomingSchedule(7);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      liveSync: liveSyncResult,
      schedule: scheduleResult,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
