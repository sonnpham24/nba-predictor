import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const matchups = await prisma.matchup.findMany({
    orderBy: [{ round: 'asc' }, { id: 'asc' }],
  });

  return NextResponse.json(matchups);
}
