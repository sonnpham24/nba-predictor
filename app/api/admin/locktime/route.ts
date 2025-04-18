import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    requireAdminFromRequest(req);

    const { matchupId, lockTime } = await req.json();

    if (!matchupId || !lockTime) {
      return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });
    }

    const updated = await prisma.matchup.update({
      where: { id: matchupId },
      data: { lockTime: new Date(lockTime) },
    });

    return NextResponse.json({ message: '✅ Cập nhật lock time thành công', updated });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}

