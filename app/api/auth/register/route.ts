import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  // Kiểm tra đầu vào
  if (!username || !password) {
    return NextResponse.json({ error: 'Thiếu username hoặc password' }, { status: 400 });
  }

  try {
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username đã được sử dụng' }, { status: 409 });
    }

    // Mã hoá password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'Tạo tài khoản thành công', user: { id: newUser.id, username: newUser.username } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
