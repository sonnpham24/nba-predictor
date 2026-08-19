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
        isAdmin: true,
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

    const { userId, isAdmin } = await req.json();

    if (!userId || typeof isAdmin !== 'boolean') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
    });

    return NextResponse.json({ message: '✅ Cập nhật quyền người dùng thành công', user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
