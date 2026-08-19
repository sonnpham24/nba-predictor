import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/auth';
import { fetchNbaTeams } from '@/lib/scraper';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(teams);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);

    const result = await fetchNbaTeams();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
