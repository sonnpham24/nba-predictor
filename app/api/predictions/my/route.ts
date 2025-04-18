import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getUserFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as any).id;

    const predictions = await prisma.prediction.findMany({
      where: { userId },
      include: {
        matchup: {
          select: {
            actualWinner: true,
            actualScore: true,
          },
        }
      }
    });

    return NextResponse.json(predictions);
  } catch (err) {
    return NextResponse.json([], { status: 200 });
  }
}
