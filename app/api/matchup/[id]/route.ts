import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const idStr = params.id;
  const matchupId = parseInt(idStr);

  if (isNaN(matchupId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
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
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}


