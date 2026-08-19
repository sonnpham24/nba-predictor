import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isEmailVerified: true,
        isDisabled: true,
        isAdmin: true,
        scoreAdjustment: true,
        createdAt: true,
        _count: {
          select: {
            predictions: true,
            regularPredictions: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(users);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);

    const { userId, isAdmin, isDisabled } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof isAdmin === 'boolean') updateData.isAdmin = isAdmin;
    if (typeof isDisabled === 'boolean') updateData.isDisabled = isDisabled;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ message: '✅ Cập nhật tài khoản thành công', user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
