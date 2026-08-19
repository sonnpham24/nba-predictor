'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AllPredictionsPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/predictions/public');
        const data = await res.json();
        setPredictions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-black gradient-text-gold tracking-tight">
          🌐 CỘNG ĐỒNG DỰ ĐOÁN PLAYOFF
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-medium">
          Xem tất cả bản dự đoán công khai từ những người chơi khác
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : predictions.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-white/10 text-center text-slate-400 max-w-md mx-auto">
          <p className="text-lg font-semibold">Chưa có dự đoán nào được công khai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {predictions.map((p) => (
            <div
              key={p.id}
              className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <span className="text-sm font-black text-white">{p.matchup.teamA} vs {p.matchup.teamB}</span>
                  <span className="text-xs text-amber-400 font-bold">👤 {p.user.username}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p>
                    🧠 <strong>Dự đoán:</strong> <span className="text-amber-400 font-bold">{p.predictedWinner}</span> thắng <span className="font-mono">{p.predictedScore}</span>
                  </p>
                  <p>
                    📊 <strong>Kết quả thực tế:</strong>{' '}
                    {p.matchup.actualWinner ? (
                      <span className="text-emerald-400 font-bold">
                        {p.matchup.actualWinner} ({p.matchup.actualScore})
                      </span>
                    ) : (
                      <span className="text-slate-500 font-semibold">⏳ Chưa có</span>
                    )}
                  </p>
                </div>
              </div>

              <Link
                href={`/matchup/${p.matchup.id}`}
                className="text-xs font-bold text-amber-400 hover:underline inline-block pt-2"
              >
                ➡️ Xem chi tiết trận đấu →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
