import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const predictions = await prisma.prediction.findMany({
    include: {
      user: true,
      matchup: true,
    },
  });

  const scores: { [userId: number]: { username: string; score: number } } = {};

  for (const prediction of predictions) {
    const { user, matchup, predictedWinner, predictedScore } = prediction;

    if (!matchup.actualWinner || !matchup.actualScore) continue;

    const username = user.username;

    if (!scores[user.id]) {
      scores[user.id] = { username, score: 0 };
    }

    if (predictedWinner === matchup.actualWinner) {
      const [predA, predB] = predictedScore.split('-').map(Number);
      const [actA, actB] = matchup.actualScore.split('-').map(Number);

      const predictedTotalGames = predA + predB;
      const actualTotalGames = actA + actB;

      if (predA === actA && predB === actB) {
        scores[user.id].score += 3;
      } else if (Math.abs(predictedTotalGames - actualTotalGames) === 1) {
        scores[user.id].score += 2;
      } else {
        scores[user.id].score += 1;
      }
    }
  }

  const result = Object.values(scores).sort((a, b) => b.score - a.score);

  return NextResponse.json(result);
}
