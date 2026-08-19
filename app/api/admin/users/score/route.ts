import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { logSystemEvent } from '@/lib/logger';

export async function PUT(req: NextRequest) {
  try {
    const adminUser = await getUserFromRequest(req);
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ error: 'Quyền truy cập bị từ chối. Chỉ Admin mới có thể thực hiện.' }, { status: 403 });
    }

    const { userId, scoreAdjustment } = await req.json();
    const targetUserId = parseInt(userId);

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'ID người dùng không hợp lệ' }, { status: 400 });
    }

    const adj = parseInt(scoreAdjustment || '0');

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { scoreAdjustment: adj },
      select: {
        id: true,
        username: true,
        scoreAdjustment: true,
      },
    });

    await logSystemEvent(
      'UPDATE_USER_SCORE',
      `Admin #${adminUser.id} đã điều chỉnh điểm thưởng/phạt cho User #${targetUserId} (${updatedUser.username}) thành ${adj} điểm`,
      'INFO'
    );

    return NextResponse.json({
      message: 'Cập nhật điểm người dùng thành công!',
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('Update user score error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
