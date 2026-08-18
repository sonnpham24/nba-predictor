import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { predictionSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = predictionSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { matchupId, predictedWinner, predictedScore, teamA, teamB } = validation.data;
    const userId = user.id;

    const validScores = ['4-0', '4-1', '4-2', '4-3'];
    if (!validScores.includes(predictedScore)) {
      return NextResponse.json({ error: 'Tỷ số không hợp lệ. Chỉ cho phép 4-0, 4-1, 4-2, 4-3' }, { status: 400 });
    }

    const existing = await prisma.prediction.findFirst({
      where: {
        userId,
        matchupId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Bạn đã dự đoán cặp đấu này rồi.' }, { status: 400 });
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
