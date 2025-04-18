'use client';

import { requireLoginClient } from '@/lib/requireLoginClient';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

function getMatchScore(p: any): string {
  const { predictedWinner, predictedScore, matchup } = p;

  if (!matchup?.actualWinner || !matchup?.actualScore) {
    return '⏳ Chưa có kết quả';
  }

  if (predictedWinner === matchup.actualWinner) {
    const [predA, predB] = predictedScore.split('-').map(Number);
    const [actA, actB] = matchup.actualScore.split('-').map(Number);
    const predictedTotalGames = predA + predB;
    const actualTotalGames = actA + actB;

    if (predA === actA && predB === actB) return '✅ 3 điểm';
    else if (Math.abs(predictedTotalGames - actualTotalGames) === 1) return '✅ 2 điểm';
    else return '✅ 1 điểm';
  }

  return '❌ 0 điểm';
}

export default function MyPredictionsPage() {
  requireLoginClient();
  const [predictions, setPredictions] = useState([]);
  const previousResultIds = useRef<Set<number>>(new Set());

  const fetchPredictions = async () => {
    const res = await fetch('/api/predictions/my');
    const data = await res.json();

    data.forEach((p: any) => {
      if (p.matchup?.actualWinner && !previousResultIds.current.has(p.id)) {
        toast.success(`✅ Kết quả trận ${p.teamA} vs ${p.teamB} đã có!`);
        previousResultIds.current.add(p.id);
      }
    });

    setPredictions(data);
  };

  useEffect(() => {
    fetchPredictions();

    const interval = setInterval(() => {
      fetchPredictions();
    }, 30000); // mỗi 30 giây

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-animate px-4 py-6 text-black">
      <div className="starry-background"></div>
      <h1 className="text-white text-2xl md:text-3xl font-bold text-center mb-6">📋 Dự đoán của bạn</h1>

      {predictions.length === 0 ? (
        <p className="text-center text-gray-200">Bạn chưa dự đoán cặp nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.map((p: any) => (
            <div
              key={p.id}
              className="p-4 bg-white rounded-xl shadow border space-y-2 break-words"
            >
              <h2 className="text-base md:text-lg font-semibold">
                {p.teamA} vs {p.teamB}
              </h2>
              <p className="text-sm md:text-base">
                <strong>Đội thắng:</strong> {p.predictedWinner}
              </p>
              <p className="text-sm md:text-base">
                <strong>Tỷ số:</strong> {p.predictedScore}
              </p>
              <p className="mt-1 text-blue-600 font-semibold text-sm md:text-base">
                {getMatchScore(p)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-sm text-white opacity-60 mt-10">
        Copyright © NBA Predict 2025 - by Son Pham phamcongson297@gmail.com
      </div>
    </div>
  );
}


