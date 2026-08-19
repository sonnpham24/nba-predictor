'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import VerifiedBadge from '@/components/VerifiedBadge';

export default function UserPublicProfilePage() {
  const { id } = useParams();
  const { t, locale } = useLanguage();
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/users/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUserProfile(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">User not found</h2>
        <Link href="/stats" className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-2xl">
          Back to Leaderboard
        </Link>
      </div>
    );
  }

  const recentPredictions: any[] = userProfile.recentPredictions || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/stats"
          className="inline-flex items-center space-x-2 text-xs font-black uppercase text-amber-400 hover:text-amber-300 transition bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl"
        >
          <span>← Back to Leaderboard</span>
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl space-y-8 text-center relative overflow-hidden">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-amber-500 shadow-2xl bg-slate-950 mx-auto"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-4xl flex items-center justify-center border-4 border-amber-400 shadow-2xl mx-auto">
                {userProfile.username.substring(0, 2).toUpperCase()}
              </div>
            )}
            {userProfile.isAdmin && (
              <span className="absolute bottom-0 right-0" title="Verified Admin">
                <VerifiedBadge />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-normal break-words">
                {userProfile.displayName || userProfile.username}
              </h1>
              {userProfile.isAdmin && <VerifiedBadge showText />}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">@{userProfile.username}</p>
          </div>

          {userProfile.bio && (
            <p className="text-sm text-slate-300 max-w-md italic bg-slate-900/60 p-4 rounded-2xl border border-slate-800 leading-normal break-words">
              "{userProfile.bio}"
            </p>
          )}
        </div>

        {/* Supported NBA Team Badge */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between max-w-md mx-auto">
          <span className="text-xs font-bold text-slate-400 uppercase leading-normal">
            {t.supportedTeam}
          </span>
          {userProfile.favoriteTeam ? (
            <Link
              href={`/team/${userProfile.favoriteTeam.id}`}
              className="flex items-center space-x-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-xl transition group"
            >
              <img
                src={userProfile.favoriteTeam.logo}
                alt={userProfile.favoriteTeam.name}
                className="w-7 h-7 object-contain group-hover:scale-110 transition"
              />
              <span className="text-xs font-black text-amber-400">
                {userProfile.favoriteTeam.name}
              </span>
            </Link>
          ) : (
            <span className="text-xs font-semibold text-slate-500 italic">
              {t.noSupportedTeam}
            </span>
          )}
        </div>

        {/* Prediction Stats Grid */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
          <div className="glass-card p-4 rounded-2xl border border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase leading-normal">
              {t.totalScore}
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {userProfile.stats?.totalScore || 0} pts
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase leading-normal">
              {t.correctPicks}
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {userProfile.stats?.totalCorrect || 0}
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase leading-normal">
              {t.totalPicks}
            </span>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1">
              {userProfile.stats?.totalPicks || 0}
            </div>
          </div>
        </div>

        {/* 10 Recent Predictions Section */}
        <div className="space-y-4 text-left max-w-md mx-auto pt-4 border-t border-slate-800">
          <h3 className="text-sm font-black text-white uppercase tracking-wider text-center">
            {t.recent10Predictions}
          </h3>
          {recentPredictions.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-4">{t.noPredictionsYet}</p>
          ) : (
            <div className="space-y-2">
              {recentPredictions.map((rp) => (
                <div
                  key={rp.id}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-300">
                    {rp.teamAName} vs {rp.teamBName}
                  </span>

                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-amber-400 font-mono">
                      Pick: {rp.myPick}
                    </span>
                    {rp.isSettled ? (
                      rp.isCorrect ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black">
                          +1 PT
                        </span>
                      ) : (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-black">
                          0 PT
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 font-mono pt-4 border-t border-slate-800">
          {t.memberSince}: {new Date(userProfile.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN')}
        </div>
      </div>
    </div>
  );
}
