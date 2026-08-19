import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { registerSchema } from '@/lib/validations';
import { sendOtpEmail } from '@/lib/mailer';
import { cleanupUnverifiedAccounts } from '@/lib/authCleanup';

export async function POST(request: Request) {
  try {
    // 0. Tự động dọn dẹp tài khoản chưa xác thực quá 24h
    await cleanupUnverifiedAccounts();

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

    // 3. Tạo mã OTP 6 chữ số và hạn sử dụng 15 phút
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Tạo tài khoản mới với isEmailVerified = false và emailVerifyExpires = +15m
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerifyCode: otpCode,
        emailVerifyExpires: expiresAt,
      },
    });

    // 5. Gửi Email thật chứa mã OTP qua Nodemailer Gmail SMTP
    let emailSent = false;
    if (email) {
      const mailResult = await sendOtpEmail(email, otpCode, username);
      emailSent = mailResult.success;
    }

    return NextResponse.json({
      message: emailSent
        ? 'Tạo tài khoản thành công! Mã OTP xác thực (hạn 15 phút) đã được gửi tới email của bạn.'
        : 'Tạo tài khoản thành công! Vui lòng nhập mã OTP xác thực.',
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
      requiresEmailVerification: true,
      emailSent,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
