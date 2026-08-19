'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-200/80 transition-colors duration-300 mt-20 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center shadow-md">
              <span className="text-xl">🏀</span>
            </div>
            <div>
              <span className="text-lg font-black tracking-wider gradient-text-gold uppercase block">
                {t.navBrand}
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                {t.navSub}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-6 text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-700">
            <Link href="/regular-season" className="hover:text-amber-400 transition">
              {t.navRegular}
            </Link>
            <Link href="/stats" className="hover:text-amber-400 transition">
              {t.navLeaderboard}
            </Link>
            <Link href="/auth" className="hover:text-amber-400 transition">
              {t.navLogin}
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs font-medium text-slate-500 dark:text-slate-500 light:text-slate-600 text-center md:text-right">
            {t.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
}
