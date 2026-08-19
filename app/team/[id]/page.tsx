'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

export default function TeamDetailPage() {
  const { t, locale } = useLanguage();
  const params = useParams();
  const teamId = params.id;
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/regular/teams/${teamId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTeam(data);
      })
      .catch(() => toast.error(locale === 'en' ? 'Failed to load team' : 'Không thể tải thông tin đội bóng'))
      .finally(() => setLoading(false));
  }, [teamId, locale]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <p className="text-xl leading-normal">{locale === 'en' ? 'Team not found.' : 'Không tìm thấy đội bóng.'}</p>
        <Link href="/regular-season" className="mt-4 inline-block text-amber-400 hover:underline">
          ← {locale === 'en' ? 'Back to list' : 'Quay lại trang danh sách'}
        </Link>
      </div>
    );
  }

  const roster = team.scrapedData?.athletes || [];
  const coach = team.scrapedData?.coach || (locale === 'en' ? 'Not updated' : 'Chưa cập nhật');

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/regular-season" className="text-xs font-bold text-amber-400 hover:underline mb-6 inline-block leading-normal">
        ← {locale === 'en' ? 'Back to Regular Season Schedule' : 'Quay lại danh sách Regular Season'}
      </Link>

      {/* Team Header Banner */}
      <div className="glass-card border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
        <img
          src={team.logo}
          alt={team.name}
          className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl bg-slate-950/40 p-3 rounded-2xl border border-slate-700/50"
        />

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-3xl md:text-4xl font-black text-white leading-normal break-words">{team.name}</h1>
            <span className="text-sm font-bold bg-amber-500/20 text-amber-400 px-3 py-1 rounded-xl border border-amber-500/30">
              {team.abbreviation}
            </span>
          </div>

          <p className="text-slate-400 text-sm leading-normal">
            {t.conference}: <strong className="text-slate-200">{team.conference || 'NBA Official'}</strong>
          </p>

          <p className="text-slate-400 text-sm leading-normal">
            {t.coach}: <strong className="text-amber-400">{coach}</strong>
          </p>

          <div className="pt-2">
            {team.isApproved ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 leading-normal">
                {t.verifiedRoster}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 leading-normal">
                {t.pendingRoster}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Roster Section */}
      <div className="mt-8 glass-card border border-white/10 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-black text-white mb-6 flex items-center space-x-3 leading-normal">
          <span>{t.rosterTableTitle}</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 font-mono">
            {roster.length} {t.player}
          </span>
        </h2>

        {!team.isApproved || roster.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
            <p className="text-base leading-normal">
              {locale === 'en' ? 'Player roster details awaiting admin approval.' : 'Thông tin Roster cầu thủ đang chờ Admin cập nhật & duyệt.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 leading-normal">{t.player}</th>
                  <th className="py-3 px-4 text-center leading-normal">{t.jersey}</th>
                  <th className="py-3 px-4 leading-normal">{t.position}</th>
                  <th className="py-3 px-4 leading-normal">{t.height}</th>
                  <th className="py-3 px-4 leading-normal">{t.weight}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {roster.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-3 leading-normal">
                      {a.headshot ? (
                        <img src={a.headshot} alt={a.fullName} className="w-10 h-10 rounded-full object-cover bg-slate-800 border border-slate-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                          {a.fullName.substring(0, 2)}
                        </div>
                      )}
                      <span className="break-words">{a.fullName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-400 font-mono">#{a.jersey}</td>
                    <td className="py-3.5 px-4 leading-normal">
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-xs text-slate-300 border border-slate-700 font-semibold">
                        {a.position}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{a.height}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{a.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
