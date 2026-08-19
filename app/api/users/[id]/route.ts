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

    // Lấy 10 dự đoán gần đây nhất
    const recent10Picks = await prisma.regularPrediction.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        matchup: {
          include: {
            teamA: true,
            teamB: true,
          },
        },
        predictedWinner: true,
      },
    });

    const recentPredictions = recent10Picks.map((p) => {
      const m = p.matchup;
      const teamAName = m.teamA ? m.teamA.name : m.customTeamA || 'Team A';
      const teamBName = m.teamB ? m.teamB.name : m.customTeamB || 'Team B';
      const teamALogo = m.teamA ? m.teamA.logo : m.customLogoA;
      const teamBLogo = m.teamB ? m.teamB.logo : m.customLogoB;
      const myPick = p.predictedWinner ? p.predictedWinner.name : p.customPredictedWinner || 'N/A';

      let isCorrect: boolean | null = null;
      let points = 0;

      if (m.isSettled) {
        if (p.predictedWinnerId && m.actualWinnerId) {
          isCorrect = p.predictedWinnerId === m.actualWinnerId;
        } else if (p.customPredictedWinner && m.customWinner) {
          isCorrect = p.customPredictedWinner === m.customWinner;
        }
        if (isCorrect) points = 1;
      }

      return {
        id: p.id,
        createdAt: p.createdAt,
        teamAName,
        teamBName,
        teamALogo,
        teamBLogo,
        status: m.status,
        isSettled: m.isSettled,
        actualScore: m.actualScore,
        myPick,
        isCorrect,
        points,
      };
    });

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
      recentPredictions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
