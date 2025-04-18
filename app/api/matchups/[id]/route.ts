// app/api/matchups/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 👇 CHỈ cần 1 argument context chứa params
export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id);

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
  } catch (err) {
    console.error('❌ Lỗi server:', err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}