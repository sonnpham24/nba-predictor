import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/auth';
import { lockTimeSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);

    const body = await req.json();
    const validation = lockTimeSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { matchupId, lockTime } = validation.data;

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
