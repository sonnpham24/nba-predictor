import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        displayName: true,
        bio: true,
        favoriteTeamId: true,
        favoriteTeam: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return NextResponse.json(userData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { displayName, bio, favoriteTeamId } = await req.json();

    const parsedFavTeamId = favoriteTeamId ? parseInt(favoriteTeamId) : null;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: displayName || null,
        bio: bio || null,
        favoriteTeamId: parsedFavTeamId,
      },
      include: {
        favoriteTeam: true,
      },
    });

    return NextResponse.json({
      message: 'Cập nhật thông tin thành công!',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        favoriteTeam: updatedUser.favoriteTeam,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
