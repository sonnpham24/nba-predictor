'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LandingPage() {
  const { t, locale } = useLanguage();
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest animate-pulse-glow">
          <span>🏀 NBA 2025 PREDICTOR PLATFORM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-normal uppercase">
          <span className="gradient-text-gold">{t.landingTitle}</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-xl max-w-2xl mx-auto font-medium leading-normal">
          {t.landingSub}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <>
              <Link
                href="/regular-season"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/25 hover:scale-105 transition duration-300"
              >
                {locale === 'en' ? 'Go to Predictor Hub →' : 'Vào Sảnh Dự Đoán →'}
              </Link>
              <Link
                href="/stats"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-sm border border-slate-700 shadow-lg hover:scale-105 transition duration-300"
              >
                {locale === 'en' ? 'View Standings' : 'Xem Bảng Xếp Hạng'}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/25 hover:scale-105 transition duration-300"
              >
                {t.landingBtnStart} →
              </Link>
              <Link
                href="/auth"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-sm border border-slate-700 shadow-lg hover:scale-105 transition duration-300"
              >
                {t.landingBtnSignIn}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
        {/* Feature 1 */}
        <div className="glass-card p-8 rounded-3xl border border-white/10 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mb-6">
              🗓️
            </div>
            <h3 className="text-xl font-black text-white mb-3 leading-normal">{t.landingFeat1Title}</h3>
            <p className="text-slate-400 text-sm leading-normal">{t.landingFeat1Desc}</p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="glass-card p-8 rounded-3xl border border-white/10 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-3xl mb-6">
              📊
            </div>
            <h3 className="text-xl font-black text-white mb-3 leading-normal">{t.landingFeat2Title}</h3>
            <p className="text-slate-400 text-sm leading-normal">{t.landingFeat2Desc}</p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="glass-card p-8 rounded-3xl border border-white/10 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mb-6">
              🏆
            </div>
            <h3 className="text-xl font-black text-white mb-3 leading-normal">{t.landingFeat3Title}</h3>
            <p className="text-slate-400 text-sm leading-normal">{t.landingFeat3Desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
