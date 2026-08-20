import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

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
    const { matchupId, predictedWinnerId, customPredictedWinner } = body;

    const mId = parseInt(matchupId);
    if (isNaN(mId)) {
      return NextResponse.json({ error: 'Thiếu matchupId' }, { status: 400 });
    }

    const matchup = await prisma.regularMatchup.findUnique({
      where: { id: mId },
      include: { teamA: true, teamB: true },
    });

    if (!matchup) {
      return NextResponse.json({ error: 'Không tìm thấy trận đấu' }, { status: 404 });
    }

    const now = new Date();
    // Kiểm tra thời gian khóa dự đoán
    if (now >= new Date(matchup.lockTime)) {
      return NextResponse.json({ error: 'Đã hết thời gian dự đoán (trận đấu đã bắt đầu hoặc đã khóa)' }, { status: 400 });
    }

    const existing = await prisma.regularPrediction.findUnique({
      where: {
        userId_matchupId: {
          userId: user.id,
          matchupId: mId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Bạn đã dự đoán trận này rồi, không thể thay đổi lựa chọn.' }, { status: 409 });
    }

    let pWinId: number | null = predictedWinnerId ? parseInt(predictedWinnerId) : null;
    let cWinName: string | null = customPredictedWinner ? String(customPredictedWinner).trim() : null;

    // Xử lý an toàn cho ID âm (ví dụ -1 cho team custom)
    if (pWinId !== null && pWinId <= 0) {
      pWinId = null;
      if (!cWinName) {
        if (predictedWinnerId === -1 || predictedWinnerId === '-1') {
          cWinName = matchup.customTeamA || matchup.teamA?.name || 'Team A';
        } else if (predictedWinnerId === -2 || predictedWinnerId === '-2') {
          cWinName = matchup.customTeamB || matchup.teamB?.name || 'Team B';
        }
      }
    }

    const validTeamPick =
      (pWinId !== null && (pWinId === matchup.teamAId || pWinId === matchup.teamBId)) ||
      (cWinName !== null && (cWinName === matchup.customTeamA || cWinName === matchup.customTeamB));

    if (!validTeamPick) {
      return NextResponse.json({ error: 'Đội dự đoán không hợp lệ cho trận đấu này' }, { status: 400 });
    }

    const prediction = await prisma.regularPrediction.create({
      data: {
        userId: user.id,
        matchupId: mId,
        predictedWinnerId: pWinId,
        customPredictedWinner: cWinName,
      },
    });

    return NextResponse.json({ message: '✅ Đã lưu dự đoán thành công', prediction });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
