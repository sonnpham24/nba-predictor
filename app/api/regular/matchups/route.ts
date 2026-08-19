import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dateQuery = url.searchParams.get('date'); // YYYY-MM-DD (GMT+7)
    const days = parseInt(url.searchParams.get('days') || '7');

    const user = await getUserFromRequest(req);

    let whereClause: any = {};

    if (dateQuery) {
      const startOfDay = new Date(`${dateQuery}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateQuery}T23:59:59.999Z`);
      whereClause.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else {
      const now = new Date();
      const pastWindow = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 ngày trước
      const futureWindow = new Date(now.getTime() + days * 24 * 60 * 60 * 1000); // 7 ngày sau
      whereClause.startTime = {
        gte: pastWindow,
        lte: futureWindow,
      };
    }

    const matchups = await prisma.regularMatchup.findMany({
      where: whereClause,
      include: {
        teamA: { select: { id: true, name: true, abbreviation: true, logo: true, color: true } },
        teamB: { select: { id: true, name: true, abbreviation: true, logo: true, color: true } },
        actualWinner: { select: { id: true, name: true, abbreviation: true } },
        predictions: {
          select: {
            id: true,
            userId: true,
            predictedWinnerId: true,
            customPredictedWinner: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const formattedMatchups = matchups.map((m) => {
      const teamAObj = m.teamA || {
        id: -1,
        name: m.customTeamA || 'Team A',
        abbreviation: 'CUST',
        logo: m.customLogoA || 'https://a.espncdn.com/i/teamlogos/nba/500/nba.png',
      };

      const teamBObj = m.teamB || {
        id: -2,
        name: m.customTeamB || 'Team B',
        abbreviation: 'CUST',
        logo: m.customLogoB || 'https://a.espncdn.com/i/teamlogos/nba/500/nba.png',
      };

      const totalPredictions = m.predictions.length;
      let votesTeamA = 0;
      let votesTeamB = 0;

      m.predictions.forEach((p) => {
        if (p.predictedWinnerId === m.teamAId || (m.isCustom && p.customPredictedWinner === teamAObj.name)) {
          votesTeamA++;
        } else {
          votesTeamB++;
        }
      });

      const percentTeamA = totalPredictions > 0 ? Math.round((votesTeamA / totalPredictions) * 100) : 50;
      const percentTeamB = totalPredictions > 0 ? Math.round((votesTeamB / totalPredictions) * 100) : 50;

      const userPrediction = user
        ? m.predictions.find((p) => p.userId === user.id)
        : null;

      return {
        id: m.id,
        espnId: m.espnId,
        isCustom: m.isCustom,
        teamA: teamAObj,
        teamB: teamBObj,
        startTime: m.startTime,
        status: m.status,
        clock: m.clock,
        period: m.period,
        scoreA: m.scoreA,
        scoreB: m.scoreB,
        actualWinner: m.actualWinner || (m.customWinner ? { name: m.customWinner } : null),
        actualScore: m.actualScore,
        lockTime: m.lockTime,
        openTime: m.openTime,
        totalPredictions,
        votesTeamA,
        votesTeamB,
        percentTeamA,
        percentTeamB,
        userPrediction: userPrediction
          ? {
              id: userPrediction.id,
              predictedWinnerId: userPrediction.predictedWinnerId,
              customPredictedWinner: userPrediction.customPredictedWinner,
            }
          : null,
      };
    });

    return NextResponse.json(formattedMatchups);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
