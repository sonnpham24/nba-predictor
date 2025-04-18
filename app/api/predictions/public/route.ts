import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const predictions = await prisma.prediction.findMany({
    where: {
      matchup: {
        NOT: {
          actualWinner: null
        }
      }
    },
    include: {
      user: {
        select: { username: true }
      },
      matchup: {
        select: {
          id: true,
          teamA: true,
          teamB: true,
          actualWinner: true,
          actualScore: true
        }
      }
    },
    orderBy: {
      matchupId: 'asc'
    }
  });

  return NextResponse.json(predictions);
}
