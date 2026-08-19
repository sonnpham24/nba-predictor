'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import UserProfileModal from '@/components/UserProfileModal';

export default function StatsPage() {
  const { t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/regular/leaderboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setLeaderboard(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const restLeaderboard = leaderboard.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest mb-3">
          <span>🏆 GLOBAL HALL OF FAME 2026-27</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black gradient-text-gold tracking-tight uppercase leading-normal break-words">
          {t.leaderboardTitle}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 font-medium leading-normal break-words">
          {t.leaderboardSub}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Showcase */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 max-w-4xl mx-auto">
              {/* 2nd Place */}
              {top3[1] && (
                <div
                  onClick={() => setSelectedUserId(top3[1].id)}
                  className="glass-card p-6 rounded-3xl border border-slate-700/80 hover:border-slate-400 text-center flex flex-col items-center justify-between shadow-2xl hover:scale-105 transition duration-300 cursor-pointer order-2 md:order-1 relative group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg mb-3">
                    #2
                  </div>
                  {top3[1].avatar ? (
                    <img src={top3[1].avatar} alt={top3[1].username} className="w-16 h-16 rounded-full object-cover border-2 border-slate-300 shadow-md mb-2 bg-slate-950" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-800 text-white font-black text-xl flex items-center justify-center border border-slate-700 mb-2">
                      {top3[1].username.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex items-center space-x-1.5">
                    <span className="text-base font-black text-white group-hover:text-amber-400 transition leading-normal break-words">
                      {top3[1].displayName || top3[1].username}
                    </span>
                    {top3[1].isAdmin && <span title="Verified Admin" className="text-xs">☑️</span>}
                    {top3[1].favoriteTeam && (
                      <img src={top3[1].favoriteTeam.logo} alt={top3[1].favoriteTeam.name} title={top3[1].favoriteTeam.name} className="w-5 h-5 object-contain" />
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-mono">@{top3[1].username}</span>
                  <div className="text-2xl font-black text-slate-300 font-mono mt-3">
                    {top3[1].totalScore} <span className="text-xs text-slate-400 font-normal">pts</span>
                  </div>
                </div>
              )}

              {/* 1st Place Champion */}
              {top3[0] && (
                <div
                  onClick={() => setSelectedUserId(top3[0].id)}
                  className="glass-card p-8 rounded-3xl border-2 border-amber-500 text-center flex flex-col items-center justify-between shadow-2xl hover:scale-105 transition duration-300 cursor-pointer order-1 md:order-2 glow-amber relative group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-base flex items-center justify-center shadow-xl mb-3">
                    👑 #1
                  </div>
                  {top3[0].avatar ? (
                    <img src={top3[0].avatar} alt={top3[0].username} className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-xl mb-2 bg-slate-950" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-2xl flex items-center justify-center border-2 border-amber-300 mb-2">
                      {top3[0].username.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex items-center space-x-1.5">
                    <span className="text-lg font-black text-white group-hover:text-amber-400 transition leading-normal break-words">
                      {top3[0].displayName || top3[0].username}
                    </span>
                    {top3[0].isAdmin && <span title="Verified Admin" className="text-xs">☑️</span>}
                    {top3[0].favoriteTeam && (
                      <img src={top3[0].favoriteTeam.logo} alt={top3[0].favoriteTeam.name} title={top3[0].favoriteTeam.name} className="w-6 h-6 object-contain" />
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-mono">@{top3[0].username}</span>
                  <div className="text-3xl font-black text-amber-400 font-mono mt-3">
                    {top3[0].totalScore} <span className="text-xs text-amber-300 font-normal">pts</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div
                  onClick={() => setSelectedUserId(top3[2].id)}
                  className="glass-card p-6 rounded-3xl border border-amber-700/60 hover:border-amber-500 text-center flex flex-col items-center justify-between shadow-2xl hover:scale-105 transition duration-300 cursor-pointer order-3 relative group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-700 text-amber-100 font-black text-sm flex items-center justify-center shadow-lg mb-3">
                    #3
                  </div>
                  {top3[2].avatar ? (
                    <img src={top3[2].avatar} alt={top3[2].username} className="w-16 h-16 rounded-full object-cover border-2 border-amber-600 shadow-md mb-2 bg-slate-950" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-800 text-white font-black text-xl flex items-center justify-center border border-slate-700 mb-2">
                      {top3[2].username.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex items-center space-x-1.5">
                    <span className="text-base font-black text-white group-hover:text-amber-400 transition leading-normal break-words">
                      {top3[2].displayName || top3[2].username}
                    </span>
                    {top3[2].isAdmin && <span title="Verified Admin" className="text-xs">☑️</span>}
                    {top3[2].favoriteTeam && (
                      <img src={top3[2].favoriteTeam.logo} alt={top3[2].favoriteTeam.name} title={top3[2].favoriteTeam.name} className="w-5 h-5 object-contain" />
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-mono">@{top3[2].username}</span>
                  <div className="text-2xl font-black text-amber-500 font-mono mt-3">
                    {top3[2].totalScore} <span className="text-xs text-slate-400 font-normal">pts</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-4 text-center leading-normal">{t.rank}</th>
                    <th className="py-4 px-4 leading-normal">{t.user}</th>
                    <th className="py-4 px-4 text-center leading-normal">{t.totalPicks}</th>
                    <th className="py-4 px-4 text-center leading-normal">{t.correctPicks}</th>
                    <th className="py-4 px-4 text-center leading-normal">{t.regularPoints}</th>
                    <th className="py-4 px-4 text-center leading-normal">{t.playoffPoints}</th>
                    <th className="py-4 px-6 text-right leading-normal">{t.totalScore}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboard.map((lb, idx) => (
                    <tr
                      key={lb.id}
                      onClick={() => setSelectedUserId(lb.id)}
                      className="hover:bg-slate-800/40 transition cursor-pointer group"
                    >
                      <td className="py-4 px-4 text-center font-black font-mono text-amber-400">
                        #{idx + 1}
                      </td>
                      <td className="py-4 px-4 font-bold text-white leading-normal break-words">
                        <div className="flex items-center space-x-3">
                          {lb.avatar ? (
                            <img src={lb.avatar} alt={lb.username} className="w-9 h-9 rounded-full object-cover border border-amber-500/40 bg-slate-950" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs">
                              {lb.username.substring(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="flex flex-col">
                            <div className="flex items-center space-x-1.5">
                              <span className="group-hover:text-amber-400 transition font-black">
                                {lb.displayName || lb.username}
                              </span>
                              {lb.isAdmin && (
                                <span title="Verified Admin" className="text-xs">☑️</span>
                              )}
                              {lb.favoriteTeam && (
                                <img
                                  src={lb.favoriteTeam.logo}
                                  alt={lb.favoriteTeam.name}
                                  title={`Supports ${lb.favoriteTeam.name}`}
                                  className="w-5 h-5 object-contain drop-shadow"
                                />
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">@{lb.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-slate-300">{lb.totalPredictions}</td>
                      <td className="py-4 px-4 text-center font-bold text-emerald-400 font-mono">{lb.correctPredictions}</td>
                      <td className="py-4 px-4 text-center font-mono text-slate-400">{lb.regularScore}</td>
                      <td className="py-4 px-4 text-center font-mono text-slate-400">{lb.playoffScore}</td>
                      <td className="py-4 px-6 text-right font-black text-lg text-amber-400 font-mono">
                        {lb.totalScore} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* User Profile View Modal */}
      {selectedUserId && (
        <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
