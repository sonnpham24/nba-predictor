'use client';

import { requireLoginClient } from '@/lib/requireLoginClient';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

function getMatchScoreBadge(p: any) {
  const { predictedWinner, predictedScore, matchup } = p;

  if (!matchup?.actualWinner || !matchup?.actualScore) {
    return (
      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold">
        ⏳ Chưa có kết quả
      </span>
    );
  }

  if (predictedWinner === matchup.actualWinner) {
    const [predA, predB] = predictedScore.split('-').map(Number);
    const [actA, actB] = matchup.actualScore.split('-').map(Number);
    const predictedTotalGames = predA + predB;
    const actualTotalGames = actA + actB;

    if (predA === actA && predB === actB) {
      return (
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black">
          ✅ Đúng hoàn toàn (+3 điểm)
        </span>
      );
    } else if (Math.abs(predictedTotalGames - actualTotalGames) === 1) {
      return (
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold">
          ✅ Đúng đội, lệch 1 game (+2 điểm)
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold">
          ✅ Đúng đội (+1 điểm)
        </span>
      );
    }
  }

  return (
    <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold">
      ❌ Dự đoán sai (0 điểm)
    </span>
  );
}

export default function MyPredictionsPage() {
  requireLoginClient();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const previousResultIds = useRef<Set<number>>(new Set());

  const fetchPredictions = async () => {
    try {
      const res = await fetch('/api/predictions/my');
      const data = await res.json();

      data.forEach((p: any) => {
        if (p.matchup?.actualWinner && !previousResultIds.current.has(p.id)) {
          toast.success(`✅ Kết quả trận ${p.teamA} vs ${p.teamB} đã có!`);
          previousResultIds.current.add(p.id);
        }
      });

      setPredictions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
    const interval = setInterval(() => {
      fetchPredictions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-black gradient-text-gold tracking-tight">
          📋 LỊCH SỬ DỰ ĐOÁN PLAYOFF CỦA BẠN
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-medium">
          Danh sách chi tiết các cặp đấu Playoff bạn đã tham gia bình chọn
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : predictions.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-white/10 text-center text-slate-400 max-w-md mx-auto">
          <p className="text-lg font-semibold mb-4">Bạn chưa dự đoán cặp Playoff nào.</p>
          <Link
            href="/predict"
            className="px-6 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase shadow-lg hover:bg-amber-400 transition"
          >
            Dự đoán ngay →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {predictions.map((p) => (
            <div
              key={p.id}
              className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-sm font-black text-white">{p.teamA} vs {p.teamB}</span>
                <div>{getMatchScoreBadge(p)}</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Đội bạn chọn:</span>
                  <span className="font-bold text-amber-400">{p.predictedWinner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Tỉ số dự đoán:</span>
                  <span className="font-bold text-white font-mono">{p.predictedScore}</span>
                </div>
                {p.matchup?.actualWinner && (
                  <div className="flex justify-between pt-2 border-t border-slate-800/60">
                    <span className="text-slate-400 font-medium">Kết quả thực tế:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {p.matchup.actualWinner} ({p.matchup.actualScore})
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
