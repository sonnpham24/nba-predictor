import prisma from '@/lib/prisma';
import { logSystemEvent } from '@/lib/logger';

export async function resolveAndSettleProp(
  propId: number,
  resolvedOutcome: 'YES' | 'NO',
  actualStatValue?: number | null
) {
  const prop = await prisma.regularProp.findUnique({
    where: { id: propId },
    include: { votes: true },
  });

  if (!prop) {
    throw new Error('Không tìm thấy câu hỏi Prop');
  }

  if (prop.isSettled) {
    return { success: true, message: 'Prop đã được settle trước đó', prop };
  }

  const votesYes = prop.votes.filter((v) => v.vote === 'YES').length;
  const votesNo = prop.votes.filter((v) => v.vote === 'NO').length;

  // QUY TẮC PHE ĐỐI LẬP (Opposite Vote Requirement):
  // Phải có ít nhất 1 người dùng chọn phe ngược lại (votesYes > 0 VÀ votesNo > 0) thì mới được tính điểm!
  const hasOppositeVote = votesYes > 0 && votesNo > 0;

  let winnersCount = 0;

  if (hasOppositeVote) {
    // Tìm danh sách người thắng (chọn đúng resolvedOutcome)
    const winningVotes = prop.votes.filter((v) => v.vote === resolvedOutcome);
    winnersCount = winningVotes.length;

    // Cộng +1 điểm cho những người chơi đoán đúng
    for (const wv of winningVotes) {
      await prisma.user.update({
        where: { id: wv.userId },
        data: {
          scoreAdjustment: {
            increment: 1,
          },
        },
      });
    }
  }

  const updatedProp = await prisma.regularProp.update({
    where: { id: propId },
    data: {
      actualStatValue: actualStatValue !== undefined ? actualStatValue : prop.actualStatValue,
      resolvedOutcome,
      isResolved: true,
      isSettled: true,
    },
  });

  const detailLog = hasOppositeVote
    ? `Đã chốt Prop #${propId} ("${prop.question}") -> Kết quả: ${resolvedOutcome}. Đã cộng +1 điểm cho ${winnersCount} người đoán đúng (Votes: YES ${votesYes} - NO ${votesNo}).`
    : `Đã chốt Prop #${propId} ("${prop.question}") -> Kết quả: ${resolvedOutcome}. KHÔNG CỘNG ĐIỂM vì thiếu phe đối lập (Votes: YES ${votesYes} - NO ${votesNo}).`;

  await logSystemEvent('SETTLE_PROP_BET', detailLog, 'INFO');

  return {
    success: true,
    hasOppositeVote,
    winnersCount,
    resolvedOutcome,
    prop: updatedProp,
    message: detailLog,
  };
}
