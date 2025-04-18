import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getUserFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    const userId = decoded.id;

    const body = await req.json();
    const { matchupId, predictedWinner, predictedScore, teamA, teamB } = body;
    const validScores = ['4-0', '4-1', '4-2', '4-3'];
    if (!validScores.includes(predictedScore)) {
      return NextResponse.json({ error: 'Tỷ số không hợp lệ. Chỉ cho phép 4-0, 4-1, 4-2, 4-3' }, { status: 400 });
    }

    // Thêm đoạn này trước khi create
    const existing = await prisma.prediction.findFirst({
      where: {
        userId,
        matchupId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Bạn đã dự đoán cặp đấu này rồi.' }, { status: 400 });
    }

    if (!matchupId || !predictedWinner || !predictedScore) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchupId: {
          userId,
          matchupId,
        },
      },
      update: {
        predictedWinner,
        predictedScore,
      },
      create: {
        userId,
        matchupId,
        teamA,
        teamB,
        predictedWinner,
        predictedScore,
      },
    });

    return NextResponse.json({ message: 'Lưu dự đoán thành công', prediction });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


