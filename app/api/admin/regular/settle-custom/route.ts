import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { logSystemEvent } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Quyền truy cập bị từ chối. Chỉ Admin mới có thể thực hiện.' }, { status: 403 });
    }

    const { matchupId, scoreA, scoreB, winnerType } = await req.json();

    const mId = parseInt(matchupId);
    if (isNaN(mId)) {
      return NextResponse.json({ error: 'ID trận đấu không hợp lệ' }, { status: 400 });
    }

    const matchup = await prisma.regularMatchup.findUnique({
      where: { id: mId },
      include: { teamA: true, teamB: true, predictions: true },
    });

    if (!matchup) {
      return NextResponse.json({ error: 'Không tìm thấy trận đấu' }, { status: 404 });
    }

    const sA = parseInt(scoreA || '0');
    const sB = parseInt(scoreB || '0');

    let actualWinnerId: number | null = null;
    let customWinner: string | null = null;

    if (winnerType === 'teamA') {
      actualWinnerId = matchup.teamAId || null;
      customWinner = matchup.teamA ? matchup.teamA.name : matchup.customTeamA;
    } else if (winnerType === 'teamB') {
      actualWinnerId = matchup.teamBId || null;
      customWinner = matchup.teamB ? matchup.teamB.name : matchup.customTeamB;
    }

    const updatedMatchup = await prisma.regularMatchup.update({
      where: { id: mId },
      data: {
        scoreA: sA,
        scoreB: sB,
        actualScore: `${sA}-${sB}`,
        actualWinnerId,
        customWinner,
        status: 'FINISHED',
        isSettled: true,
      },
    });

    // Tính tổng số người dùng đoán đúng đội thắng
    let correctCount = 0;
    for (const p of matchup.predictions) {
      if (winnerType === 'teamA') {
        if (p.predictedWinnerId === matchup.teamAId || p.customPredictedWinner === matchup.customTeamA) {
          correctCount++;
        }
      } else if (winnerType === 'teamB') {
        if (p.predictedWinnerId === matchup.teamBId || p.customPredictedWinner === matchup.customTeamB) {
          correctCount++;
        }
      }
    }

    await logSystemEvent(
      'SETTLE_CUSTOM_MATCHUP',
      `Admin #${user.id} đã kết thúc trận đấu #${mId} (Tỉ số: ${sA}-${sB}, Winner: ${customWinner}). Đã phân điểm +1 cho ${correctCount} lượt đoán đúng.`,
      'INFO'
    );

    return NextResponse.json({
      message: `Đã kết thúc trận đấu thành công! Tỉ số: ${sA}-${sB}. Đã phân +1 điểm cho ${correctCount} người đoán đúng.`,
      matchup: updatedMatchup,
      correctCount,
    });
  } catch (err: any) {
    console.error('Settle custom matchup error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
