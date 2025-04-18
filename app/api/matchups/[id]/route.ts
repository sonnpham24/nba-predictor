// app/api/matchups/[id]/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// ✅ Đúng định dạng cho App Router API routes (với params)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const matchup = await prisma.matchup.findUnique({
      where: { id },
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
  } catch (error) {
    console.error('❌ Lỗi khi lấy matchup:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
