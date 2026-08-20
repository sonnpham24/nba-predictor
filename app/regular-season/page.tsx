'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

function MatchCountdown({ startTime }: { startTime: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const diff = new Date(startTime).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft('00m 00s');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <span className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold">
      <span>⏳</span>
      <span>Closes in {timeLeft}</span>
    </span>
  );
}

export default function RegularSeasonPage() {
  const { t, locale } = useLanguage();
  const [selectedDaysAhead, setSelectedDaysAhead] = useState(0);
  const [matchups, setMatchups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictingId, setPredictingId] = useState<number | null>(null);

  const datesList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return {
      daysAhead: i,
      dateStr,
      formattedDate: d.toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      label: i === 0 ? t.today : i === 1 ? t.tomorrow : `${i} ${t.inDays}`,
    };
  });

  const fetchMatchups = async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/regular/matchups?date=${dateStr}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(locale === 'en' ? 'Failed to load matchups' : 'Lỗi tải danh sách trận đấu');
      const data = await res.json();

      // SẮP XẾP: Ưu tiên trận Live (IN_PROGRESS) & Chưa đấu (SCHEDULED) lên trên, đẩy các trận đã kết thúc (FINISHED) xuống dưới cùng
      const sorted = [...data].sort((a: any, b: any) => {
        if (a.status === 'FINISHED' && b.status !== 'FINISHED') return 1;
        if (a.status !== 'FINISHED' && b.status === 'FINISHED') return -1;
        if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
        if (a.status !== 'IN_PROGRESS' && b.status === 'IN_PROGRESS') return 1;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });

      setMatchups(sorted);
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentItem = datesList.find((d) => d.daysAhead === selectedDaysAhead) || datesList[0];
    fetchMatchups(currentItem.dateStr);
  }, [selectedDaysAhead, locale]);

  const handlePredict = async (matchup: any, winnerObj: any) => {
    setPredictingId(matchup.id);
    try {
      const payload: any = { matchupId: matchup.id };
      if (winnerObj.id > 0) {
        payload.predictedWinnerId = winnerObj.id;
      } else {
        payload.customPredictedWinner = winnerObj.name;
      }

      const res = await fetch('/api/regular/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (locale === 'en' ? 'Prediction failed' : 'Dự đoán thất bại'));

      toast.success(data.message || (locale === 'en' ? '✅ Prediction saved!' : '✅ Đã lưu dự đoán thành công!'));
      setMatchups((prev) =>
        prev.map((item) => {
          if (item.id !== matchup.id) return item;

          const votedTeamA = winnerObj.id === item.teamA.id || winnerObj.name === item.teamA.name;
          const votesTeamA = item.votesTeamA + (votedTeamA ? 1 : 0);
          const votesTeamB = item.votesTeamB + (votedTeamA ? 0 : 1);
          const totalPredictions = votesTeamA + votesTeamB;
          const percentTeamA = totalPredictions > 0 ? Math.round((votesTeamA / totalPredictions) * 100) : 50;
          const percentTeamB = totalPredictions > 0 ? 100 - percentTeamA : 50;

          return {
            ...item,
            userPrediction: {
              id: data.prediction.id,
              predictedWinnerId: data.prediction.predictedWinnerId,
              customPredictedWinner: data.prediction.customPredictedWinner,
            },
            totalPredictions,
            votesTeamA,
            votesTeamB,
            percentTeamA,
            percentTeamB,
          };
        })
      );
      const currentItem = datesList.find((d) => d.daysAhead === selectedDaysAhead) || datesList[0];
      fetchMatchups(currentItem.dateStr);
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setPredictingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest mb-3">
          <span>🏀 NBA 2026-27 REGULAR SEASON HUB</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black gradient-text-gold tracking-tight uppercase leading-normal break-words">
          {t.regularTitle}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 font-medium leading-normal break-words">
          {t.regularSub}
        </p>
      </div>

      {/* Date Selector Pills */}
      <div className="flex overflow-x-auto space-x-3 pb-4 mb-10 justify-start sm:justify-center scrollbar-none">
        {datesList.map((item) => (
          <button
            key={item.daysAhead}
            onClick={() => setSelectedDaysAhead(item.daysAhead)}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all duration-300 flex flex-col items-center min-w-[110px] ${
              selectedDaysAhead === item.daysAhead
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
                : 'bg-slate-900/80 dark:bg-slate-900/80 light:bg-white text-slate-400 dark:text-slate-400 light:text-slate-700 hover:text-white border border-slate-800 light:border-slate-300'
            }`}
          >
            <span>{item.label}</span>
            <span className="text-[10px] opacity-80 font-mono mt-0.5">{item.formattedDate}</span>
          </button>
        ))}
      </div>

      {/* Matchup Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : matchups.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-white/10 text-center text-slate-400 max-w-md mx-auto">
          <p className="text-base font-semibold">{t.noGamesOnDate}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matchups.map((m) => {
            const canPredict = Boolean(m.canPredict && !m.userPrediction);
            const predictionOpen = Boolean(m.canPredict);
            const displayStatus = m.displayStatus || m.status;

            const isVotedA =
              m.userPrediction &&
              (m.userPrediction.predictedWinnerId === m.teamA.id ||
                m.userPrediction.customPredictedWinner === m.teamA.name);

            const isVotedB =
              m.userPrediction &&
              (m.userPrediction.predictedWinnerId === m.teamB.id ||
                m.userPrediction.customPredictedWinner === m.teamB.name);

            return (
              <div
                key={m.id}
                className={`glass-card p-6 md:p-8 rounded-3xl border flex flex-col justify-between space-y-6 transition-all duration-300 shadow-xl relative overflow-hidden ${
                  m.status === 'FINISHED'
                    ? 'border-slate-800/80 opacity-75 bg-slate-950/60'
                    : 'border-white/10 hover:border-amber-500/30'
                }`}
              >
                {/* Custom Game Badge */}
                {m.isCustom && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                    CUSTOM MATCH
                  </div>
                )}

                {/* Header Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div className="flex flex-wrap items-center space-x-2">
                    <span className="text-xs font-mono text-slate-400 font-semibold leading-normal">
                      ⏰ {new Date(m.startTime).toLocaleTimeString(locale === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })} (GMT+7)
                    </span>

                    {/* COUNTDOWN TIMER FOR UPCOMING GAMES */}
                    {predictionOpen && (
                      <MatchCountdown startTime={m.startTime} />
                    )}
                  </div>

                  <div>
                    {displayStatus === 'FINISHED' ? (
                      <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-black uppercase tracking-wider">
                        {t.finished}
                      </span>
                    ) : displayStatus === 'IN_PROGRESS' ? (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-black uppercase tracking-wider animate-pulse-glow">
                        🔴 {t.live} {m.period}
                      </span>
                    ) : displayStatus === 'LOCKED' ? (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                        {t.predictLocked}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                        {t.scheduled}
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Battle Display */}
                <div className="grid grid-cols-5 items-center text-center my-2">
                  {/* Team A */}
                  <div className="col-span-2 flex flex-col items-center">
                    {m.teamA.id > 0 ? (
                      <Link href={`/team/${m.teamA.id}`} className="group flex flex-col items-center">
                        <img
                          src={m.teamA.logo}
                          alt={m.teamA.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain group-hover:scale-110 transition drop-shadow-xl"
                        />
                        <span className="mt-2 text-sm sm:text-base font-black text-white group-hover:text-amber-400 transition leading-normal break-words">
                          {m.teamA.name}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex flex-col items-center">
                        <img
                          src={m.teamA.logo}
                          alt={m.teamA.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl"
                        />
                        <span className="mt-2 text-sm sm:text-base font-black text-white leading-normal break-words">
                          {m.teamA.name}
                        </span>
                      </div>
                    )}

                    {m.scoreA !== null && (
                      <span className="text-2xl font-black text-amber-400 mt-1 font-mono">{m.scoreA}</span>
                    )}
                  </div>

                  {/* VS Divider */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-600">VS</span>
                  </div>

                  {/* Team B */}
                  <div className="col-span-2 flex flex-col items-center">
                    {m.teamB.id > 0 ? (
                      <Link href={`/team/${m.teamB.id}`} className="group flex flex-col items-center">
                        <img
                          src={m.teamB.logo}
                          alt={m.teamB.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain group-hover:scale-110 transition drop-shadow-xl"
                        />
                        <span className="mt-2 text-sm sm:text-base font-black text-white group-hover:text-amber-400 transition leading-normal break-words">
                          {m.teamB.name}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex flex-col items-center">
                        <img
                          src={m.teamB.logo}
                          alt={m.teamB.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl"
                        />
                        <span className="mt-2 text-sm sm:text-base font-black text-white leading-normal break-words">
                          {m.teamB.name}
                        </span>
                      </div>
                    )}

                    {m.scoreB !== null && (
                      <span className="text-2xl font-black text-amber-400 mt-1 font-mono">{m.scoreB}</span>
                    )}
                  </div>
                </div>

                {/* Community Voting Bar */}
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5 leading-normal">
                    <span>{m.teamA.name}: {m.percentTeamA}%</span>
                    <span>{m.teamB.name}: {m.percentTeamB}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                    <div style={{ width: `${m.percentTeamA}%` }} className="bg-amber-500 transition-all duration-500"></div>
                    <div style={{ width: `${m.percentTeamB}%` }} className="bg-blue-500 transition-all duration-500"></div>
                  </div>
                </div>

                {/* User Prediction Action Buttons */}
                <div className="pt-2">
                  {canPredict ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        disabled={predictingId === m.id}
                        onClick={() => handlePredict(m, m.teamA)}
                        className={`py-3 px-3 rounded-2xl font-extrabold text-xs transition flex flex-col items-center leading-normal ${
                          isVotedA
                            ? 'bg-amber-500 text-slate-950 shadow-lg'
                            : 'bg-slate-800 text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700'
                        }`}
                      >
                        <span>{isVotedA ? `✓ ${t.voted}` : t.voteFor}</span>
                        <span className="text-[10px] opacity-80 break-words line-clamp-1">{m.teamA.name}</span>
                      </button>

                      <button
                        disabled={predictingId === m.id}
                        onClick={() => handlePredict(m, m.teamB)}
                        className={`py-3 px-3 rounded-2xl font-extrabold text-xs transition flex flex-col items-center leading-normal ${
                          isVotedB
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-slate-800 text-slate-200 hover:bg-blue-500/20 hover:text-blue-300 border border-slate-700'
                        }`}
                      >
                        <span>{isVotedB ? `✓ ${t.voted}` : t.voteFor}</span>
                        <span className="text-[10px] opacity-80 break-words line-clamp-1">{m.teamB.name}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-3 bg-slate-900/60 rounded-2xl text-slate-400 text-xs font-semibold leading-normal break-words">
                      {m.userPrediction
                        ? `${t.voted}: ${isVotedA ? m.teamA.name : m.teamB.name}`
                        : t.predictLocked}
                    </div>
                  )}
                </div>

                <div className="text-center pt-1 border-t border-slate-800/60">
                  <Link
                    href={`/regular-season/matchup/${m.id}`}
                    className="text-xs font-bold text-amber-400 hover:underline inline-block leading-normal"
                  >
                    {t.details}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
