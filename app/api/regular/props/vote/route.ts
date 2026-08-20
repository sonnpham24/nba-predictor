import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { propId, vote } = await req.json();

    const pId = parseInt(propId);
    if (isNaN(pId) || (vote !== 'YES' && vote !== 'NO')) {
      return NextResponse.json({ error: 'Dữ liệu bình chọn không hợp lệ' }, { status: 400 });
    }

    const prop = await prisma.regularProp.findUnique({
      where: { id: pId },
      include: { matchup: true },
    });

    if (!prop) {
      return NextResponse.json({ error: 'Không tìm thấy câu hỏi dự đoán' }, { status: 404 });
    }

    const now = new Date();
    if (now >= new Date(prop.matchup.lockTime)) {
      return NextResponse.json({ error: 'Trận đấu đã khóa dự đoán' }, { status: 400 });
    }

    if (prop.isResolved) {
      return NextResponse.json({ error: 'Câu hỏi dự đoán đã chốt kết quả' }, { status: 400 });
    }

    const propVote = await prisma.propVote.upsert({
      where: {
        userId_propId: {
          userId: user.id,
          propId: pId,
        },
      },
      update: { vote },
      create: {
        userId: user.id,
        propId: pId,
        vote,
      },
    });

    return NextResponse.json({
      message: `✅ Đã lưu bình chọn: ${vote}`,
      vote: propVote,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
