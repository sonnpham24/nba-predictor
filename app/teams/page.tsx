'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface PlayerSuggestion {
  id: string;
  fullName: string;
  jersey: string;
  position: string;
  headshot: string | null;
  teamId: number;
  teamName: string;
  teamLogo: string;
}

export default function TeamsListPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [conferenceFilter, setConferenceFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Player search autocomplete suggestions
  const [playerSuggestions, setPlayerSuggestions] = useState<PlayerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetch('/api/regular/teams')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTeams(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Update Player Autocomplete Suggestions when searchQuery changes
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setPlayerSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const suggestions: PlayerSuggestion[] = [];

    teams.forEach((team) => {
      const roster = team.scrapedData ? JSON.parse(team.scrapedData) : team.pendingData ? JSON.parse(team.pendingData) : null;
      if (roster && roster.athletes) {
        roster.athletes.forEach((ath: any) => {
          if (ath.fullName && ath.fullName.toLowerCase().includes(q)) {
            suggestions.push({
              id: ath.id,
              fullName: ath.fullName,
              jersey: ath.jersey || 'N/A',
              position: ath.position || 'N/A',
              headshot: ath.headshot || null,
              teamId: team.id,
              teamName: team.name,
              teamLogo: team.logo,
            });
          }
        });
      }
    });

    setPlayerSuggestions(suggestions.slice(0, 8)); // Top 8 suggestions
    setShowSuggestions(suggestions.length > 0);
  }, [searchQuery, teams]);

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.abbreviation.toLowerCase().includes(searchQuery.toLowerCase());

    const conf = team.conference || '';
    const matchesConf =
      conferenceFilter === 'ALL' ||
      (conferenceFilter === 'East' && conf.toLowerCase().includes('eastern')) ||
      (conferenceFilter === 'West' && conf.toLowerCase().includes('western'));

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 max-w-4xl mx-auto relative">
        {/* Search Input with Autocomplete Dropdown */}
        <div className="w-full sm:flex-1 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(playerSuggestions.length > 0)}
            placeholder={t.searchTeamPlaceholder}
            className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold"
          />

          {/* Autocomplete Player Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-14 left-0 right-0 z-50 bg-slate-900/95 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="p-2 bg-slate-950/80 text-[10px] font-black text-amber-400 uppercase tracking-wider border-b border-slate-800">
                ⭐ Player Search Suggestions
              </div>
              <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                {playerSuggestions.map((player) => (
                  <div
                    key={`${player.teamId}-${player.id}`}
                    onClick={() => {
                      setShowSuggestions(false);
                      router.push(`/team/${player.teamId}`);
                    }}
                    className="p-3 hover:bg-slate-800/80 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      {player.headshot ? (
                        <img
                          src={player.headshot}
                          alt={player.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-amber-500/30 bg-slate-950"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30">
                          🏀
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-400 transition leading-normal">
                          {player.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          #{player.jersey} • {player.position}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800">
                      <img src={player.teamLogo} alt={player.teamName} className="w-5 h-5 object-contain" />
                      <span className="text-[10px] font-extrabold text-slate-300">{player.teamName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conference Filter Buttons */}
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
              {conf === 'ALL' ? t.allConferences : conf === 'East' ? 'Eastern' : 'Western'}
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
