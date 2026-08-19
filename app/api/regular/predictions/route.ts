import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { isPredictionOpen } from '@/lib/dateUtils';
import { z } from 'zod';

const regularPredictionSchema = z.object({
  matchupId: z.number({ message: 'Thiếu matchupId' }),
  predictedWinnerId: z.number({ message: 'Thiếu predictedWinnerId' }),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const predictions = await prisma.regularPrediction.findMany({
      where: { userId: user.id },
      include: {
        matchup: {
          include: {
            teamA: { select: { name: true, logo: true } },
            teamB: { select: { name: true, logo: true } },
            actualWinner: { select: { id: true, name: true } },
          },
        },
        predictedWinner: { select: { id: true, name: true, logo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(predictions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const validation = regularPredictionSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { matchupId, predictedWinnerId } = validation.data;

    const matchup = await prisma.regularMatchup.findUnique({
      where: { id: matchupId },
    });

    if (!matchup) {
      return NextResponse.json({ error: 'Không tìm thấy trận đấu' }, { status: 404 });
    }

    if (predictedWinnerId !== matchup.teamAId && predictedWinnerId !== matchup.teamBId) {
      return NextResponse.json({ error: 'Đội được chọn không thuộc trận đấu này' }, { status: 400 });
    }

    const now = new Date();
    if (!isPredictionOpen(matchup.startTime, now)) {
      if (now >= matchup.lockTime) {
        return NextResponse.json({ error: 'Đã hết thời gian dự đoán (đã đóng 30 phút trước trận đấu)' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'Dự đoán chưa mở (chỉ mở trước 7 ngày)' }, { status: 400 });
      }
    }

    const prediction = await prisma.regularPrediction.upsert({
      where: {
        userId_matchupId: {
          userId: user.id,
          matchupId,
        },
      },
      update: {
        predictedWinnerId,
      },
      create: {
        userId: user.id,
        matchupId,
        predictedWinnerId,
      },
    });

    return NextResponse.json({ message: '✅ Đã lưu dự đoán thành công', prediction });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
