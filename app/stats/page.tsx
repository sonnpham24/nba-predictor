'use client';

import { useEffect, useState } from 'react';

export default function StatsPage() {
  const [activeSubTab, setActiveSubTab] = useState<'regular' | 'playoff'>('regular');
  const [regLeaderboard, setRegLeaderboard] = useState<any[]>([]);
  const [playoffLeaderboard, setPlayoffLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, pRes] = await Promise.all([
          fetch('/api/regular/leaderboard'),
          fetch('/api/leaderboard'),
        ]);

        if (rRes.ok) setRegLeaderboard(await rRes.json());
        if (pRes.ok) setPlayoffLeaderboard(await pRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentLeaderboard = activeSubTab === 'regular' ? regLeaderboard : playoffLeaderboard;
  const top1 = currentLeaderboard[0];
  const top2 = currentLeaderboard[1];
  const top3 = currentLeaderboard[2];
  const restList = currentLeaderboard.slice(3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-black gradient-text-gold tracking-tight">
          📊 BẢNG XẾP HẠNG CAO THỦ
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto font-medium">
          Vinh danh những nhà dự đoán chính xác nhất NBA Predictor 2025
        </p>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex justify-center space-x-3 mb-12">
        <button
          onClick={() => setActiveSubTab('regular')}
          className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 ${
            activeSubTab === 'regular'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🏀 Regular Season (+1 điểm)
        </button>
        <button
          onClick={() => setActiveSubTab('playoff')}
          className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 ${
            activeSubTab === 'playoff'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🏆 Playoff Predictor
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* TOP 3 PODIUM SECTION */}
          {currentLeaderboard.length >= 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
              {/* TOP 2 (SILVER) */}
              {top2 ? (
                <div className="glass-card p-6 rounded-3xl border border-slate-400/30 text-center flex flex-col items-center shadow-xl order-2 md:order-1">
                  <div className="w-16 h-16 rounded-full bg-slate-300/20 border-2 border-slate-300 flex items-center justify-center text-3xl font-black mb-3">
                    🥈
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Á QUÂN #2</span>
                  <h3 className="text-xl font-bold text-white mt-1">{top2.username}</h3>
                  <span className="text-2xl font-black text-slate-300 mt-2">{top2.score} pts</span>
                  {activeSubTab === 'regular' && (
                    <span className="text-xs text-slate-500 mt-1">Đoán đúng {top2.correctPredictions}/{top2.totalPredictions} trận</span>
                  )}
                </div>
              ) : <div className="order-2 md:order-1"></div>}

              {/* TOP 1 (GOLD) */}
              {top1 && (
                <div className="glass-card p-8 rounded-3xl border border-amber-400/50 text-center flex flex-col items-center shadow-2xl glow-amber order-1 md:order-2 scale-105 relative z-10 bg-slate-900/90">
                  <div className="absolute -top-5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black tracking-widest px-4 py-1 rounded-full uppercase shadow-md">
                    CHÍNH QUÁN TOP 1
                  </div>
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl font-black mb-3 mt-2">
                    🥇
                  </div>
                  <h3 className="text-2xl font-black text-white">{top1.username}</h3>
                  <span className="text-3xl font-black gradient-text-gold mt-2">{top1.score} pts</span>
                  {activeSubTab === 'regular' && (
                    <span className="text-xs text-amber-400/80 font-bold mt-1">Đoán đúng {top1.correctPredictions}/{top1.totalPredictions} trận</span>
                  )}
                </div>
              )}

              {/* TOP 3 (BRONZE) */}
              {top3 ? (
                <div className="glass-card p-6 rounded-3xl border border-amber-700/30 text-center flex flex-col items-center shadow-xl order-3 md:order-3">
                  <div className="w-16 h-16 rounded-full bg-amber-700/20 border-2 border-amber-600 flex items-center justify-center text-3xl font-black mb-3">
                    🥉
                  </div>
                  <span className="text-xs font-black text-amber-600 uppercase tracking-widest">HẠNG 3</span>
                  <h3 className="text-xl font-bold text-white mt-1">{top3.username}</h3>
                  <span className="text-2xl font-black text-amber-500 mt-2">{top3.score} pts</span>
                  {activeSubTab === 'regular' && (
                    <span className="text-xs text-slate-500 mt-1">Đoán đúng {top3.correctPredictions}/{top3.totalPredictions} trận</span>
                  )}
                </div>
              ) : <div className="order-3 md:order-3"></div>}
            </div>
          )}

          {/* LEADERBOARD TABLE */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">
              Danh sách Xếp Hạng Đầy Đủ
            </h3>

            {currentLeaderboard.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Chưa có dữ liệu điểm số.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-4 text-center">Thứ Hạng</th>
                      <th className="py-4 px-4">Người Chơi</th>
                      {activeSubTab === 'regular' && <th className="py-4 px-4 text-center">Tổng Dự Đoán</th>}
                      {activeSubTab === 'regular' && <th className="py-4 px-4 text-center">Đoán Đúng</th>}
                      <th className="py-4 px-4 text-right">Tổng Điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {currentLeaderboard.map((user, i) => (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-4 text-center font-black">
                          {i === 0 ? '🥇 #1' : i === 1 ? '🥈 #2' : i === 2 ? '🥉 #3' : `#${i + 1}`}
                        </td>
                        <td className="py-4 px-4 font-bold text-white">{user.username}</td>
                        {activeSubTab === 'regular' && <td className="py-4 px-4 text-center font-mono">{user.totalPredictions}</td>}
                        {activeSubTab === 'regular' && (
                          <td className="py-4 px-4 text-center font-bold text-emerald-400">{user.correctPredictions}</td>
                        )}
                        <td className="py-4 px-4 text-right font-black text-lg text-amber-400">{user.score} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
