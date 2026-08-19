import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Vui lòng cung cấp địa chỉ Email' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản với địa chỉ Email này' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: 'Tài khoản này đã được xác thực trước đó!' }, { status: 400 });
    }

    // 1. Tạo mã OTP mới và gia hạn 15 phút
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyCode: newOtp,
        emailVerifyExpires: newExpiresAt,
      },
    });

    // 2. Gửi email OTP thật qua Nodemailer
    const mailResult = await sendOtpEmail(email, newOtp, user.username);

    if (!mailResult.success) {
      return NextResponse.json({ error: 'Không thể gửi email OTP. Vui lòng thử lại sau!' }, { status: 500 });
    }

    return NextResponse.json({
      message: '📧 Mã OTP mới (hạn 15 phút) đã được gửi tới email của bạn!',
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
