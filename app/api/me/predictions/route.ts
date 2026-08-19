import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;

    const [totalCount, predictions] = await Promise.all([
      prisma.regularPrediction.count({ where: { userId: user.id } }),
      prisma.regularPrediction.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
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
      }),
    ]);

    const formattedList = predictions.map((p) => {
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
        matchupId: m.id,
        teamAName,
        teamBName,
        teamALogo,
        teamBLogo,
        startTime: m.startTime,
        status: m.status,
        isSettled: m.isSettled,
        actualScore: m.actualScore,
        myPick,
        isCorrect,
        points,
      };
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      predictions: formattedList,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
