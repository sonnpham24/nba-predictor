'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function TeamsListPage() {
  const { t } = useLanguage();
  const [teams, setTeams] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [conferenceFilter, setConferenceFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/regular/teams')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTeams(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.abbreviation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesConf =
      conferenceFilter === 'ALL' ||
      (team.conference && team.conference.toLowerCase().includes(conferenceFilter.toLowerCase()));

    return matchesSearch && matchesConf;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest mb-3">
          <span>🏀 NBA 2026-27 OFFICIAL TEAMS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black gradient-text-gold tracking-tight uppercase leading-normal break-words">
          {t.teamsTitle}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 font-medium leading-normal break-words">
          {t.teamsSub}
        </p>
      </div>

      {/* Search & Conference Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 max-w-4xl mx-auto">
        <div className="w-full sm:flex-1 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchTeamPlaceholder}
            className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold"
          />
        </div>

        <div className="flex space-x-2 w-full sm:w-auto">
          {['ALL', 'East', 'West'].map((conf) => (
            <button
              key={conf}
              onClick={() => setConferenceFilter(conf)}
              className={`px-4 py-3 rounded-2xl font-black text-xs uppercase transition-all duration-300 ${
                conferenceFilter === conf
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-900/80 dark:bg-slate-900/80 light:bg-white text-slate-400 dark:text-slate-400 light:text-slate-700 border border-slate-800 light:border-slate-300'
              }`}
            >
              {conf === 'ALL' ? t.allConferences : conf}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-white/10 text-center text-slate-400 max-w-md mx-auto">
          <p className="text-base font-semibold">No teams found matching search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredTeams.map((team) => (
            <Link
              key={team.id}
              href={`/team/${team.id}`}
              className="glass-card p-6 rounded-3xl border border-white/10 hover:border-amber-500/50 hover:shadow-xl transition duration-300 flex flex-col items-center justify-between text-center group"
            >
              <img
                src={team.logo}
                alt={team.name}
                className="w-20 h-20 object-contain mb-4 group-hover:scale-110 transition drop-shadow-xl"
              />
              <span className="text-sm font-black text-white dark:text-white light:text-slate-900 group-hover:text-amber-400 transition leading-normal break-words">
                {team.name}
              </span>
              <span className="text-xs font-mono text-amber-400 font-extrabold mt-1">
                {team.abbreviation}
              </span>
              <div className="mt-3">
                <span className="text-[10px] bg-slate-800/80 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700 font-semibold leading-normal">
                  {team.conference || 'NBA'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
