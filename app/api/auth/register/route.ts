import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { registerSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { username, email, password, confirmPassword } = body;

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json({ error: 'Mật khẩu xác nhận không khớp!' }, { status: 400 });
    }

    // 1. Kiểm tra username đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username đã được sử dụng!' }, { status: 409 });
    }

    // 2. Kiểm tra email đã được đăng ký chưa (1 email chỉ 1 tài khoản)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json({ error: 'Email này đã được sử dụng để đăng ký tài khoản khác!' }, { status: 409 });
      }
    }

    // 3. Tạo mã xác thực OTP 6 chữ số
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Tạo tài khoản mới với isEmailVerified = false
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerifyCode: otpCode,
      },
    });

    return NextResponse.json({
      message: 'Tạo tài khoản thành công! Vui lòng xác thực email.',
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
      requiresEmailVerification: true,
      demoOtpCode: otpCode,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
