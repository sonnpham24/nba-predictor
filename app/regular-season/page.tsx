'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface MatchupItem {
  id: number;
  teamA: { id: number; name: string; abbreviation: string; logo: string };
  teamB: { id: number; name: string; abbreviation: string; logo: string };
  startTime: string;
  status: string;
  clock?: string;
  period?: number;
  scoreA?: number;
  scoreB?: number;
  actualWinner?: { id: number; name: string };
  actualScore?: string;
  lockTime: string;
  openTime: string;
  totalPredictions: number;
  votesTeamA: number;
  votesTeamB: number;
  percentTeamA: number;
  percentTeamB: number;
  userPrediction?: { id: number; predictedWinnerId: number } | null;
}

export default function RegularSeasonPage() {
  const [matchups, setMatchups] = useState<MatchupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  // Generate 7 days tabs starting from today
  const dateTabs = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const isoDate = d.toISOString().slice(0, 10);
    let label = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : `+${i} ngày`;
    const formatted = `${d.getDate()}/${d.getMonth() + 1}`;
    return { dateStr: isoDate, label: `${label} (${formatted})` };
  });

  const fetchMatchups = async (dateStr?: string) => {
    try {
      const url = dateStr ? `/api/regular/matchups?date=${dateStr}` : '/api/regular/matchups';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Không thể tải danh sách trận đấu');
      const data = await res.json();
      setMatchups(data);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setSelectedDate(today);
    fetchMatchups(today);

    const interval = setInterval(() => {
      // Trigger live sync polling and refresh
      fetch('/api/cron/live-sync').catch(() => {});
      fetchMatchups(selectedDate || today);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    setLoading(true);
    fetchMatchups(dateStr);
  };

  const handlePredict = async (matchupId: number, predictedWinnerId: number) => {
    setSubmittingId(matchupId);
    try {
      const res = await fetch('/api/regular/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchupId, predictedWinnerId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Dự đoán thất bại');

      toast.success(data.message || '✅ Đã lưu dự đoán thành công!');
      fetchMatchups(selectedDate);
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setSubmittingId(null);
    }
  };

  const renderStatusBadge = (m: MatchupItem) => {
    if (m.status === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
          🔴 LIVE {m.period ? `Hiệp ${m.period}` : ''} {m.clock ? `- ${m.clock}` : ''}
        </span>
      );
    }

    if (m.status === 'FINISHED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          ✅ Đã kết thúc ({m.actualScore || `${m.scoreA} - ${m.scoreB}`})
        </span>
      );
    }

    const now = new Date();
    const lock = new Date(m.lockTime);
    const open = new Date(m.openTime);

    if (now >= lock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          🔒 Khóa đoán (30 phút trước trận)
        </span>
      );
    }

    if (now < open) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          ⏳ Chưa mở (mở trước 7 ngày)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
        🔓 Đang mở dự đoán (+1 điểm)
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          🏀 NBA Regular Season Predictor
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Dự đoán kết quả trận đấu hôm nay & 7 ngày tới. Chọn đúng đội chiến thắng nhận ngay <strong className="text-amber-400">+1 điểm</strong>.
        </p>
      </div>

      {/* Date Filter Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-4 mb-6 scrollbar-none justify-start md:justify-center">
        {dateTabs.map((tab) => {
          const isSelected = selectedDate === tab.dateStr;
          return (
            <button
              key={tab.dateStr}
              onClick={() => handleDateChange(tab.dateStr)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition shadow-sm ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 scale-105 shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Matchups List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : matchups.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-lg">Không có trận đấu nào trong ngày đã chọn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matchups.map((m) => {
            const now = new Date();
            const lock = new Date(m.lockTime);
            const open = new Date(m.openTime);
            const canPredict = m.status === 'SCHEDULED' && now >= open && now < lock;

            return (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
              >
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                  <div className="text-xs text-slate-400 font-medium">
                    📅 {new Date(m.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })} GMT+7
                  </div>
                  <div>{renderStatusBadge(m)}</div>
                </div>

                {/* Teams Showcase */}
                <div className="grid grid-cols-5 items-center my-2 text-center">
                  {/* Team A */}
                  <div className="col-span-2 flex flex-col items-center">
                    <Link href={`/team/${m.teamA.id}`} className="group flex flex-col items-center">
                      <img
                        src={m.teamA.logo}
                        alt={m.teamA.name}
                        className="w-16 h-16 object-contain group-hover:scale-110 transition drop-shadow-md"
                      />
                      <span className="mt-2 text-sm font-bold text-slate-200 group-hover:text-amber-400 transition">
                        {m.teamA.name}
                      </span>
                    </Link>
                    {m.scoreA !== null && m.scoreA !== undefined && (
                      <span className="text-2xl font-black text-amber-400 mt-1">{m.scoreA}</span>
                    )}
                  </div>

                  {/* VS / Score Divider */}
                  <div className="col-span-1 flex flex-col items-center">
                    <span className="text-lg font-black text-slate-500">VS</span>
                    <Link
                      href={`/regular-season/matchup/${m.id}`}
                      className="text-xs text-amber-400/80 hover:text-amber-300 underline mt-2 font-medium"
                    >
                      Chi tiết
                    </Link>
                  </div>

                  {/* Team B */}
                  <div className="col-span-2 flex flex-col items-center">
                    <Link href={`/team/${m.teamB.id}`} className="group flex flex-col items-center">
                      <img
                        src={m.teamB.logo}
                        alt={m.teamB.name}
                        className="w-16 h-16 object-contain group-hover:scale-110 transition drop-shadow-md"
                      />
                      <span className="mt-2 text-sm font-bold text-slate-200 group-hover:text-amber-400 transition">
                        {m.teamB.name}
                      </span>
                    </Link>
                    {m.scoreB !== null && m.scoreB !== undefined && (
                      <span className="text-2xl font-black text-amber-400 mt-1">{m.scoreB}</span>
                    )}
                  </div>
                </div>

                {/* Voting Rate Bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>{m.teamA.abbreviation} ({m.percentTeamA}%)</span>
                    <span className="text-slate-500">{m.totalPredictions} lượt đoán</span>
                    <span>{m.teamB.abbreviation} ({m.percentTeamB}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${m.percentTeamA}%` }}
                      className="bg-amber-500 transition-all duration-500"
                    ></div>
                    <div
                      style={{ width: `${m.percentTeamB}%` }}
                      className="bg-blue-500 transition-all duration-500"
                    ></div>
                  </div>
                </div>

                {/* Action Voting Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  {canPredict ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        disabled={submittingId === m.id}
                        onClick={() => handlePredict(m.id, m.teamA.id)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center ${
                          m.userPrediction?.predictedWinnerId === m.teamA.id
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-lg shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700'
                        }`}
                      >
                        {m.userPrediction?.predictedWinnerId === m.teamA.id ? '✓ Đã chọn ' : 'Chọn '} {m.teamA.abbreviation}
                      </button>

                      <button
                        disabled={submittingId === m.id}
                        onClick={() => handlePredict(m.id, m.teamB.id)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center ${
                          m.userPrediction?.predictedWinnerId === m.teamB.id
                            ? 'bg-blue-500 text-white ring-2 ring-blue-400 shadow-lg shadow-blue-500/20'
                            : 'bg-slate-800 text-slate-200 hover:bg-blue-500/20 hover:text-blue-300 border border-slate-700'
                        }`}
                      >
                        {m.userPrediction?.predictedWinnerId === m.teamB.id ? '✓ Đã chọn ' : 'Chọn '} {m.teamB.abbreviation}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-xs font-semibold text-slate-400 py-1 bg-slate-800/50 rounded-xl">
                      {m.userPrediction
                        ? `Bạn đã đoán: ${m.userPrediction.predictedWinnerId === m.teamA.id ? m.teamA.name : m.teamB.name}`
                        : 'Dự đoán đã đóng cho trận đấu này'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
