import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { createJwtToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { cleanupUnverifiedAccounts } from '@/lib/authCleanup';

export async function POST(request: Request) {
  try {
    // 0. Tự động dọn dẹp tài khoản chưa xác thực quá 24h
    await cleanupUnverifiedAccounts();

    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { username, password } = validation.data;

    // Tìm người dùng trong DB
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 404 });
    }

    // So sánh mật khẩu
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Mật khẩu không chính xác' }, { status: 401 });
    }

    // Chặn đăng nhập nếu chưa xác thực Email
    if (user.email && user.isEmailVerified === false) {
      return NextResponse.json(
        {
          error: 'Tài khoản chưa xác thực Email! Vui lòng nhập mã OTP để kích hoạt tài khoản.',
          requiresEmailVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    // Tạo JWT token sử dụng jose
    const token = await createJwtToken({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    const response = NextResponse.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
