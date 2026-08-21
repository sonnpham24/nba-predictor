'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import KofiButton from '@/components/KofiButton';

export default function LandingPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<{ username: string } | null>(null);

  // Interactive Live Prediction Teaser States
  const [demoPickedTeam, setDemoPickedTeam] = useState<'LAKERS' | 'WARRIORS' | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  const handlePickDemoTeam = (team: 'LAKERS' | 'WARRIORS') => {
    setDemoPickedTeam(team);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 px-5 py-2 rounded-full text-xs font-black text-amber-300 uppercase tracking-widest shadow-lg animate-pulse">
          <span>{t.landingBadge}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none uppercase">
          <span className="gradient-text-gold">{t.landingMainHeading}</span>
          <br />
          <span className="text-white text-3xl sm:text-5xl font-extrabold mt-2 block">
            {t.landingSubHeading}
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-medium leading-normal">
          {t.landingDescription}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {user ? (
            <>
              <Link
                href="/regular-season"
                className="w-full sm:w-auto px-9 py-4.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 hover:brightness-110 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/30 hover:scale-105 transition duration-300"
              >
                {t.landingBtnGoPredict}
              </Link>
              <Link
                href="/stats"
                className="w-full sm:w-auto px-8 py-4.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-sm border border-slate-700 shadow-lg hover:scale-105 transition duration-300"
              >
                {t.landingBtnViewLeaderboard}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="w-full sm:w-auto px-9 py-4.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 hover:brightness-110 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/30 hover:scale-105 transition duration-300"
              >
                {t.landingBtnCreateFree}
              </Link>
              <Link
                href="/auth"
                className="w-full sm:w-auto px-8 py-4.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-sm border border-slate-700 shadow-lg hover:scale-105 transition duration-300"
              >
                {t.landingBtnSignIn}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* INTERACTIVE MATCHUP PREDICTION TEASER FOR GUEST CONVERSION */}
      <div className="glass-card p-6 sm:p-10 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 shadow-2xl text-center space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-widest">
            {t.landingDemoBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t.landingDemoTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            {t.landingDemoSub}
          </p>
        </div>

        {/* Interactive Matchup Card */}
        <div className="max-w-2xl mx-auto glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
            <span>🔴 LIVE MATCHUP • TONIGHT 07:30 PM EST</span>
            <span className="text-amber-400 font-bold">🔒 Lock Time: 07:30 PM</span>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Team A: Lakers */}
            <button
              onClick={() => handlePickDemoTeam('LAKERS')}
              className={`p-5 rounded-2xl border-2 text-center transition duration-300 ${
                demoPickedTeam === 'LAKERS'
                  ? 'border-amber-400 bg-amber-500/20 scale-[1.02] shadow-lg shadow-amber-500/20'
                  : 'border-slate-800 bg-slate-900/90 hover:border-amber-500/50'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-purple-900 border-2 border-amber-400 text-amber-400 font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                LAL
              </div>
              <div className="font-black text-white text-base">L.A. Lakers</div>
              <div className="text-xs font-mono text-amber-400 font-bold mt-1">62% Picked</div>
              <div className="mt-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl transition">
                {demoPickedTeam === 'LAKERS' ? t.landingDemoPickedLakers : t.landingDemoPickLakers}
              </div>
            </button>

            {/* Team B: Warriors */}
            <button
              onClick={() => handlePickDemoTeam('WARRIORS')}
              className={`p-5 rounded-2xl border-2 text-center transition duration-300 ${
                demoPickedTeam === 'WARRIORS'
                  ? 'border-blue-400 bg-blue-500/20 scale-[1.02] shadow-lg shadow-blue-500/20'
                  : 'border-slate-800 bg-slate-900/90 hover:border-blue-500/50'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-blue-900 border-2 border-amber-400 text-yellow-400 font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                GSW
              </div>
              <div className="font-black text-white text-base">GS Warriors</div>
              <div className="text-xs font-mono text-blue-400 font-bold mt-1">38% Picked</div>
              <div className="mt-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase rounded-xl transition">
                {demoPickedTeam === 'WARRIORS' ? t.landingDemoPickedWarriors : t.landingDemoPickWarriors}
              </div>
            </button>
          </div>

          {/* Community Split Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
              <span className="text-amber-400">L.A. Lakers (62%)</span>
              <span className="text-blue-400">GS Warriors (38%)</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500" style={{ width: '62%' }} />
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500" style={{ width: '38%' }} />
            </div>
          </div>
        </div>

        {/* Guest Action Prompt upon Demo Selection */}
        {demoPickedTeam && (
          <div className="mt-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 max-w-md mx-auto space-y-3 animate-fade-in">
            <div className="text-xs font-black text-amber-300 uppercase">
              {t.landingDemoPromptTitle} {demoPickedTeam === 'LAKERS' ? 'L.A. LAKERS' : 'GS WARRIORS'} {t.landingDemoPromptSub}
            </div>
            <p className="text-xs text-slate-300">
              {t.landingDemoPromptDesc}
            </p>
            <Link
              href="/auth"
              className="inline-block px-8 py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition"
            >
              {t.landingDemoRegisterBtn}
            </Link>
          </div>
        )}
      </div>

      {/* Feature Grid Section (4 Core Platform Features) */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            CORE PLATFORM FEATURES
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t.landingWhyTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: Daily Matchup Predictions */}
          <Link
            href={user ? '/regular-season' : '/auth'}
            className="glass-card p-6 rounded-3xl border border-amber-500/30 hover:border-amber-400 transition duration-300 flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition">
                📅
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {t.landingFeatMainTag}
                </span>
                <h3 className="text-lg font-black text-white mt-2 mb-2">{t.landingFeat1Title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.landingFeat1Desc}</p>
              </div>
            </div>
            <div className="pt-4 text-xs font-black text-amber-400 group-hover:translate-x-1 transition">
              {user ? t.landingFeatActionPredict : t.landingFeatActionLocked}
            </div>
          </Link>

          {/* Feature 2: Yes/No Prop Bets */}
          <Link
            href={user ? '/regular-season' : '/auth'}
            className="glass-card p-6 rounded-3xl border border-white/10 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition">
                🎲
              </div>
              <div>
                <span className="text-[10px] font-black text-blue-400 uppercase bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  {t.landingFeatPropTag}
                </span>
                <h3 className="text-lg font-black text-white mt-2 mb-2">{t.landingFeat2Title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.landingFeat2Desc}</p>
              </div>
            </div>
            <div className="pt-4 text-xs font-black text-blue-400 group-hover:translate-x-1 transition">
              {user ? t.landingFeatActionProp : t.landingFeatActionLocked}
            </div>
          </Link>

          {/* Feature 3: Global Leaderboard */}
          <Link
            href={user ? '/stats' : '/auth'}
            className="glass-card p-6 rounded-3xl border border-white/10 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition">
                🏆
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {t.landingFeatLeaderboardTag}
                </span>
                <h3 className="text-lg font-black text-white mt-2 mb-2">{t.landingFeat3Title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.landingFeat3Desc}</p>
              </div>
            </div>
            <div className="pt-4 text-xs font-black text-emerald-400 group-hover:translate-x-1 transition">
              {user ? t.landingFeatActionLeaderboard : t.landingFeatActionLocked}
            </div>
          </Link>

          {/* Feature 4: Minigame Hoopick Draft (Side Feature) */}
          <Link
            href={user ? '/hoopick' : '/auth'}
            className="glass-card p-6 rounded-3xl border border-purple-500/30 hover:border-purple-400 transition duration-300 flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition">
                🎮
              </div>
              <div>
                <span className="text-[10px] font-black text-purple-400 uppercase bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  {t.landingFeatMinigameTag}
                </span>
                <h3 className="text-lg font-black text-white mt-2 mb-2">{t.landingFeatMinigameTitle}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.landingFeatMinigameDesc}</p>
              </div>
            </div>
            <div className="pt-4 text-xs font-black text-purple-400 group-hover:translate-x-1 transition">
              {user ? t.landingFeatActionMinigame : t.landingFeatActionLocked}
            </div>
          </Link>
        </div>
      </div>

      {/* Live Stats Counter Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-3xl font-black text-amber-400">500+</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase">{t.landingStatMatches}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-3xl font-black text-orange-400">24/7</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase">{t.landingStatSync}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-3xl font-black text-emerald-400">+1</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase">{t.landingStatReward}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-3xl font-black text-purple-400">100%</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase">{t.landingStatFree}</div>
        </div>
      </div>

      {/* Ko-fi Support Banner Section */}
      <KofiButton variant="banner" />
    </div>
  );
}
