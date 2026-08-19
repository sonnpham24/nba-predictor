'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

export default function RegularMatchupDetailPage() {
  const { t, locale } = useLanguage();
  const params = useParams();
  const matchupId = params.id;
  const [matchup, setMatchup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/regular/matchups/${matchupId}`);
      if (!res.ok) throw new Error(locale === 'en' ? 'Failed to load matchup details' : 'Không thể tải thông tin trận đấu');
      const data = await res.json();
      setMatchup(data);
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [matchupId, locale]);

  const handlePredict = async (predictedWinnerId: number) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/regular/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchupId: parseInt(matchupId as string), predictedWinnerId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (locale === 'en' ? 'Prediction failed' : 'Dự đoán thất bại'));

      toast.success(data.message || (locale === 'en' ? '✅ Prediction saved!' : '✅ Đã lưu dự đoán thành công!'));
      fetchDetail();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!matchup || matchup.error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <p className="text-xl leading-normal">{locale === 'en' ? 'Matchup not found.' : 'Không tìm thấy trận đấu.'}</p>
        <Link href="/regular-season" className="mt-4 inline-block text-amber-400 hover:underline">
          ← {locale === 'en' ? 'Back to list' : 'Quay lại danh sách'}
        </Link>
      </div>
    );
  }

  const now = new Date();
  const lock = new Date(matchup.lockTime);
  const open = new Date(matchup.openTime);
  const canPredict = matchup.status === 'SCHEDULED' && now >= open && now < lock;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/regular-season" className="text-xs font-bold text-amber-400 hover:underline mb-6 inline-block leading-normal">
        ← {locale === 'en' ? 'Back to Regular Season Schedule' : 'Quay lại danh sách Regular Season'}
      </Link>

      <div className="glass-card p-6 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
        {/* Matchup Header */}
        <div className="text-center pb-6 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 leading-normal">
            📅 {new Date(matchup.startTime).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} (GMT+7)
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1 leading-normal break-words">
            {t.matchupDetailTitle}
          </h1>
        </div>

        {/* Teams Matchup Showcase */}
        <div className="grid grid-cols-5 items-center my-8 text-center">
          {/* Team A */}
          <div className="col-span-2 flex flex-col items-center">
            <Link href={`/team/${matchup.teamA.id}`} className="group flex flex-col items-center">
              <img
                src={matchup.teamA.logo}
                alt={matchup.teamA.name}
                className="w-24 h-24 md:w-32 md:h-32 object-contain group-hover:scale-110 transition drop-shadow-xl"
              />
              <span className="mt-3 text-base md:text-xl font-black text-white group-hover:text-amber-400 transition leading-normal break-words">
                {matchup.teamA.name}
              </span>
            </Link>
            {matchup.scoreA !== null && (
              <span className="text-3xl md:text-4xl font-black text-amber-400 mt-2 font-mono">{matchup.scoreA}</span>
            )}
          </div>

          {/* VS */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <span className="text-2xl md:text-3xl font-black text-slate-600">VS</span>
            {matchup.status === 'IN_PROGRESS' && (
              <span className="mt-2 text-xs font-bold text-red-400 bg-red-500/20 px-2.5 py-1 rounded-full animate-pulse-glow">
                🔴 LIVE
              </span>
            )}
          </div>

          {/* Team B */}
          <div className="col-span-2 flex flex-col items-center">
            <Link href={`/team/${matchup.teamB.id}`} className="group flex flex-col items-center">
              <img
                src={matchup.teamB.logo}
                alt={matchup.teamB.name}
                className="w-24 h-24 md:w-32 md:h-32 object-contain group-hover:scale-110 transition drop-shadow-xl"
              />
              <span className="mt-3 text-base md:text-xl font-black text-white group-hover:text-amber-400 transition leading-normal break-words">
                {matchup.teamB.name}
              </span>
            </Link>
            {matchup.scoreB !== null && (
              <span className="text-3xl md:text-4xl font-black text-amber-400 mt-2 font-mono">{matchup.scoreB}</span>
            )}
          </div>
        </div>

        {/* Voting Rate Breakdown */}
        <div className="bg-slate-950/60 rounded-2xl p-6 border border-slate-800 my-6">
          <h2 className="text-sm font-bold text-slate-300 mb-3 text-center leading-normal">
            {t.votingSplit}
          </h2>
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-2 leading-normal">
            <span>{matchup.teamA.name}: {matchup.percentTeamA}% ({matchup.votesTeamA})</span>
            <span>{matchup.teamB.name}: {matchup.percentTeamB}% ({matchup.votesTeamB})</span>
          </div>
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div style={{ width: `${matchup.percentTeamA}%` }} className="bg-amber-500 transition-all duration-500"></div>
            <div style={{ width: `${matchup.percentTeamB}%` }} className="bg-blue-500 transition-all duration-500"></div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-2 leading-normal">
            {matchup.totalPredictions} {t.totalPredictions}
          </p>
        </div>

        {/* Prediction Form Section */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <h3 className="text-base font-bold text-white mb-4 text-center leading-normal break-words">
            {t.yourPrediction}
          </h3>

          {canPredict ? (
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                disabled={submitting}
                onClick={() => handlePredict(matchup.teamA.id)}
                className={`py-3.5 px-4 rounded-2xl font-extrabold text-sm transition flex flex-col items-center justify-center leading-normal ${
                  matchup.userPrediction?.predictedWinnerId === matchup.teamA.id
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-xl'
                    : 'bg-slate-800 text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700'
                }`}
              >
                <span>{matchup.userPrediction?.predictedWinnerId === matchup.teamA.id ? `✓ ${t.voted}` : t.voteFor}</span>
                <span className="text-xs opacity-80 break-words">{matchup.teamA.name}</span>
              </button>

              <button
                disabled={submitting}
                onClick={() => handlePredict(matchup.teamB.id)}
                className={`py-3.5 px-4 rounded-2xl font-extrabold text-sm transition flex flex-col items-center justify-center leading-normal ${
                  matchup.userPrediction?.predictedWinnerId === matchup.teamB.id
                    ? 'bg-blue-500 text-white ring-2 ring-blue-400 shadow-xl'
                    : 'bg-slate-800 text-slate-200 hover:bg-blue-500/20 hover:text-blue-300 border border-slate-700'
                }`}
              >
                <span>{matchup.userPrediction?.predictedWinnerId === matchup.teamB.id ? `✓ ${t.voted}` : t.voteFor}</span>
                <span className="text-xs opacity-80 break-words">{matchup.teamB.name}</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-4 bg-slate-800/40 rounded-2xl text-slate-400 text-sm font-semibold leading-normal break-words">
              {matchup.userPrediction
                ? `${t.voted}: ${matchup.userPrediction.predictedWinnerId === matchup.teamA.id ? matchup.teamA.name : matchup.teamB.name}`
                : t.predictLocked}
            </div>
          )}
        </div>

        {/* Recent Predictors */}
        {matchup.recentPredictions?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 leading-normal">
              {t.recentPredictors}
            </h4>
            <div className="flex flex-wrap gap-2">
              {matchup.recentPredictions.map((p: any) => (
                <span key={p.id} className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 leading-normal">
                  👤 <strong>{p.username}</strong>: <span className="text-amber-400 font-bold">{p.predictedTeam}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
