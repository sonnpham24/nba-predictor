import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const predictions = await prisma.regularPrediction.findMany({
      include: {
        user: { select: { id: true, username: true } },
        matchup: { select: { status: true, actualWinnerId: true } },
      },
    });

    const userScores: { [userId: number]: { id: number; username: string; score: number; totalPredictions: number; correctPredictions: number } } = {};

    for (const p of predictions) {
      const { user, matchup, predictedWinnerId } = p;
      if (!userScores[user.id]) {
        userScores[user.id] = {
          id: user.id,
          username: user.username,
          score: 0,
          totalPredictions: 0,
          correctPredictions: 0,
        };
      }

      userScores[user.id].totalPredictions += 1;

      if (matchup.status === 'FINISHED' && matchup.actualWinnerId !== null) {
        if (predictedWinnerId === matchup.actualWinnerId) {
          userScores[user.id].score += 1;
          userScores[user.id].correctPredictions += 1;
        }
      }
    }

    const leaderboard = Object.values(userScores).sort((a, b) => b.score - a.score || b.correctPredictions - a.correctPredictions);

    return NextResponse.json(leaderboard);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
