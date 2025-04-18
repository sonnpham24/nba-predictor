'use client';

import { useEffect, useState } from 'react';

export default function AllPredictionsPage() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/predictions/public');
      const data = await res.json();
      setPredictions(data);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-animate px-4 py-6 text-black">
      <div className="starry-background"></div>
      <h1 className="text-white text-2xl md:text-3xl font-bold text-center mb-6">
        🌐 Dự đoán của mọi người
      </h1>

      {predictions.length === 0 ? (
        <p className="text-center text-gray-200">Chưa có dự đoán nào được công khai.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {predictions.map((p: any) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow p-4 text-sm md:text-base break-words space-y-1"
            >
              <h2 className="text-base md:text-lg font-semibold text-black mb-1">
                {p.matchup.teamA} vs {p.matchup.teamB}
              </h2>
              <p>
                👤 <strong>Người chơi:</strong> {p.user.username}
              </p>
              <p>
                🧠 <strong>Dự đoán:</strong> {p.predictedWinner} thắng {p.predictedScore}
              </p>
              <p>
                📊 <strong>Kết quả:</strong>{' '}
                {p.matchup.actualWinner
                  ? `${p.matchup.actualWinner} thắng ${p.matchup.actualScore}`
                  : '⏳ Chưa có kết quả'}
              </p>
              <a
                href={`/matchup/${p.matchup.id}`}
                className="text-blue-600 underline text-xs md:text-sm block mt-2"
              >
                ➡️ Xem chi tiết trận đấu
              </a>
            </div>
          ))}
        </div>
      )}
      <div className="text-center text-sm text-white opacity-60 mt-10">
        {/* Footer spacing for mobile scroll */}
        Copyright © NBA Predict 2025 - by Son Pham phamcongson297@gmail.com
      </div>
    </div>
  );
}

