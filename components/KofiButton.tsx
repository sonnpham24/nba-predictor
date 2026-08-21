'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface KofiButtonProps {
  variant?: 'navbar' | 'footer' | 'banner' | 'floating';
  kofiUrl?: string;
}

export default function KofiButton({
  variant = 'navbar',
  kofiUrl = process.env.NEXT_PUBLIC_KOFI_URL || 'https://ko-fi.com/sonnpham',
}: KofiButtonProps) {
  const { locale } = useLanguage();

  if (variant === 'navbar') {
    return (
      <a
        href={kofiUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-black transition duration-300 flex items-center space-x-2 shadow-md shadow-sky-500/20 hover:scale-105"
        title="Support project on Ko-fi"
      >
        <span className="text-sm">☕</span>
        <span className="hidden sm:inline">
          {locale === 'en' ? 'Buy Me a Coffee' : 'Ủng Hộ Ko-fi'}
        </span>
        <span className="sm:hidden font-extrabold">Ko-fi</span>
      </a>
    );
  }

  if (variant === 'footer') {
    return (
      <a
        href={kofiUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-400 hover:text-sky-300 text-xs font-black transition duration-300 shadow-sm hover:scale-105"
      >
        <span className="text-base">☕</span>
        <span>{locale === 'en' ? 'Support NBA Predictor on Ko-fi' : 'Ủng hộ dự án NBA Predictor trên Ko-fi'}</span>
      </a>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="glass-card p-6 rounded-3xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-950/60 to-blue-950/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-sky-500/30 flex-shrink-0">
            ☕
          </div>
          <div>
            <h3 className="text-base font-black text-white leading-normal">
              {locale === 'en'
                ? 'Enjoying NBA Predictor 2026-27?'
                : 'Bạn yêu thích NBA Predictor 2026-27?'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              {locale === 'en'
                ? 'Support server APIs, real-time live score sync, and player stats maintenance.'
                : 'Ủng hộ nhà phát triển để duy trì chi phí server API, Live Sync tỉ số real-time & bảo trì hệ thống.'}
            </p>
          </div>
        </div>

        <a
          href={kofiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:brightness-110 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl hover:scale-105 transition duration-300 whitespace-nowrap flex items-center space-x-2"
        >
          <span>☕</span>
          <span>{locale === 'en' ? 'BUY ME A COFFEE ON KO-FI →' : 'ỦNG HỘ QUA KO-FI NGAY →'}</span>
        </a>
      </div>
    );
  }

  return (
    <a
      href={kofiUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-black shadow-2xl shadow-sky-500/40 hover:scale-110 transition duration-300 flex items-center space-x-2 border border-white/20"
    >
      <span className="text-base">☕</span>
      <span>{locale === 'en' ? 'Support on Ko-fi' : 'Ủng hộ Ko-fi'}</span>
    </a>
  );
}
