import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Thiếu email hoặc mã xác nhận' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản với email này' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ message: 'Email đã được xác thực trước đó' });
    }

    // Kiểm tra hết hạn 15 phút
    if (user.emailVerifyExpires && new Date() > user.emailVerifyExpires) {
      return NextResponse.json(
        { error: 'Mã OTP đã hết hạn (quá 15 phút)! Vui lòng bấm "Gửi lại mã OTP" để nhận mã mới.' },
        { status: 400 }
      );
    }

    if (user.emailVerifyCode !== code) {
      return NextResponse.json({ error: 'Mã OTP không chính xác!' }, { status: 400 });
    }

    // Cập nhật isEmailVerified = true và xóa OTP code/expires
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyCode: null,
        emailVerifyExpires: null,
      },
    });

    return NextResponse.json({ message: '✅ Xác thực email thành công! Bây giờ bạn có thể đăng nhập.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
