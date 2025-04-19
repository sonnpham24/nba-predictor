'use client';

import { requireLoginClient } from '@/lib/requireLoginClient';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Toast from '@/components/Toast';

export default function PredictPage() {
  requireLoginClient();
  const [matchups, setMatchups] = useState<any[]>([]);
  const [predictedIds, setPredictedIds] = useState<number[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [winner, setWinner] = useState('');
  const [score, setScore] = useState('');
  const [prevMatchups, setPrevMatchups] = useState<any[]>([]);
  const [newlyUpdatedIds, setNewlyUpdatedIds] = useState<number[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const teamLogos: { [teamName: string]: string } = {
    'Thunder (1)': '/logos/thunder.png',
    'Nuggets (4)': '/logos/nuggets.png',
    'Clippers (5)': '/logos/clippers.png',
    'Lakers (3)': '/logos/lakers.png',
    'Timberwolves (6)': '/logos/timberwolves.png',
    'Rockets (2)': '/logos/rockets.png',
    'Warriors (7)': '/logos/warriors.png',
    'Grizzlies (8)': '/logos/grizzlies.png',
  
    'Cavaliers (1)': '/logos/cavaliers.png',
    'Pacers (4)': '/logos/pacers.png',
    'Bucks (5)': '/logos/bucks.png',
    'Knicks (3)': '/logos/knicks.png',
    'Pistons (6)': '/logos/pistons.png',
    'Celtics (2)': '/logos/celtics.png',
    'Magic (7)': '/logos/magic.png',
    'Heat (8)': '/logos/heat.png',
  
    '?? (8)': '/logos/unknown.png',
  };
  const getTeamLogo = (teamName: string) => {
    return teamLogos[teamName] || '/logos/unknown.png';
  };

  useEffect(() => {
    const fetchMatchups = async () => {
      const res = await fetch('/api/matchups');
      const data = await res.json();
    
      // So sánh với dữ liệu cũ để tìm trận mới có kết quả
      const updatedIds: number[] = [];
    
      data.forEach((match: any) => {
        const prev = prevMatchups.find((m) => m.id === match.id);
    
        if (
          prev &&
          (!prev.actualWinner || !prev.actualScore) &&
          match.actualWinner &&
          match.actualScore
        ) {
          updatedIds.push(match.id);
        }
      });
    
      setMatchups(data);
      setPrevMatchups(data);
    
      if (updatedIds.length > 0) {
        if (updatedIds.length > 0) {
          setNewlyUpdatedIds(updatedIds);
        
          const updated = data.find((m: { id: number; }) => m.id === updatedIds[0]);
          if (updated?.actualWinner && updated?.actualScore) {
            setToastMsg(`${updated.teamA} vs ${updated.teamB} vừa có kết quả: ${updated.actualWinner} thắng ${updated.actualScore}`);
            setTimeout(() => setToastMsg(null), 5000);
          }
        
          setTimeout(() => {
            setNewlyUpdatedIds([]);
          }, 5000);
        }        
        setTimeout(() => {
          setNewlyUpdatedIds([]);
        }, 5000); // Highlight trong 5s
      }
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

  useEffect(() => {
    if (!selectedMatch) {
      setWinner('');
      setScore('');
    }
  }, [selectedMatch]);

  const handlePredictionSubmit = async () => {
    if (!selectedMatch || !winner || !score) {
      alert('Vui lòng nhập đầy đủ');
      return;
    }

    const validScores = ['4-0', '4-1', '4-2', '4-3'];
    if (!validScores.includes(score)) {
      alert('⚠️ Tỷ số không hợp lệ. Chỉ được nhập 4-0, 4-1, 4-2 hoặc 4-3');
      return;
    }

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
      alert('✅ Dự đoán đã được lưu!');
      setPredictedIds((prev) => [...prev, selectedMatch.id]);
      setSelectedMatch(null);
    } else {
      alert(data.error || '❌ Có lỗi xảy ra');
    }
  };

  const renderMatchupCard = (match: any) => {
    const isPredicted = predictedIds.includes(match.id);
    const now = new Date();
    const isLocked = match.lockTime && new Date(match.lockTime) < now;
    const isDisabled = isPredicted || isLocked;
    const formatLockTime = (iso: string) => {
      const date = new Date(iso);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };    

    return (
      <Dialog key={match.id}>
        <DialogTrigger asChild disabled={isDisabled}>
          <Card
            className={`
              p-4 rounded-xl cursor-pointer transition-all duration-200
              hover:shadow-2xl hover:scale-[1.02] hover:bg-blue-100
              ${
              isDisabled ? 'opacity-50 pointer-events-none' : ''}
              ${newlyUpdatedIds.includes(match.id) ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
              `}
            onClick={() => setSelectedMatch(match)}
          >
            <div className="flex items-center gap-2 font-medium">
              <img src={getTeamLogo(match.teamA)} alt={match.teamA} className="w-6 h-6" />
              <span>{match.teamA}</span>
              <span className="mx-2 text-gray-500">vs</span>
              <img src={getTeamLogo(match.teamB)} alt={match.teamB} className="w-6 h-6" />
              <span>{match.teamB}</span>
              {isPredicted && <span className="ml-2 text-green-600 text-sm">(Đã dự đoán)</span>}
              {isLocked && (<span className="ml-2 text-red-500 text-sm">(Đã khóa)</span>)}
            </div>
            {match.lockTime && (
              <div
                className={`text-xs mt-1 ${
                  new Date(match.lockTime) < new Date()
                    ? 'text-red-500 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                ⏰ Deadline: {formatLockTime(match.lockTime)}
              </div>
            )}
          </Card>
        </DialogTrigger>

        <DialogContent>
          <DialogTitle className="text-lg font-bold mb-2">
          <div className="flex items-center gap-2">
            <img src={getTeamLogo(match.teamA)} alt={match.teamA} className="w-6 h-6" />
            <span>{match.teamA}</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={getTeamLogo(match.teamB)} alt={match.teamB} className="w-6 h-6" />
            <span>{match.teamB}</span>
          </div>
          </DialogTitle>
          <div className="space-y-2">
            <select
              className="w-full p-2 border rounded"
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
            >
              <option value="">Chọn đội thắng</option>
              <option value={match.teamA}>{match.teamA}</option>
              <option value={match.teamB}>{match.teamB}</option>
            </select>

            <input
              className="w-full p-2 border rounded"
              placeholder="Tỷ số (vd: 4-2)"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />

            <Button onClick={handlePredictionSubmit} className="w-full transition-all duration-200 hover:brightness-105 hover:shadow-lg hover:-translate-y-0.5">
              Gửi dự đoán
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Lọc theo conference và round
  const groupedByRoundAndConference: {
    [round: number]: {
      west: any[],
      east: any[],
    }
  } = {};
  
  matchups.forEach((match) => {
    if (!groupedByRoundAndConference[match.round]) {
      groupedByRoundAndConference[match.round] = { west: [], east: [] };
    }
    groupedByRoundAndConference[match.round][match.conference as 'west' | 'east'].push(match);
  });
  
  const roundTitle = (round: number) => {
    switch (round) {
      case 1: return 'Vòng 1: 16 đội 8 cặp đấu';
      case 2: return 'Vòng 2: 8 đội 4 cặp đấu';
      case 3: return 'Vòng 3: 4 đội 2 cặp đấu: CHUNG KẾT MIỀN 🔥';
      case 4: return 'Vòng cuối: CHUNG KẾT TỔNG 👑';
      default: return `Vòng ${round}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animate px-4 md:px-6 pb-10 text-white">
      <div className="starry-background" />
      <br></br>
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6">
        🏀 Dự đoán NBA Playoff 2025
      </h1>
  
      <div className="bg-white rounded-xl shadow p-4 mb-6 max-w-4xl mx-auto text-sm md:text-base text-gray-700 space-y-3">
        <h2 className="text-base md:text-lg font-semibold text-black">📘 Quy luật dự đoán:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Mỗi trận chỉ được dự đoán một lần trước khi bắt đầu!</li>
          <li>Không thể chỉnh sửa sau khi gửi nên hãy suy nghĩ kỹ 😉</li>
        </ul>
  
        <h2 className="text-base md:text-lg font-semibold text-black mt-4">🎯 Cách tính điểm:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>✅ Đúng đội & đúng tỷ số: <strong>3 điểm</strong></li>
          <li>✅ Đúng đội, lệch đúng 1 trận: <strong>2 điểm</strong></li>
          <li>✅ Đúng đội, lệch &gt;1 trận: <strong>1 điểm</strong></li>
          <li>❌ Sai đội: <strong>0 điểm</strong></li>
        </ul>
      </div>
  
      {Object.entries(groupedByRoundAndConference)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([round, conferences]: any) => (
          <div key={round} className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">
              {roundTitle(Number(round))}
            </h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-center">🌅 Western Conference</h3>
                <div className="space-y-4">
                  {conferences.west.map((match: any) => renderMatchupCard(match))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-center">🌇 Eastern Conference</h3>
                <div className="space-y-4">
                  {conferences.east.map((match: any) => renderMatchupCard(match))}
                </div>
              </div>
            </div>
          </div>
        ))}
  
      <div className="text-center text-sm text-white opacity-60 mt-10">
        {/* Footer spacing for mobile scroll */}
        Copyright © NBA Predict 2025 - by Son Pham phamcongson297@gmail.com
      </div>
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </div>
  );  
}


