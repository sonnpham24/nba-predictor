'use client';

import { requireLoginClient } from '@/lib/requireLoginClient';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function PredictPage() {
  requireLoginClient();
  const [matchups, setMatchups] = useState<any[]>([]);
  const [predictedIds, setPredictedIds] = useState<number[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [winner, setWinner] = useState('');
  const [score, setScore] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMatchups = async () => {
      const res = await fetch('/api/matchups');
      const data = await res.json();
      setMatchups(data);
    };

    const fetchPredictions = async () => {
      const res = await fetch('/api/predictions/my');
      const data = await res.json();
      const ids = data.map((p: any) => p.matchupId);
      setPredictedIds(ids);
    };

    fetchMatchups();
    fetchPredictions();
  }, []);

  const handlePredictionSubmit = async () => {
    if (!selectedMatch || !winner || !score) {
      toast.error('Vui lòng nhập đầy đủ đội thắng và tỷ số');
      return;
    }

    const validScores = ['4-0', '4-1', '4-2', '4-3'];
    if (!validScores.includes(score)) {
      toast.error('⚠️ Tỷ số không hợp lệ. Chỉ được chọn 4-0, 4-1, 4-2 hoặc 4-3');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchupId: selectedMatch.id,
          predictedWinner: winner,
          predictedScore: score,
          teamA: selectedMatch.teamA,
          teamB: selectedMatch.teamB,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('✅ Dự đoán Playoff đã được lưu!');
        setPredictedIds((prev) => [...prev, selectedMatch.id]);
        setSelectedMatch(null);
      } else {
        toast.error(data.error || '❌ Có lỗi xảy ra');
      }
    } catch (err: any) {
      toast.error('Có lỗi khi lưu dự đoán');
    } finally {
      setSubmitting(false);
    }
  };

  const groupedByRound: { [round: number]: { west: any[]; east: any[]; final: any[] } } = {};
  matchups.forEach((match) => {
    const r = match.round || 1;
    if (!groupedByRound[r]) {
      groupedByRound[r] = { west: [], east: [], final: [] };
    }
    if (match.conference === 'west') groupedByRound[r].west.push(match);
    else if (match.conference === 'east') groupedByRound[r].east.push(match);
    else groupedByRound[r].final.push(match);
  });

  const roundTitle = (round: number) => {
    switch (round) {
      case 1: return 'VÒNG 1: 16 ĐỘI (8 CẶP ĐẤU)';
      case 2: return 'VÒNG BÁN KẾT MIỀN (4 CẶP ĐẤU)';
      case 3: return 'CHUNG KẾT MIỀN 🔥';
      case 4: return 'CHUNG KẾT TỔNG NBA FINALS 👑';
      default: return `VÒNG ${round}`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-black gradient-text-gold tracking-tight">
          🏆 NBA PLAYOFF PREDICTOR 2025
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl mx-auto font-medium">
          Dự đoán chính xác kết quả & tỷ số các vòng Playoff để giành tổng điểm cao nhất trên Bảng Xếp Hạng.
        </p>
      </div>

      {/* Rules & Scoring Guidelines */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 mb-12 shadow-2xl">
        <h2 className="text-lg font-black text-amber-400 mb-4 flex items-center space-x-2">
          <span>🎯 QUY TẮC & CÁCH TÍNH ĐIỂM PLAYOFF</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white mb-2">📘 Điều khoản gửi dự đoán:</h3>
            <ul className="space-y-1 text-slate-400">
              <li>• Mỗi cặp đấu Playoff chỉ được dự đoán 1 lần duy nhất.</li>
              <li>• Không thể sửa đổi sau khi bấm gửi.</li>
              <li>• Khóa dự đoán tự động theo thời gian quy định (`lockTime`).</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white mb-2">🏆 Thang điểm thưởng:</h3>
            <ul className="space-y-1 text-slate-300">
              <li>• <strong className="text-emerald-400">3 điểm</strong>: Đoán đúng đội thắng & đúng tỉ số.</li>
              <li>• <strong className="text-blue-400">2 điểm</strong>: Đoán đúng đội thắng, lệch đúng 1 game.</li>
              <li>• <strong className="text-amber-400">1 điểm</strong>: Đoán đúng đội thắng, lệch &gt;1 game.</li>
              <li>• <strong className="text-red-400">0 điểm</strong>: Đoán sai đội thắng.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Rounds Container */}
      {Object.entries(groupedByRound)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([round, confs]: any) => (
          <div key={round} className="mb-14">
            <div className="flex items-center space-x-4 mb-6 justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent flex-1"></div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wider text-center uppercase">
                {roundTitle(Number(round))}
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {confs.west.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-blue-400 tracking-widest text-center uppercase bg-blue-500/10 py-1.5 rounded-xl border border-blue-500/20">
                    🌅 Western Conference
                  </h3>
                  {confs.west.map((match: any) => {
                    const isPredicted = predictedIds.includes(match.id);
                    const isLocked = match.lockTime && new Date(match.lockTime) < new Date();
                    const disabled = isPredicted || isLocked;

                    return (
                      <div
                        key={match.id}
                        onClick={() => !disabled && setSelectedMatch(match)}
                        className={`glass-card p-5 rounded-2xl transition-all duration-300 flex items-center justify-between border ${
                          disabled
                            ? 'opacity-60 cursor-not-allowed border-slate-800'
                            : 'cursor-pointer hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="font-extrabold text-white text-sm sm:text-base">{match.teamA}</span>
                          <span className="text-xs font-bold text-slate-500">VS</span>
                          <span className="font-extrabold text-white text-sm sm:text-base">{match.teamB}</span>
                        </div>

                        <div>
                          {isPredicted ? (
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold">
                              ✓ Đã đoán
                            </span>
                          ) : isLocked ? (
                            <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl text-xs font-bold">
                              🔒 Đã khóa
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-400 transition">
                              Dự đoán →
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {confs.east.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-orange-400 tracking-widest text-center uppercase bg-orange-500/10 py-1.5 rounded-xl border border-orange-500/20">
                    🌇 Eastern Conference
                  </h3>
                  {confs.east.map((match: any) => {
                    const isPredicted = predictedIds.includes(match.id);
                    const isLocked = match.lockTime && new Date(match.lockTime) < new Date();
                    const disabled = isPredicted || isLocked;

                    return (
                      <div
                        key={match.id}
                        onClick={() => !disabled && setSelectedMatch(match)}
                        className={`glass-card p-5 rounded-2xl transition-all duration-300 flex items-center justify-between border ${
                          disabled
                            ? 'opacity-60 cursor-not-allowed border-slate-800'
                            : 'cursor-pointer hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="font-extrabold text-white text-sm sm:text-base">{match.teamA}</span>
                          <span className="text-xs font-bold text-slate-500">VS</span>
                          <span className="font-extrabold text-white text-sm sm:text-base">{match.teamB}</span>
                        </div>

                        <div>
                          {isPredicted ? (
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold">
                              ✓ Đã đoán
                            </span>
                          ) : isLocked ? (
                            <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl text-xs font-bold">
                              🔒 Đã khóa
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-400 transition">
                              Dự đoán →
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

      {/* Prediction Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 md:p-8 rounded-3xl border border-amber-500/40 shadow-2xl relative">
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-white text-center mb-6">
              {selectedMatch.teamA} vs {selectedMatch.teamB}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Đội chiến thắng</label>
                <select
                  value={winner}
                  onChange={(e) => setWinner(e.target.value)}
                  className="w-full glass-input p-3 rounded-2xl text-sm font-bold"
                >
                  <option value="" className="bg-slate-900">-- Chọn đội thắng --</option>
                  <option value={selectedMatch.teamA} className="bg-slate-900">{selectedMatch.teamA}</option>
                  <option value={selectedMatch.teamB} className="bg-slate-900">{selectedMatch.teamB}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Tỷ số chuỗi trận (Series Score)</label>
                <select
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full glass-input p-3 rounded-2xl text-sm font-bold"
                >
                  <option value="" className="bg-slate-900">-- Chọn tỉ số --</option>
                  <option value="4-0" className="bg-slate-900">4 - 0 (Swept)</option>
                  <option value="4-1" className="bg-slate-900">4 - 1</option>
                  <option value="4-2" className="bg-slate-900">4 - 2</option>
                  <option value="4-3" className="bg-slate-900">4 - 3 (Game 7)</option>
                </select>
              </div>

              <button
                onClick={handlePredictionSubmit}
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-2xl text-sm uppercase shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition duration-300 mt-4"
              >
                {submitting ? 'ĐANG LƯU...' : 'XÁC NHẬN GỬI DỰ ĐOÁN →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
