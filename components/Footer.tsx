'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800/80 light:border-slate-300 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white transition-colors duration-300 mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          {/* Brand Column */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <div className="flex items-center space-x-3">
              <img src="/buzzerbet-icon.svg" alt="BuzzerBet" className="w-10 h-10 rounded-2xl shadow-md" />
              <span className="text-lg font-black tracking-wider gradient-text-gold uppercase">
                {t.navBrand}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 font-medium leading-normal max-w-sm">
              BuzzerBet is a community NBA 2026-27 prediction and score synchronization hub.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-wrap justify-center gap-6 text-xs font-extrabold text-slate-300 dark:text-slate-300 light:text-slate-700">
            <Link href="/regular-season" className="hover:text-amber-400 transition">
              {t.navRegular}
            </Link>
            <Link href="/standings" className="hover:text-amber-400 transition">
              {t.navStandings}
            </Link>
            <Link href="/teams" className="hover:text-amber-400 transition">
              {t.navTeams}
            </Link>
            <Link href="/stats" className="hover:text-amber-400 transition">
              {t.navLeaderboard}
            </Link>
          </div>

          {/* Developer Credit Column */}
          <div className="flex flex-col items-center md:items-end space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black text-amber-400">
              <span>👨‍💻 Created & Designed by Son Pham</span>
            </div>
            <a
              href="mailto:phamcongson297@gmail.com"
              className="text-xs font-bold text-slate-400 hover:text-amber-400 transition font-mono"
            >
              phamcongson297@gmail.com
            </a>
            <span className="text-[11px] text-slate-500 mt-2 font-medium">
              {t.copyright}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
