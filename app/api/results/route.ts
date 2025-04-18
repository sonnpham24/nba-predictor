import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // ✅ Check quyền admin từ request
    requireAdminFromRequest(req);

    const { matchupId, actualWinner, actualScore, lockTime } = await req.json();

    if (!matchupId || !actualWinner || !actualScore) {
      return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });
    }

    const updated = await prisma.matchup.update({
      where: { id: matchupId },
      data: {
        actualWinner,
        actualScore,
        lockTime: lockTime ? new Date(lockTime) : undefined,
      },
    });

    return NextResponse.json({ message: '✅ Đã cập nhật kết quả', updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
