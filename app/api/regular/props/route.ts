import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const matchupIdStr = url.searchParams.get('matchupId');
    const mId = parseInt(matchupIdStr || '');

    if (isNaN(mId)) {
      return NextResponse.json({ error: 'Thiếu matchupId' }, { status: 400 });
    }

    const user = await getUserFromRequest(req);

    const props = await prisma.regularProp.findMany({
      where: { matchupId: mId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isAdmin: true,
          },
        },
        votes: {
          select: {
            id: true,
            userId: true,
            vote: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProps = props.map((p) => {
      const votesYes = p.votes.filter((v) => v.vote === 'YES').length;
      const votesNo = p.votes.filter((v) => v.vote === 'NO').length;
      const totalVotes = p.votes.length;

      const percentYes = totalVotes > 0 ? Math.round((votesYes / totalVotes) * 100) : 50;
      const percentNo = totalVotes > 0 ? Math.round((votesNo / totalVotes) * 100) : 50;

      const userVote = user ? p.votes.find((v) => v.userId === user.id)?.vote || null : null;

      return {
        id: p.id,
        matchupId: p.matchupId,
        creator: p.creator,
        question: p.question,
        playerName: p.playerName,
        statType: p.statType,
        threshold: p.threshold,
        actualStatValue: p.actualStatValue,
        resolvedOutcome: p.resolvedOutcome,
        isResolved: p.isResolved,
        isSettled: p.isSettled,
        votesYes,
        votesNo,
        totalVotes,
        percentYes,
        percentNo,
        userVote,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json(formattedProps);
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

    const { matchupId, question, playerName, statType, threshold } = await req.json();

    const mId = parseInt(matchupId);
    if (isNaN(mId) || !question || !question.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập câu hỏi dự đoán Yes/No' }, { status: 400 });
    }

    const matchup = await prisma.regularMatchup.findUnique({ where: { id: mId } });
    if (!matchup) {
      return NextResponse.json({ error: 'Không tìm thấy trận đấu' }, { status: 404 });
    }

    const now = new Date();
    if (now >= new Date(matchup.lockTime)) {
      return NextResponse.json({ error: 'Trận đấu đã bắt đầu hoặc bị khóa, không thể tạo dự đoán mới' }, { status: 400 });
    }

    const parsedThreshold = threshold !== undefined && threshold !== '' ? parseFloat(threshold) : null;

    const newProp = await prisma.regularProp.create({
      data: {
        matchupId: mId,
        creatorId: user.id,
        question: question.trim(),
        playerName: playerName ? playerName.trim() : null,
        statType: statType || null,
        threshold: parsedThreshold,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isAdmin: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: '✅ Tạo câu hỏi dự đoán Yes/No thành công!',
      prop: newProp,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
