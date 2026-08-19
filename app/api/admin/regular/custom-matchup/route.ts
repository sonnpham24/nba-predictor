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

    const {
      teamAId,
      teamBId,
      customTeamA,
      customTeamB,
      customLogoA,
      customLogoB,
      startTime,
    } = await req.json();

    if (!startTime) {
      return NextResponse.json({ error: 'Vui lòng chọn thời gian bắt đầu trận đấu' }, { status: 400 });
    }

    const parsedStart = new Date(startTime);
    if (isNaN(parsedStart.getTime())) {
      return NextResponse.json({ error: 'Thời gian bắt đầu không hợp lệ' }, { status: 400 });
    }

    // Kiểm tra tên đội
    const nameA = teamAId ? null : (customTeamA || '').trim();
    const nameB = teamBId ? null : (customTeamB || '').trim();

    if (!teamAId && !nameA) {
      return NextResponse.json({ error: 'Vui lòng chọn Đội A hoặc nhập tên Đội A tùy chỉnh' }, { status: 400 });
    }
    if (!teamBId && !nameB) {
      return NextResponse.json({ error: 'Vui lòng chọn Đội B hoặc nhập tên Đội B tùy chỉnh' }, { status: 400 });
    }

    // Thời gian khóa dự đoán CHÍNH XÁC LÀ THỜI GIẢN BẮT ĐẦU TRẬN ĐẤU (lockTime = startTime)
    const lockTime = parsedStart;
    const openTime = new Date(parsedStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newMatchup = await prisma.regularMatchup.create({
      data: {
        teamAId: teamAId ? parseInt(teamAId) : null,
        teamBId: teamBId ? parseInt(teamBId) : null,
        customTeamA: nameA,
        customTeamB: nameB,
        customLogoA: customLogoA || null,
        customLogoB: customLogoB || null,
        isCustom: true,
        startTime: parsedStart,
        lockTime,
        openTime,
        status: 'SCHEDULED',
      },
      include: {
        teamA: true,
        teamB: true,
      },
    });

    await logSystemEvent(
      'CREATE_CUSTOM_MATCHUP',
      `Admin #${user.id} đã tự tạo trận đấu tùy chỉnh #${newMatchup.id} (Start: ${parsedStart.toISOString()})`,
      'INFO'
    );

    return NextResponse.json({
      message: 'Tạo trận đấu tùy chỉnh thành công!',
      matchup: newMatchup,
    });
  } catch (err: any) {
    console.error('Create custom matchup error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
