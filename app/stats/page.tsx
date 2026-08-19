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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">📊 Bảng Xếp Hạng Người Dùng</h1>
        <p className="text-slate-400 text-sm mt-2">Bảng vinh danh những người chơi xuất sắc nhất NBA Predictor 2025</p>
      </div>

      {/* Sub Tabs */}
      <div className="flex justify-center space-x-3 mb-8">
        <button
          onClick={() => setActiveSubTab('regular')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeSubTab === 'regular'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          🏀 Regular Season (+1 điểm)
        </button>
        <button
          onClick={() => setActiveSubTab('playoff')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeSubTab === 'playoff'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          🏆 Playoff Predictor
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : activeSubTab === 'regular' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-4">🏀 Bảng Xếp Hạng Regular Season</h2>
          {regLeaderboard.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Chưa có dữ liệu dự đoán nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Hạng</th>
                    <th className="py-3 px-4">Người chơi</th>
                    <th className="py-3 px-4 text-center">Tổng dự đoán</th>
                    <th className="py-3 px-4 text-center">Đoán đúng</th>
                    <th className="py-3 px-4 text-right">Tổng điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {regLeaderboard.map((user, i) => (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-black text-amber-400">
                        {i === 0 ? '🥇 1' : i === 1 ? '🥈 2' : i === 2 ? '🥉 3' : `#${i + 1}`}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{user.username}</td>
                      <td className="py-3 px-4 text-center font-mono">{user.totalPredictions}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-400">{user.correctPredictions}</td>
                      <td className="py-3 px-4 text-right font-black text-lg text-amber-400">{user.score} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-4">🏆 Bảng Xếp Hạng Playoff Predictor</h2>
          {playoffLeaderboard.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Chưa có dữ liệu điểm số Playoff.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Hạng</th>
                    <th className="py-3 px-4">Người chơi</th>
                    <th className="py-3 px-4 text-right">Tổng điểm Playoff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {playoffLeaderboard.map((user, i) => (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-black text-amber-400">
                        {i === 0 ? '🥇 1' : i === 1 ? '🥈 2' : i === 2 ? '🥉 3' : `#${i + 1}`}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{user.username}</td>
                      <td className="py-3 px-4 text-right font-black text-lg text-amber-400">{user.score} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
