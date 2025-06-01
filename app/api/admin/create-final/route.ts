import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    requireAdminFromRequest(req);

    // 1️⃣ Lấy đội thắng vòng 3 của mỗi miền
    const westWinner = await prisma.matchup.findFirst({
      where: { round: 3, conference: 'west', actualWinner: { not: null } },
      orderBy: { id: 'asc' },
    });

    const eastWinner = await prisma.matchup.findFirst({
      where: { round: 3, conference: 'east', actualWinner: { not: null } },
      orderBy: { id: 'asc' },
    });

    if (!westWinner?.actualWinner || !eastWinner?.actualWinner) {
      return NextResponse.json(
        { error: 'Cần có đủ kết quả trận Chung Kết Miền trước khi tạo vòng Chung Kết Tổng.' },
        { status: 400 }
      );
    }

    // 2️⃣ Tạo vòng Chung Kết Tổng (round = 4)
    const finalMatchup = await prisma.matchup.create({
      data: {
        teamA: westWinner.actualWinner,
        teamB: eastWinner.actualWinner,
        round: 4,
        conference: 'final', // hoặc null
      },
    });

    return NextResponse.json({ message: '✅ Đã tạo vòng Chung Kết Tổng', matchup: finalMatchup });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
