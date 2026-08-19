'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function TeamDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [team, setTeam] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Lightbox Headshot Zoom Modal State
  const [activeHeadshot, setActiveHeadshot] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/regular/teams/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTeam(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Team not found</h2>
        <Link href="/teams" className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-2xl">
          {t.backToTeams}
        </Link>
      </div>
    );
  }

  const rosterObj = team.scrapedData || team.pendingData || null;
  const athletes: any[] = rosterObj?.athletes || [];
  const starters = athletes.filter((a) => a.starter === true).slice(0, 5);
  const displayStarters = starters.length === 5 ? starters : athletes.slice(0, 5);

  const lastUpdatedDate = team.updatedAt
    ? new Date(team.updatedAt).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh',
      })
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back Button to Teams List */}
      <div>
        <Link
          href="/teams"
          className="inline-flex items-center space-x-2 text-xs font-black uppercase text-amber-400 hover:text-amber-300 transition bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl"
        >
          <span>{t.backToTeams}</span>
        </Link>
      </div>

      {/* Team Header Banner */}
      <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="flex items-center space-x-6 relative z-10">
          <img
            src={team.logo}
            alt={team.name}
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-2xl hover:scale-105 transition"
          />
          <div>
            <div className="inline-block bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase border border-amber-500/30 mb-2">
              {team.conference || 'NBA Conference'}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-normal break-words">
              {team.name}
            </h1>
            <p className="text-slate-400 text-sm font-mono mt-1">
              ABBREVIATION: <strong className="text-amber-400 font-black">{team.abbreviation}</strong> | ID: #{team.id}
            </p>
            {rosterObj?.coach && (
              <p className="text-xs text-slate-300 font-semibold mt-2">
                👤 {t.coach}: <span className="text-amber-400 font-bold">{rosterObj.coach}</span>
              </p>
            )}
          </div>
        </div>

        {/* Verification Status & Last Updated Timestamp */}
        <div className="flex flex-col items-end space-y-2 relative z-10 text-right">
          {team.isApproved ? (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-4 py-2 rounded-2xl text-xs font-black uppercase flex items-center space-x-2">
              <span>{t.verifiedRoster}</span>
            </span>
          ) : (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-4 py-2 rounded-2xl text-xs font-black uppercase flex items-center space-x-2">
              <span>{t.pendingRoster}</span>
            </span>
          )}

          {lastUpdatedDate && (
            <span className="text-[11px] text-slate-400 font-mono">
              🗓️ {t.lastUpdated}: <strong className="text-slate-200">{lastUpdatedDate}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Starting 5 Showcase Section */}
      {displayStarters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⭐</span>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">{t.starting5Title}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {displayStarters.map((star) => (
              <div
                key={star.id || star.fullName}
                className="glass-card p-5 rounded-2xl border border-amber-500/30 text-center flex flex-col items-center justify-between hover:border-amber-400 transition group"
              >
                <div
                  onClick={() => star.headshot && setActiveHeadshot({ url: star.headshot, name: star.fullName })}
                  className="relative cursor-pointer mb-3"
                  title="Click to expand headshot"
                >
                  {star.headshot ? (
                    <img
                      src={star.headshot}
                      alt={star.fullName}
                      className="w-20 h-20 rounded-full object-cover border-2 border-amber-500/50 group-hover:scale-110 transition shadow-lg bg-slate-950"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-2xl text-amber-400">
                      🏀
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    🔎
                  </span>
                </div>

                <span className="text-xs font-black text-white group-hover:text-amber-400 transition leading-normal break-words">
                  {star.fullName}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                  #{star.jersey} • {star.position}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Roster Table */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white uppercase tracking-wider">{t.rosterTableTitle}</h2>
          <span className="text-xs font-bold text-amber-400 font-mono">
            {athletes.length} Players Listed
          </span>
        </div>

        {athletes.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium">
            No player roster data available yet for this team.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 leading-normal">Headshot</th>
                  <th className="py-3.5 px-4 leading-normal">{t.player}</th>
                  <th className="py-3.5 px-3 text-center leading-normal">{t.jersey}</th>
                  <th className="py-3.5 px-3 text-center leading-normal">{t.position}</th>
                  <th className="py-3.5 px-3 text-center leading-normal">{t.height}</th>
                  <th className="py-3.5 px-3 text-center leading-normal">{t.weight}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {athletes.map((ath) => (
                  <tr key={ath.id || ath.fullName} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      {ath.headshot ? (
                        <img
                          src={ath.headshot}
                          alt={ath.fullName}
                          onClick={() => setActiveHeadshot({ url: ath.headshot, name: ath.fullName })}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 hover:border-amber-400 hover:scale-125 transition cursor-pointer bg-slate-950"
                          title="Click to view full photo"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                          🏀
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-white leading-normal break-words">
                      {ath.fullName}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                      #{ath.jersey}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">{ath.position}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{ath.height}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{ath.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Headshot Photo Lightbox Modal */}
      {activeHeadshot && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 rounded-3xl border border-amber-500/50 text-center relative shadow-2xl animate-fade-in">
            <button
              onClick={() => setActiveHeadshot(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-xl"
            >
              ✕
            </button>
            <img
              src={activeHeadshot.url}
              alt={activeHeadshot.name}
              className="w-48 h-48 mx-auto rounded-3xl object-cover border-4 border-amber-500 shadow-2xl bg-slate-950 mb-4"
            />
            <h3 className="text-xl font-black text-white leading-normal">{activeHeadshot.name}</h3>
            <p className="text-xs text-amber-400 font-mono mt-1">{team.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
