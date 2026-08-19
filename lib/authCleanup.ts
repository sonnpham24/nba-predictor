import prisma from '@/lib/prisma';
import { logSystemEvent } from '@/lib/logger';

/**
 * Tự động xóa các tài khoản rác chưa xác thực Email sau 24 giờ.
 * Giải phóng Email và Username cho người dùng khác đăng ký.
 */
export async function cleanupUnverifiedAccounts() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const deleted = await prisma.user.deleteMany({
      where: {
        isEmailVerified: false,
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
    });

    if (deleted.count > 0) {
      await logSystemEvent(
        'CLEANUP_UNVERIFIED_ACCOUNTS',
        `Đã tự động xóa ${deleted.count} tài khoản rác chưa xác thực Email sau 24 giờ.`,
        'INFO'
      );
    }

    return deleted.count;
  } catch (err: any) {
    console.error('Error cleaning up unverified accounts:', err);
    return 0;
  }
}
