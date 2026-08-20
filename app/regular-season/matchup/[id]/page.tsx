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

  // Prop Bets States
  const [propsList, setPropsList] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [showCreatePropForm, setShowCreatePropForm] = useState(false);
  const [propQuestion, setPropQuestion] = useState('');
  const [propPlayerName, setPropPlayerName] = useState('');
  const [propStatType, setPropStatType] = useState('');
  const [propThreshold, setPropThreshold] = useState('');
  const [creatingProp, setCreatingProp] = useState(false);
  const [votingPropId, setVotingPropId] = useState<number | null>(null);

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

  const fetchProps = async () => {
    setLoadingProps(true);
    try {
      const res = await fetch(`/api/regular/props?matchupId=${matchupId}`);
      if (res.ok) {
        const data = await res.json();
        setPropsList(data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingProps(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchProps();
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

  const handleCreateProp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propQuestion.trim()) {
      toast.error(locale === 'en' ? 'Please enter a question title' : 'Vui lòng nhập tiêu đề câu hỏi');
      return;
    }

    setCreatingProp(true);
    try {
      const res = await fetch('/api/regular/props', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchupId: parseInt(matchupId as string),
          question: propQuestion,
          playerName: propPlayerName,
          statType: propStatType,
          threshold: propThreshold,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create prop failed');

      toast.success(data.message || (locale === 'en' ? '✅ Prop question created!' : '✅ Đã tạo câu hỏi dự đoán Yes/No!'));
      setPropQuestion('');
      setPropPlayerName('');
      setPropStatType('');
      setPropThreshold('');
      setShowCreatePropForm(false);
      fetchProps();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingProp(false);
    }
  };

  const handlePropVote = async (propId: number, vote: 'YES' | 'NO') => {
    setVotingPropId(propId);
    try {
      const res = await fetch('/api/regular/props/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propId, vote }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vote failed');

      toast.success(data.message || `✅ Voted ${vote}`);
      fetchProps();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setVotingPropId(null);
    }
  };

  const handleResolveProp = async (propId: number, resolvedOutcome: 'YES' | 'NO') => {
    try {
      const res = await fetch('/api/regular/props/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propId, resolvedOutcome }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Resolve failed');

      toast.success(data.message || '🏁 Resolved prop question outcome!');
      fetchProps();
    } catch (err: any) {
      toast.error(err.message);
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
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <Link href="/regular-season" className="text-xs font-bold text-amber-400 hover:underline inline-block leading-normal">
        ← {locale === 'en' ? 'Back to Regular Season Schedule' : 'Quay lại danh sách Regular Season'}
      </Link>

      <div className="glass-card p-6 md:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
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
            {matchup.teamA.id > 0 ? (
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
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src={matchup.teamA.logo}
                  alt={matchup.teamA.name}
                  className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-xl"
                />
                <span className="mt-3 text-base md:text-xl font-black text-white leading-normal break-words">
                  {matchup.teamA.name}
                </span>
              </div>
            )}

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
            {matchup.teamB.id > 0 ? (
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
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src={matchup.teamB.logo}
                  alt={matchup.teamB.name}
                  className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-xl"
                />
                <span className="mt-3 text-base md:text-xl font-black text-white leading-normal break-words">
                  {matchup.teamB.name}
                </span>
              </div>
            )}

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
      </div>

      {/* 🎲 YES / NO PROP BETS SECTION */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-amber-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              {t.propBetsTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t.propBetsSub}
            </p>
          </div>

          {canPredict && (
            <button
              onClick={() => setShowCreatePropForm(!showCreatePropForm)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-2xl transition shadow leading-normal self-start sm:self-auto"
            >
              {showCreatePropForm ? '✕ Cancel' : t.createPropBtn}
            </button>
          )}
        </div>

        {/* Create Prop Form Modal/Box */}
        {showCreatePropForm && (
          <form onSubmit={handleCreateProp} className="p-6 bg-slate-950/80 rounded-2xl border border-amber-500/40 space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase">
              {t.createPropBtn}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                {t.propQuestionLabel} *
              </label>
              <input
                type="text"
                required
                value={propQuestion}
                onChange={(e) => setPropQuestion(e.target.value)}
                placeholder={t.propQuestionPlaceholder}
                className="w-full glass-input p-3 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  {t.playerNameLabel}
                </label>
                <input
                  type="text"
                  value={propPlayerName}
                  onChange={(e) => setPropPlayerName(e.target.value)}
                  placeholder={t.playerNamePlaceholder}
                  className="w-full glass-input p-2.5 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  {t.statTypeLabel}
                </label>
                <select
                  value={propStatType}
                  onChange={(e) => setPropStatType(e.target.value)}
                  className="w-full glass-input p-2.5 rounded-xl text-xs font-bold text-white"
                >
                  <option value="" className="bg-slate-900">-- None (Manual Yes/No) --</option>
                  <option value="3PM" className="bg-slate-900">3PM (Three-Pointers Made)</option>
                  <option value="PTS" className="bg-slate-900">PTS (Points)</option>
                  <option value="REB" className="bg-slate-900">REB (Rebounds)</option>
                  <option value="AST" className="bg-slate-900">AST (Assists)</option>
                  <option value="BLK" className="bg-slate-900">BLK (Blocks)</option>
                  <option value="STL" className="bg-slate-900">STL (Steals)</option>
                  <option value="MIN" className="bg-slate-900">MIN (Minutes)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  {t.thresholdLabel}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={propThreshold}
                  onChange={(e) => setPropThreshold(e.target.value)}
                  placeholder="e.g. 8.5"
                  className="w-full glass-input p-2.5 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <p className="text-[11px] text-amber-400 font-semibold italic">
              {t.oppositeVoteNotice}
            </p>

            <button
              type="submit"
              disabled={creatingProp}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase shadow transition"
            >
              {creatingProp ? 'CREATING...' : t.btnSubmitProp}
            </button>
          </form>
        )}

        {/* Props Cards List */}
        {loadingProps ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : propsList.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-semibold">
            No prop questions created for this matchup yet.
          </div>
        ) : (
          <div className="space-y-4">
            {propsList.map((p) => {
              const isCreator = p.creator?.id === matchup.userId;
              const hasOppositeSide = p.votesYes > 0 && p.votesNo > 0;

              return (
                <div
                  key={p.id}
                  className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-amber-500/30 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-white leading-normal">
                        {p.question}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">
                          Created by: <strong className="text-slate-300">@{p.creator?.username}</strong>
                        </span>
                        {p.playerName && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono border border-purple-500/30">
                            🏀 {p.playerName} ({p.statType} &ge; {p.threshold})
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {p.isResolved ? (
                        <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${
                          p.resolvedOutcome === 'YES' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}>
                          ✓ RESULT: {p.resolvedOutcome} {p.actualStatValue !== null ? `(${p.actualStatValue})` : ''}
                        </span>
                      ) : (
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-bold uppercase">
                          ⏳ OPEN FOR VOTES
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Voting Bar & Split */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>YES: {p.percentYes}% ({p.votesYes} votes)</span>
                      <span>NO: {p.percentNo}% ({p.votesNo} votes)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div style={{ width: `${p.percentYes}%` }} className="bg-emerald-500 transition-all duration-500"></div>
                      <div style={{ width: `${p.percentNo}%` }} className="bg-red-500 transition-all duration-500"></div>
                    </div>
                  </div>

                  {/* Opposite Side Warning */}
                  {!hasOppositeSide && !p.isResolved && (
                    <p className="text-[11px] text-amber-400 font-semibold italic">
                      ⚠️ Cần có người chọn cả 2 phe (YES & NO) thì mới tính +1 điểm khi thắng. Hiện tại chưa có phe đối lập!
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {canPredict && !p.isResolved ? (
                      <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                        <button
                          disabled={votingPropId === p.id}
                          onClick={() => handlePropVote(p.id, 'YES')}
                          className={`px-5 py-2.5 rounded-xl font-black text-xs transition ${
                            p.userVote === 'YES'
                              ? 'bg-emerald-500 text-slate-950 shadow-lg'
                              : 'bg-slate-900 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                          }`}
                        >
                          {p.userVote === 'YES' ? `✓ ${t.votedYes}` : t.voteYes}
                        </button>

                        <button
                          disabled={votingPropId === p.id}
                          onClick={() => handlePropVote(p.id, 'NO')}
                          className={`px-5 py-2.5 rounded-xl font-black text-xs transition ${
                            p.userVote === 'NO'
                              ? 'bg-red-500 text-white shadow-lg'
                              : 'bg-slate-900 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                          }`}
                        >
                          {p.userVote === 'NO' ? `✓ ${t.votedNo}` : t.voteNo}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">
                        {p.userVote ? `Your vote: ${p.userVote}` : 'Voting closed'}
                      </span>
                    )}

                    {/* Admin / Creator Outcome Resolver */}
                    {!p.isResolved && (
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-slate-400 font-bold">{t.resolveOutcome}</span>
                        <button
                          onClick={() => handleResolveProp(p.id, 'YES')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
                        >
                          YES WIN
                        </button>
                        <button
                          onClick={() => handleResolveProp(p.id, 'NO')}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition"
                        >
                          NO WIN
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
