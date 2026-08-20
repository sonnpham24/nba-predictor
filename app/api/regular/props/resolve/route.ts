import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { resolveAndSettleProp } from '@/lib/propSettlement';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { propId, resolvedOutcome, actualStatValue } = await req.json();

    const pId = parseInt(propId);
    if (isNaN(pId) || (resolvedOutcome !== 'YES' && resolvedOutcome !== 'NO')) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const prop = await prisma.regularProp.findUnique({ where: { id: pId } });
    if (!prop) {
      return NextResponse.json({ error: 'Không tìm thấy câu hỏi Prop' }, { status: 404 });
    }

    // Chỉ Admin hoặc Người tạo Prop mới được chốt kết quả thủ công
    if (!user.isAdmin && prop.creatorId !== user.id) {
      return NextResponse.json({ error: 'Bạn không có quyền chốt kết quả câu hỏi này' }, { status: 403 });
    }

    const result = await resolveAndSettleProp(pId, resolvedOutcome, actualStatValue);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
