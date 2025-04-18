import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) return NextResponse.json({ score: 0 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  const userId = decoded.id;

  const predictions = await prisma.prediction.findMany({
    where: { userId },
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
