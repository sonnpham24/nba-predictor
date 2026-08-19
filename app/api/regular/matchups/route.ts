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
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const formattedMatchups = matchups.map((m) => {
      const totalPredictions = m.predictions.length;
      const votesTeamA = m.predictions.filter((p) => p.predictedWinnerId === m.teamAId).length;
      const votesTeamB = m.predictions.filter((p) => p.predictedWinnerId === m.teamBId).length;

      const percentTeamA = totalPredictions > 0 ? Math.round((votesTeamA / totalPredictions) * 100) : 50;
      const percentTeamB = totalPredictions > 0 ? Math.round((votesTeamB / totalPredictions) * 100) : 50;

      const userPrediction = user
        ? m.predictions.find((p) => p.userId === user.id)
        : null;

      return {
        id: m.id,
        espnId: m.espnId,
        teamA: m.teamA,
        teamB: m.teamB,
        startTime: m.startTime,
        status: m.status,
        clock: m.clock,
        period: m.period,
        scoreA: m.scoreA,
        scoreB: m.scoreB,
        actualWinner: m.actualWinner,
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
            }
          : null,
      };
    });

    return NextResponse.json(formattedMatchups);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
