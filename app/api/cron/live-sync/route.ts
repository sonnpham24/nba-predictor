import { NextResponse } from 'next/server';
import { fetchLiveScoreboardAndSettle, fetchUpcomingSchedule } from '@/lib/scraper';

export async function GET() {
  try {
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

export async function POST() {
  return GET();
}
