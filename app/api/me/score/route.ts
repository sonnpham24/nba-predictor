import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ score: 0 });

  const predictions = await prisma.prediction.findMany({
    where: { userId: user.id },
    include: { matchup: true },
  });

  let score = 0;

  for (const p of predictions) {
    const m = p.matchup;
    if (!m?.actualWinner || !m?.actualScore) continue;
    if (p.predictedWinner !== m.actualWinner) continue;

    const [predA, predB] = p.predictedScore.split('-').map(Number);
    const [actA, actB] = m.actualScore.split('-').map(Number);
    const predTotal = predA + predB;
    const actTotal = actA + actB;

    if (predA === actA && predB === actB) score += 3;
    else if (Math.abs(predTotal - actTotal) === 1) score += 2;
    else score += 1;
  }

  return NextResponse.json({ score });
}
