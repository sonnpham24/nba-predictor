import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // ✅ Trích xuất ID từ URL
    const url = new URL(req.url);
    const idStr = url.pathname.split('/').pop(); // lấy phần cuối của URL

    const matchupId = parseInt(idStr || '');

    if (isNaN(matchupId)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const matchup = await prisma.matchup.findUnique({
      where: { id: matchupId },
      include: {
        predictions: {
          include: {
            user: {
              select: { username: true },
            },
          },
        },
      },
    });

    if (!matchup) {
      return NextResponse.json({ error: 'Không tìm thấy trận đấu' }, { status: 404 });
    }

    return NextResponse.json(matchup);
  } catch (err) {
    console.error('❌ Lỗi server:', err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}