import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const matchupId = parseInt(params.id);

  const matchup = await prisma.matchup.findUnique({
    where: { id: matchupId },
    include: {
      predictions: {
        include: {
          user: {
            select: { username: true },
          },
        },
      },
    },
  });

  if (!matchup) {
    return NextResponse.json({ error: 'Matchup not found' }, { status: 404 });
  }

  return NextResponse.json(matchup);
}
