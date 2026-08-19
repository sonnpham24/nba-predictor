'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface UserProfileModalProps {
  userId: number | null;
  onClose: () => void;
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const { t, locale } = useLanguage();
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUserProfile(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-amber-500/40 relative shadow-2xl animate-fade-in overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white font-bold text-xl transition"
        >
          ✕
        </button>

        {loading ? (
          <div className="py-16 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : !userProfile ? (
          <div className="text-center py-12 text-slate-400">
            Failed to load user profile.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header: Avatar, Name & Admin Checkmark */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                {userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-500 shadow-xl bg-slate-950"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-3xl flex items-center justify-center border-4 border-amber-400 shadow-xl">
                    {userProfile.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
                {userProfile.isAdmin && (
                  <span className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs font-black p-1 rounded-full shadow-lg border-2 border-slate-950" title="Verified Admin">
                    ☑️
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-center space-x-2">
                  <h3 className="text-2xl font-black text-white leading-normal break-words">
                    {userProfile.displayName || userProfile.username}
                  </h3>
                  {userProfile.isAdmin && (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      ☑️ {t.verifiedAdminCheckmark}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono">@{userProfile.username}</span>
              </div>

              {userProfile.bio && (
                <p className="text-xs text-slate-300 max-w-sm italic bg-slate-900/60 p-3 rounded-2xl border border-slate-800 leading-normal break-words">
                  "{userProfile.bio}"
                </p>
              )}
            </div>

            {/* Supported NBA Team Badge */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase leading-normal">
                {t.supportedTeam}
              </span>
              {userProfile.favoriteTeam ? (
                <Link
                  href={`/team/${userProfile.favoriteTeam.id}`}
                  onClick={onClose}
                  className="flex items-center space-x-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition group"
                >
                  <img
                    src={userProfile.favoriteTeam.logo}
                    alt={userProfile.favoriteTeam.name}
                    className="w-6 h-6 object-contain group-hover:scale-110 transition"
                  />
                  <span className="text-xs font-extrabold text-amber-400">
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
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="glass-card p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-normal">
                  {t.totalScore}
                </span>
                <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                  {userProfile.stats?.totalScore || 0} pts
                </div>
              </div>

              <div className="glass-card p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-normal">
                  {t.correctPicks}
                </span>
                <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                  {userProfile.stats?.totalCorrect || 0}
                </div>
              </div>

              <div className="glass-card p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-normal">
                  {t.totalPicks}
                </span>
                <div className="text-xl font-black text-blue-400 font-mono mt-0.5">
                  {userProfile.stats?.totalPicks || 0}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-500 font-mono">
                {t.memberSince}: {new Date(userProfile.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN')}
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-extrabold text-white rounded-xl transition"
              >
                {t.closeProfile}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
