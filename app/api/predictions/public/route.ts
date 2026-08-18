import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const predictions = await prisma.prediction.findMany({
    include: {
      user: {
        select: { username: true },
      },
      matchup: {
        select: {
          id: true,
          teamA: true,
          teamB: true,
          actualWinner: true,
          actualScore: true,
        },
      },
    },
    orderBy: {
      matchupId: 'asc',
    },
  });

  return NextResponse.json(predictions);
}
