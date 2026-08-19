import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [allUsers, regPredictions, playoffPredictions] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          isAdmin: true,
          favoriteTeam: {
            select: {
              id: true,
              name: true,
              abbreviation: true,
              logo: true,
            },
          },
        },
      }),
      prisma.regularPrediction.findMany({
        include: {
          matchup: { select: { status: true, actualWinnerId: true } },
        },
      }),
      prisma.prediction.findMany({
        include: {
          matchup: { select: { actualWinner: true, actualScore: true } },
        },
      }),
    ]);

    const userStats: {
      [userId: number]: {
        id: number;
        username: string;
        displayName?: string | null;
        avatar?: string | null;
        isAdmin: boolean;
        favoriteTeam?: any;
        regularScore: number;
        playoffScore: number;
        totalScore: number;
        totalPredictions: number;
        correctPredictions: number;
      };
    } = {};

    for (const u of allUsers) {
      userStats[u.id] = {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatar: u.avatar,
        isAdmin: u.isAdmin,
        favoriteTeam: u.favoriteTeam,
        regularScore: 0,
        playoffScore: 0,
        totalScore: 0,
        totalPredictions: 0,
        correctPredictions: 0,
      };
    }

    // Calculate Regular Season Points
    for (const p of regPredictions) {
      if (!userStats[p.userId]) continue;
      userStats[p.userId].totalPredictions += 1;

      if (p.matchup.status === 'FINISHED' && p.matchup.actualWinnerId !== null) {
        if (p.predictedWinnerId === p.matchup.actualWinnerId) {
          userStats[p.userId].regularScore += 1;
          userStats[p.userId].correctPredictions += 1;
        }
      }
    }

    // Calculate Playoff Points
    for (const p of playoffPredictions) {
      if (!userStats[p.userId]) continue;
      userStats[p.userId].totalPredictions += 1;

      const { predictedWinner, predictedScore, matchup } = p;
      if (matchup?.actualWinner && matchup?.actualScore) {
        if (predictedWinner === matchup.actualWinner) {
          userStats[p.userId].correctPredictions += 1;
          const [predA, predB] = predictedScore.split('-').map(Number);
          const [actA, actB] = matchup.actualScore.split('-').map(Number);
          const predictedTotal = predA + predB;
          const actualTotal = actA + actB;

          if (predA === actA && predB === actB) {
            userStats[p.userId].playoffScore += 3;
          } else if (Math.abs(predictedTotal - actualTotal) === 1) {
            userStats[p.userId].playoffScore += 2;
          } else {
            userStats[p.userId].playoffScore += 1;
          }
        }
      }
    }

    // Sum Total Score
    const leaderboard = Object.values(userStats)
      .map((u) => ({
        ...u,
        totalScore: u.regularScore + u.playoffScore,
      }))
      .sort((a, b) => b.totalScore - a.totalScore || b.correctPredictions - a.correctPredictions);

    return NextResponse.json(leaderboard);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
