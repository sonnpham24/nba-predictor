import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const predictions = await prisma.prediction.findMany({
      where: { userId: user.id },
      include: {
        matchup: {
          select: {
            actualWinner: true,
            actualScore: true,
          },
        },
      },
    });

    return NextResponse.json(predictions);
  } catch (err) {
    return NextResponse.json([], { status: 200 });
  }
}
