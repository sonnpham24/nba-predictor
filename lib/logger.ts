import prisma from '@/lib/prisma';

export async function logSystemEvent(
  action: string,
  details: string,
  level: 'INFO' | 'WARNING' | 'ERROR' = 'INFO'
) {
  try {
    console.log(`[${level}] ${action}: ${details}`);
    await prisma.systemLog.create({
      data: {
        action,
        details,
        level,
      },
    });
  } catch (err) {
    console.error('Failed to create system log:', err);
  }
}
