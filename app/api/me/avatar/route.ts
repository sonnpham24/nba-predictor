import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('avatar')) as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file ảnh được tải lên' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Kiểm tra định dạng file
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      return NextResponse.json({ error: 'Chỉ chấp nhận định dạng ảnh (jpg, png, webp, gif)' }, { status: 400 });
    }

    const fileName = `avatar-${user.id}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');

    // Tạo thư mục nếu chưa tồn tại
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const avatarUrl = `/uploads/avatars/${fileName}`;

    // Cập nhật CSDL
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({
      message: 'Tải ảnh đại diện thành công!',
      avatarUrl,
    });
  } catch (err: any) {
    console.error('Avatar upload error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi server khi upload ảnh' }, { status: 500 });
  }
}
