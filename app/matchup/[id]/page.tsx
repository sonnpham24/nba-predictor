'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function calculateScore(pred: any, matchup: any): number {
  if (!matchup.actualWinner || !matchup.actualScore) return -1;
  if (pred.predictedWinner !== matchup.actualWinner) return 0;

  const [predA, predB] = pred.predictedScore.split('-').map(Number);
  const [actA, actB] = matchup.actualScore.split('-').map(Number);
  const predTotal = predA + predB;
  const actTotal = actA + actB;

  if (predA === actA && predB === actB) return 3;
  if (Math.abs(predTotal - actTotal) === 1) return 2;
  return 1;
}

function getSummaryStats(predictions: any[], matchup: any) {
  const result = {
    total: predictions.length,
    correctTeam: 0,
    exactScore: 0,
    oneGameOff: 0,
    moreThanOneGameOff: 0,
    wrongTeam: 0,
  };

  predictions.forEach((p) => {
    if (p.predictedWinner === matchup.actualWinner) {
      result.correctTeam++;
      const [predA, predB] = p.predictedScore.split('-').map(Number);
      const [actA, actB] = matchup.actualScore.split('-').map(Number);

      if (predA === actA && predB === actB) {
        result.exactScore++;
      } else if (Math.abs((predA + predB) - (actA + actB)) === 1) {
        result.oneGameOff++;
      } else {
        result.moreThanOneGameOff++;
      }
    } else {
      result.wrongTeam++;
    }
  });

  return result;
}

export default function MatchupDetailsPage() {
  const { id } = useParams();
  const [matchup, setMatchup] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchMatchup = async () => {
      try {
        const res = await fetch(`/api/matchups/${id}`);
        if (!res.ok) {
          setError('Không thể tải dữ liệu từ server.');
          return;
        }
        const data = await res.json();
        setMatchup(data);
      } catch (err) {
        console.error(err);
        setError('Đã xảy ra lỗi khi tải dữ liệu.');
      }
    };

    fetchMatchup();
  }, [id]);

  if (error) {
    return <p className="p-6 text-center text-red-500">❌ {error}</p>;
  }

  if (!matchup) {
    return <p className="p-6 text-center">Đang tải...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-animate text-black p-4 sm:p-6">
      <div className="starry-background"></div>
      <h1 className="text-white text-2xl sm:text-3xl font-bold text-center mb-6">
        🔍 Chi tiết: {matchup.teamA} vs {matchup.teamB}
      </h1>

      <div className="bg-white rounded-xl p-4 shadow max-w-2xl mx-auto text-sm sm:text-base space-y-2 mb-6">
        <p><strong>Conference:</strong> {matchup.conference.toUpperCase()}</p>
        <p><strong>Vòng:</strong> {matchup.round}</p>
        <p>
          <strong>Kết quả:</strong>{' '}
          {matchup.actualWinner
            ? `${matchup.actualWinner} thắng ${matchup.actualScore}`
            : '⏳ Chưa có kết quả'}
        </p>

        {matchup.actualWinner && (() => {
          const stats = getSummaryStats(matchup.predictions, matchup);
          return (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-bold mb-2 text-blue-700">📊 Phân tích tổng hợp</h3>
              <ul className="text-sm space-y-1">
                <li>👥 Tổng số dự đoán: {stats.total}</li>
                <li>✅ Đúng đội thắng: {stats.correctTeam}</li>
                <ul className="ml-4 list-disc">
                  <li>🎯 Đúng tỷ số: {stats.exactScore}</li>
                  <li>📏 Lệch 1 trận: {stats.oneGameOff}</li>
                  <li>➖ Lệch &gt;1 trận: {stats.moreThanOneGameOff}</li>
                </ul>
                <li>❌ Sai đội: {stats.wrongTeam}</li>
              </ul>

              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: '🎯 Đúng tỷ số', value: stats.exactScore },
                        { name: '📏 Lệch 1 trận', value: stats.oneGameOff },
                        { name: '➖ Lệch >1 trận', value: stats.moreThanOneGameOff },
                        { name: '❌ Sai đội', value: stats.wrongTeam },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      <Cell fill="#4ade80" />
                      <Cell fill="#facc15" />
                      <Cell fill="#fb923c" />
                      <Cell fill="#f87171" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })()}
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4 text-white">📋 Danh sách dự đoán</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto text-sm sm:text-base">
        {matchup.predictions.length === 0 ? (
          <p className="text-center text-gray-200 col-span-2">Chưa có ai dự đoán trận này.</p>
        ) : (
          matchup.predictions.map((p: any) => {
            const score = calculateScore(p, matchup);
            return (
              <div
                key={p.id}
                className="bg-white p-4 rounded-xl shadow border"
              >
                <p><strong>{p.user.username}</strong></p>
                <p>{p.predictedWinner} thắng {p.predictedScore}</p>
                {score >= 0 && (
                  <p className="text-blue-600 font-semibold mt-1">
                    ✅ {score} điểm
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="text-center text-sm text-white opacity-60 mt-10">
        {/* Footer spacing for mobile scroll */}
        Copyright © NBA Predict 2025 - by Son Pham phamcongson297@gmail.com
      </div>
    </div>
  );
}

