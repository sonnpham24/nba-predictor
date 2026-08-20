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

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Quyền truy cập bị từ chối. Chỉ Admin mới có thể thực hiện.' }, { status: 403 });
    }

    const url = new URL(req.url);
    const idParam = url.searchParams.get('id');
    const body = await req.json().catch(() => ({}));
    const matchupId = parseInt(idParam || body.id || '');

    if (isNaN(matchupId)) {
      return NextResponse.json({ error: 'Thiếu hoặc ID trận đấu không hợp lệ' }, { status: 400 });
    }

    const matchup = await prisma.regularMatchup.findUnique({ where: { id: matchupId } });
    if (!matchup) {
      return NextResponse.json({ error: 'Không tìm thấy trận đấu' }, { status: 404 });
    }

    if (!matchup.isCustom) {
      return NextResponse.json({ error: 'Chỉ có thể xóa các trận đấu tùy chỉnh (Custom Matchup)' }, { status: 400 });
    }

    const now = new Date();
    // Điều kiện xóa: chỉ xóa các trận chưa bắt đầu và chưa end/settled
    if (now >= new Date(matchup.startTime) || matchup.isSettled || matchup.status !== 'SCHEDULED') {
      return NextResponse.json(
        { error: 'Chỉ có thể xóa các trận đấu tùy chỉnh CHƯA BẮT ĐẦU và CHƯA CHỐT ĐIỂM.' },
        { status: 400 }
      );
    }

    // Xóa tất cả dữ liệu phụ thuộc (PropVote, RegularProp, RegularPrediction)
    const props = await prisma.regularProp.findMany({ where: { matchupId } });
    const propIds = props.map((p) => p.id);

    if (propIds.length > 0) {
      await prisma.propVote.deleteMany({ where: { propId: { in: propIds } } });
      await prisma.regularProp.deleteMany({ where: { matchupId } });
    }

    await prisma.regularPrediction.deleteMany({ where: { matchupId } });
    await prisma.regularMatchup.delete({ where: { id: matchupId } });

    await logSystemEvent(
      'DELETE_CUSTOM_MATCHUP',
      `Admin #${user.id} đã xóa trận đấu tùy chỉnh #${matchupId}`,
      'INFO'
    );

    return NextResponse.json({
      message: '✅ Đã xóa trận đấu tùy chỉnh thành công!',
      deletedId: matchupId,
    });
  } catch (err: any) {
    console.error('Delete custom matchup error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
