import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idStr = url.pathname.split('/').pop();
    const matchupId = parseInt(idStr || '');

    if (isNaN(matchupId)) {
      return NextResponse.json({ error: 'ID trận đấu không hợp lệ' }, { status: 400 });
    }

    const user = await getUserFromRequest(req);

    const m = await prisma.regularMatchup.findUnique({
      where: { id: matchupId },
      include: {
        teamA: true,
        teamB: true,
        actualWinner: true,
        predictions: {
          include: {
            user: { select: { id: true, username: true } },
            predictedWinner: { select: { id: true, name: true, abbreviation: true } },
          },
        },
      },
    });

    if (!m) {
      return NextResponse.json({ error: 'Không tìm thấy trận đấu' }, { status: 404 });
    }

    const totalPredictions = m.predictions.length;
    const votesTeamA = m.predictions.filter((p) => p.predictedWinnerId === m.teamAId).length;
    const votesTeamB = m.predictions.filter((p) => p.predictedWinnerId === m.teamBId).length;

    const percentTeamA = totalPredictions > 0 ? Math.round((votesTeamA / totalPredictions) * 100) : 50;
    const percentTeamB = totalPredictions > 0 ? Math.round((votesTeamB / totalPredictions) * 100) : 50;

    const userPrediction = user
      ? m.predictions.find((p) => p.userId === user.id)
      : null;

    return NextResponse.json({
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
      recentPredictions: m.predictions.slice(0, 10).map((p) => ({
        id: p.id,
        username: p.user.username,
        predictedTeam: p.predictedWinner.name,
        createdAt: p.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
