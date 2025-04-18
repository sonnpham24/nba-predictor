import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // Lấy tất cả dự đoán + matchup tương ứng
  const predictions = await prisma.prediction.findMany({
    include: {
      user: true,
      matchup: true,
    },
  });

  const scores: { [userId: number]: { username: string; score: number } } = {};

  for (const prediction of predictions) {
    const { user, matchup, predictedWinner, predictedScore } = prediction;

    if (!matchup.actualWinner || !matchup.actualScore) continue;

    const username = user.username;

    // Khởi tạo nếu chưa có user
    if (!scores[user.id]) {
      scores[user.id] = { username, score: 0 };
    }

    // So sánh đội thắng
    if (predictedWinner === matchup.actualWinner) {
      const [predA, predB] = predictedScore.split('-').map(Number);
      const [actA, actB] = matchup.actualScore.split('-').map(Number);
    
      const predictedTotalGames = predA + predB;
      const actualTotalGames = actA + actB;
    
      if (predA === actA && predB === actB) {
        scores[user.id].score += 3; // Đúng hoàn toàn
      } else if (Math.abs(predictedTotalGames - actualTotalGames) === 1) {
        scores[user.id].score += 2; // Lệch đúng 1 game
      } else {
        scores[user.id].score += 1; // Đúng đội, lệch >1 → luôn 1 điểm
      }
    }
  }
         

  // Chuyển thành mảng và sort
  const result = Object.values(scores).sort((a, b) => b.score - a.score);

  return NextResponse.json(result);
}
