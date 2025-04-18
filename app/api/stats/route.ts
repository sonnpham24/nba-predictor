import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const matchups = await prisma.matchup.findMany({
    include: {
      predictions: true,
    },
  });

  const result = matchups.map((m) => {
    const total = m.predictions.length;
    const correct = m.predictions.filter(p => p.predictedWinner === m.actualWinner).length;
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

    return {
      id: m.id,
      label: `${m.teamA} vs ${m.teamB}`,
      round: m.round,
      conference: m.conference,
      total,
      correct,
      accuracy,
    };
  });

  return NextResponse.json(result);
}
