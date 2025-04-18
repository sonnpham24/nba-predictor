// app/api/matchups/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const matchups = await prisma.matchup.findMany({
    orderBy: [{ round: 'asc' }, { id: 'asc' }],
  });

  return NextResponse.json(matchups);
}

