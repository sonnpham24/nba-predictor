import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: 'Thiếu username hoặc password' }, { status: 400 });
  }

  try {
    // Tìm người dùng trong DB
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 404 });
    }

    // So sánh mật khẩu
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Sai mật khẩu' }, { status: 401 });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin, // ✅ thêm dòng này
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );    

    // 👉 Tạo response
    const response = NextResponse.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin, // 👈 thêm dòng này
      },      
    });

    // 👉 Gắn token vào cookie (HttpOnly)
    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

