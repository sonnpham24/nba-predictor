import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    requireAdminFromRequest(req);

    const { round, conference } = await req.json();

    if (typeof round !== 'number' || !['west', 'east'].includes(conference)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    // Lấy các matchup của round hiện tại
    const currentMatchups = await prisma.matchup.findMany({
      where: { round, conference },
      orderBy: { id: 'asc' },
    });

    if (currentMatchups.length < 2) {
      return NextResponse.json({ error: 'Không đủ matchup để tạo vòng tiếp theo' }, { status: 400 });
    }

    // Tạo các matchup mới từ đội thắng
    const nextRound = round + 1;
    const newMatchups = [];

    for (let i = 0; i < currentMatchups.length; i += 2) {
      const team1 = currentMatchups[i].actualWinner;
      const team2 = currentMatchups[i + 1]?.actualWinner;

      if (!team1 || !team2) continue;

      newMatchups.push({
        teamA: team1,
        teamB: team2,
        round: nextRound,
        conference,
      });
    }

    await prisma.matchup.createMany({
      data: newMatchups,
    });

    return NextResponse.json({ message: '✅ Đã tạo matchup vòng tiếp theo', count: newMatchups.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}

