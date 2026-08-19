'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import VerifiedBadge from '@/components/VerifiedBadge';
import UserProfileModal from '@/components/UserProfileModal';

export default function StatsPage() {
  const { t, locale } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/regular/leaderboard');
        if (res.ok) setLeaderboard(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Helper to render Avatar, Favorite Team Logo, Username & Admin Checkmark
  const renderUserBadge = (userObj: any) => {
    if (!userObj) return null;
    return (
      <div
        onClick={() => setSelectedUserId(userObj.id)}
        className="inline-flex items-center space-x-2 cursor-pointer hover:opacity-80 transition"
        title="View profile"
      >
        {/* User Avatar */}
        {userObj.avatar ? (
          <img
            src={userObj.avatar}
            alt={userObj.username}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-500/40 bg-slate-950 flex-shrink-0"
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs flex-shrink-0">
            {userObj.username.substring(0, 2).toUpperCase()}
          </div>
        )}

        {/* Favorite Team Logo */}
        {userObj.favoriteTeam && (
          <img
            src={userObj.favoriteTeam.logo}
            alt={userObj.favoriteTeam.name}
            title={userObj.favoriteTeam.name}
            className="w-5 h-5 object-contain flex-shrink-0"
          />
        )}

        {/* Username / Display Name */}
        <span className="font-bold text-white leading-normal break-words">
          {userObj.displayName || userObj.username}
        </span>

        {/* Sleek SVG Verified Admin Checkmark */}
        {userObj.isAdmin && <VerifiedBadge />}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-black gradient-text-gold tracking-tight uppercase leading-normal break-words">
          {t.leaderboardTitle}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto font-medium leading-normal break-words">
          {t.leaderboardSub}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* TOP 3 PODIUM SECTION */}
          {leaderboard.length >= 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
              {/* TOP 2 (SILVER) */}
              {top2 ? (
                <div className="glass-card p-6 rounded-3xl border border-slate-400/30 text-center flex flex-col items-center shadow-xl order-2 md:order-1">
                  <div className="w-16 h-16 rounded-full bg-slate-300/20 border-2 border-slate-300 flex items-center justify-center text-3xl font-black mb-3">
                    🥈
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-normal">
                    {locale === 'en' ? 'RUNNER UP #2' : 'Á QUÂN #2'}
                  </span>
                  <div className="mt-2">
                    {renderUserBadge(top2)}
                  </div>
                  <span className="text-2xl font-black text-slate-300 mt-2 font-mono">{top2.totalScore} pts</span>
                  <span className="text-xs text-slate-400 mt-1 leading-normal font-medium">
                    Reg: {top2.regularScore} pts | Playoff: {top2.playoffScore} pts
                  </span>
                </div>
              ) : <div className="order-2 md:order-1"></div>}

              {/* TOP 1 (GOLD) */}
              {top1 && (
                <div className="glass-card p-8 rounded-3xl border border-amber-400/50 text-center flex flex-col items-center shadow-2xl glow-amber order-1 md:order-2 scale-105 relative z-10 bg-slate-900/90">
                  <div className="absolute -top-5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black tracking-widest px-4 py-1 rounded-full uppercase shadow-md">
                    {locale === 'en' ? 'CHAMPION TOP 1' : 'CHÍNH QUÁN TOP 1'}
                  </div>
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl font-black mb-3 mt-2">
                    🥇
                  </div>
                  <div className="mt-1">
                    {renderUserBadge(top1)}
                  </div>
                  <span className="text-3xl font-black gradient-text-gold mt-2 font-mono">{top1.totalScore} pts</span>
                  <span className="text-xs text-amber-400/90 font-extrabold mt-1 leading-normal">
                    Reg: {top1.regularScore} pts | Playoff: {top1.playoffScore} pts
                  </span>
                </div>
              )}

              {/* TOP 3 (BRONZE) */}
              {top3 ? (
                <div className="glass-card p-6 rounded-3xl border border-amber-700/30 text-center flex flex-col items-center shadow-xl order-3 md:order-3">
                  <div className="w-16 h-16 rounded-full bg-amber-700/20 border-2 border-amber-600 flex items-center justify-center text-3xl font-black mb-3">
                    🥉
                  </div>
                  <span className="text-xs font-black text-amber-600 uppercase tracking-widest leading-normal">
                    {locale === 'en' ? 'RANK #3' : 'HẠNG 3'}
                  </span>
                  <div className="mt-2">
                    {renderUserBadge(top3)}
                  </div>
                  <span className="text-2xl font-black text-amber-500 mt-2 font-mono">{top3.totalScore} pts</span>
                  <span className="text-xs text-slate-400 mt-1 leading-normal font-medium">
                    Reg: {top3.regularScore} pts | Playoff: {top3.playoffScore} pts
                  </span>
                </div>
              ) : <div className="order-3 md:order-3"></div>}
            </div>
          )}

          {/* CONSOLIDATED LEADERBOARD TABLE */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider leading-normal">
              {t.leaderboardTitle}
            </h3>

            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                {locale === 'en' ? 'No prediction data yet.' : 'Chưa có dữ liệu dự đoán.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-4 text-center leading-normal">{t.rank}</th>
                      <th className="py-4 px-4 leading-normal">{t.user}</th>
                      <th className="py-4 px-4 text-center leading-normal">{t.regularPoints} (+1)</th>
                      <th className="py-4 px-4 text-center leading-normal">{t.playoffPoints}</th>
                      <th className="py-4 px-4 text-center leading-normal">{t.correctPicks}</th>
                      <th className="py-4 px-4 text-right leading-normal">{t.totalScore}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {leaderboard.map((user, i) => (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-4 text-center font-black">
                          {i === 0 ? '🥇 #1' : i === 1 ? '🥈 #2' : i === 2 ? '🥉 #3' : `#${i + 1}`}
                        </td>
                        <td className="py-4 px-4">
                          {renderUserBadge(user)}
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-amber-400">{user.regularScore} pts</td>
                        <td className="py-4 px-4 text-center font-mono text-blue-400">{user.playoffScore} pts</td>
                        <td className="py-4 px-4 text-center font-bold text-emerald-400 leading-normal">{user.correctPredictions} / {user.totalPredictions}</td>
                        <td className="py-4 px-4 text-right font-black text-xl text-amber-400 font-mono">{user.totalScore} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Profile View Modal */}
      {selectedUserId && (
        <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
