'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function StandingsPage() {
  const { t } = useLanguage();
  const [standings, setStandings] = useState<{ east: any[]; west: any[]; season: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/regular/standings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStandings(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderConferenceTable = (title: string, teams: any[], icon: string) => (
    <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-black text-white leading-normal uppercase tracking-wider">{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-3 text-center leading-normal">#</th>
              <th className="py-3.5 px-4 leading-normal">Team</th>
              <th className="py-3.5 px-3 text-center leading-normal">{t.win}</th>
              <th className="py-3.5 px-3 text-center leading-normal">{t.loss}</th>
              <th className="py-3.5 px-3 text-center leading-normal">{t.pct}</th>
              <th className="py-3.5 px-3 text-center leading-normal">{t.gb}</th>
              <th className="py-3.5 px-3 text-center leading-normal">{t.streak}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {teams.map((tItem) => (
              <tr key={tItem.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-3 text-center font-black font-mono text-slate-400">
                  {tItem.rank}
                </td>
                <td className="py-3.5 px-4 font-bold text-white leading-normal break-words">
                  <Link href={`/team/${tItem.id}`} className="flex items-center space-x-3 group">
                    <img src={tItem.logo} alt={tItem.name} className="w-8 h-8 object-contain group-hover:scale-110 transition drop-shadow" />
                    <span className="group-hover:text-amber-400 transition">{tItem.name}</span>
                  </Link>
                </td>
                <td className="py-3.5 px-3 text-center font-bold text-emerald-400 font-mono">{tItem.wins}</td>
                <td className="py-3.5 px-3 text-center font-bold text-red-400 font-mono">{tItem.losses}</td>
                <td className="py-3.5 px-3 text-center font-mono text-slate-300">{tItem.pct}</td>
                <td className="py-3.5 px-3 text-center font-mono text-slate-400">{tItem.gb}</td>
                <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-400">{tItem.streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest mb-3">
          <span>📈 OFFICIAL NBA 2026-27 STANDINGS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black gradient-text-gold tracking-tight uppercase leading-normal break-words">
          {t.standingsTitle}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 font-medium leading-normal break-words">
          {t.standingsSub}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : !standings ? (
        <div className="glass-card p-12 rounded-3xl border border-white/10 text-center text-slate-400 max-w-md mx-auto">
          <p className="text-base font-semibold">Failed to load standings data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {renderConferenceTable(t.eastConference, standings.east, '🌇')}
          {renderConferenceTable(t.westConference, standings.west, '🌅')}
        </div>
      )}
    </div>
  );
}
