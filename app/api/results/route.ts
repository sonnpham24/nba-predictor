import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/auth';
import { resultSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);

    const body = await req.json();
    const validation = resultSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { matchupId, actualWinner, actualScore } = validation.data;
    const lockTime = body.lockTime;

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
