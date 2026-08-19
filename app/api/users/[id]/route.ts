import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idStr = url.pathname.split('/').pop();
    const userId = parseInt(idStr || '');

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID người dùng không hợp lệ' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        isAdmin: true,
        isEmailVerified: true,
        createdAt: true,
        favoriteTeam: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
            logo: true,
            conference: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Tính toán thống kê dự đoán Regular Season & Playoff
    const [regPredictions, playoffPredictions] = await Promise.all([
      prisma.regularPrediction.findMany({
        where: { userId },
        include: { matchup: true },
      }),
      prisma.prediction.findMany({
        where: { userId },
        include: { matchup: true },
      }),
    ]);

    let regScore = 0;
    let regCorrect = 0;
    regPredictions.forEach((p) => {
      if (p.matchup.isSettled && p.matchup.actualWinnerId === p.predictedWinnerId) {
        regScore += 1;
        regCorrect += 1;
      }
    });

    let playoffScore = 0;
    let playoffCorrect = 0;
    playoffPredictions.forEach((p) => {
      if (p.matchup.actualWinner && p.matchup.actualWinner === p.predictedWinner) {
        playoffScore += 1;
        playoffCorrect += 1;
      }
    });

    const totalScore = regScore + playoffScore;
    const totalPicks = regPredictions.length + playoffPredictions.length;
    const totalCorrect = regCorrect + playoffCorrect;

    return NextResponse.json({
      ...user,
      stats: {
        totalScore,
        regularScore: regScore,
        playoffScore,
        totalPicks,
        totalCorrect,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
