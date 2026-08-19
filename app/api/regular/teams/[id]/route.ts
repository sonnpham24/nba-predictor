import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, requireAdminFromRequest } from '@/lib/auth';
import { approveTeamData, scrapeTeamRoster } from '@/lib/scraper';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idStr = url.pathname.split('/').pop();
    const teamId = parseInt(idStr || '');

    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'ID đội bóng không hợp lệ' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: 'Không tìm thấy đội bóng' }, { status: 404 });
    }

    const user = await getUserFromRequest(req);
    const isAdmin = user?.isAdmin || false;

    // Nếu không phải admin và chưa được duyệt, ẩn pendingData
    if (!isAdmin) {
      return NextResponse.json({
        id: team.id,
        name: team.name,
        abbreviation: team.abbreviation,
        logo: team.logo,
        color: team.color,
        conference: team.conference,
        isApproved: team.isApproved,
        scrapedData: team.isApproved && team.scrapedData ? JSON.parse(team.scrapedData) : null,
      });
    }

    // Nếu là admin, trả về chi tiết cả pendingData và scrapedData
    return NextResponse.json({
      ...team,
      scrapedData: team.scrapedData ? JSON.parse(team.scrapedData) : null,
      pendingData: team.pendingData ? JSON.parse(team.pendingData) : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);

    const url = new URL(req.url);
    const idStr = url.pathname.split('/').pop();
    const teamId = parseInt(idStr || '');

    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'ID đội bóng không hợp lệ' }, { status: 400 });
    }

    const body = await req.json();
    const action = body.action; // 'scrape' | 'approve'

    if (action === 'scrape') {
      const result = await scrapeTeamRoster(teamId);
      return NextResponse.json(result);
    } else if (action === 'approve') {
      const result = await approveTeamData(teamId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ. Cho phép: scrape hoặc approve' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
