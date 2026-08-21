'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  HoopickPlayer,
  HoopickTeam,
  Position,
  RARITY_LABELS,
  TEAM_META,
  eligiblePositions,
  rarityFromOvr,
} from '@/lib/hoopickData';
import {
  DrawnPlayerCard,
  PlayoffGameResult,
  PlayoffSeriesResult,
  calculateDraftTeamOverall,
  drawPackFromConference,
  generatePlayoffOpponents,
  simulateFullSeries,
  simulateSingleGame,
} from '@/lib/hoopickEngine';
import toast from 'react-hot-toast';

const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];
const MAX_PACKS = 5;
const MAX_SKIPS = 2;

export default function HoopickPage() {
  const { locale } = useLanguage();

  // Game Setup States
  const [conference, setConference] = useState<'East' | 'West' | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Draft States
  const [myTeam, setMyTeam] = useState<Record<Position, HoopickPlayer | null>>({
    PG: null,
    SG: null,
    SF: null,
    PF: null,
    C: null,
  });
  const [packCount, setPackCount] = useState<number>(0);
  const [skipsLeft, setSkipsLeft] = useState<number>(MAX_SKIPS);
  const [currentPack, setCurrentPack] = useState<DrawnPlayerCard[] | null>(null);
  const [isOpeningPack, setIsOpeningPack] = useState<boolean>(false);
  const [pickedCardId, setPickedCardId] = useState<string | null>(null);
  const [pickedPlayerNames, setPickedPlayerNames] = useState<Set<string>>(new Set());

  // Playoff States
  const [playoffMode, setPlayoffMode] = useState<boolean>(false);
  const [playoffOpponents, setPlayoffOpponents] = useState<{
    round1: HoopickTeam;
    round2: HoopickTeam;
    confFinals: HoopickTeam;
    nbaFinals: HoopickTeam;
  } | null>(null);

  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0); // 0: Round 1, 1: Round 2, 2: Conf Finals, 3: NBA Finals
  const [currentSeries, setCurrentSeries] = useState<{
    roundName: string;
    oppTeam: HoopickTeam;
    myWins: number;
    oppWins: number;
    games: PlayoffGameResult[];
    isOver: boolean;
  } | null>(null);

  const [isChampion, setIsChampion] = useState<boolean>(false);
  const [selectedGameForBoxScore, setSelectedGameForBoxScore] = useState<PlayoffGameResult | null>(null);

  // Computed values
  const filledCount = Object.values(myTeam).filter((p) => p !== null).length;
  const teamOvr = calculateDraftTeamOverall(myTeam);

  const handleChooseConference = (conf: 'East' | 'West') => {
    setConference(conf);
  };

  const handleStartDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conference) {
      toast.error(locale === 'en' ? 'Please choose a Conference first' : 'Vui lòng chọn Miền Tây hoặc Miền Đông');
      return;
    }
    const finalName = teamName.trim() || (locale === 'en' ? 'Your Five' : 'Đội Hình 5 Người');
    setTeamName(finalName);
    setGameStarted(true);
    toast.success(locale === 'en' ? `Welcome! Open your 1st pack for ${finalName}` : `Chào mừng! Mở gói bài đầu tiên cho ${finalName}`);
  };

  const handleOpenPack = () => {
    if (!conference) return;
    if (packCount >= MAX_PACKS) {
      toast.error(locale === 'en' ? 'You have opened all 5 packs!' : 'Bạn đã mở hết 5 gói bài!');
      return;
    }

    setIsOpeningPack(true);
    setTimeout(() => {
      const cards = drawPackFromConference(conference);
      setCurrentPack(cards);
      setPickedCardId(null);
      setPackCount((prev) => prev + 1);
      setIsOpeningPack(false);
    }, 400);
  };

  const handleSkipPack = () => {
    if (skipsLeft <= 0) {
      toast.error(locale === 'en' ? 'No skips remaining!' : 'Bạn đã hết lượt Skip!');
      return;
    }
    if (!conference) return;

    setSkipsLeft((prev) => prev - 1);
    setIsOpeningPack(true);
    setTimeout(() => {
      const cards = drawPackFromConference(conference);
      setCurrentPack(cards);
      setPickedCardId(null);
      setIsOpeningPack(false);
      toast.success(locale === 'en' ? 'Pack rerolled!' : 'Đã đổi gói bài mới!');
    }, 400);
  };

  const handlePickPlayer = (card: DrawnPlayerCard, targetPos: Position) => {
    if (myTeam[targetPos]) {
      toast.error(locale === 'en' ? `${targetPos} slot is already filled!` : `Vị trí ${targetPos} đã có cầu thủ!`);
      return;
    }

    if (pickedPlayerNames.has(card.n)) {
      toast.error(locale === 'en' ? `${card.n} is already drafted in your team!` : `${card.n} đã có trong đội hình của bạn!`);
      return;
    }

    // Add player to team
    const newPlayer: HoopickPlayer = {
      n: card.n,
      o: card.o,
      p: targetPos,
      t: card.t,
      e: card.e,
    };

    const newTeam = { ...myTeam, [targetPos]: newPlayer };
    setMyTeam(newTeam);

    const newPickedNames = new Set(pickedPlayerNames);
    newPickedNames.add(card.n);
    setPickedPlayerNames(newPickedNames);

    setPickedCardId(card.cardId);

    toast.success(locale === 'en' ? `Drafted ${card.n} (${card.o} OVR) to ${targetPos}!` : `Đã chọn ${card.n} (${card.o} OVR) vào vị trí ${targetPos}!`);

    // Check if team is complete (5 positions filled)
    const newFilledCount = Object.values(newTeam).filter((p) => p !== null).length;
    if (newFilledCount === 5) {
      toast.success(locale === 'en' ? '🎉 Your Starting Five is complete! Ready for Playoffs!' : '🎉 Đội hình 5 người đã hoàn tất! Sẵn sàng đấu Playoff!');
    }
  };

  const handleStartPlayoffs = () => {
    if (filledCount < 5) {
      toast.error(locale === 'en' ? 'Please complete your Starting 5 before starting Playoffs!' : 'Vui lòng hoàn thiện đủ 5 vị trí trước khi đấu Playoff!');
      return;
    }

    if (!conference) return;

    const opps = generatePlayoffOpponents(conference);
    setPlayoffOpponents(opps);
    setPlayoffMode(true);
    setCurrentRoundIndex(0);

    // Initialize 1st Round Series
    startSeries(opps.round1, 'First Round');
  };

  const startSeries = (oppTeam: HoopickTeam, roundName: string) => {
    setCurrentSeries({
      roundName,
      oppTeam,
      myWins: 0,
      oppWins: 0,
      games: [],
      isOver: false,
    });
    setSelectedGameForBoxScore(null);
  };

  const handleSimulateNextGame = () => {
    if (!currentSeries || currentSeries.isOver) return;

    const gameNum = currentSeries.games.length + 1;
    const gameRes = simulateSingleGame(myTeam, currentSeries.oppTeam, gameNum);

    const newMyWins = currentSeries.myWins + (gameRes.winner === 'user' ? 1 : 0);
    const newOppWins = currentSeries.oppWins + (gameRes.winner === 'opp' ? 1 : 0);
    const isOver = newMyWins === 4 || newOppWins === 4;

    const updatedGames = [...currentSeries.games, gameRes];
    setCurrentSeries({
      ...currentSeries,
      myWins: newMyWins,
      oppWins: newOppWins,
      games: updatedGames,
      isOver,
    });
    setSelectedGameForBoxScore(gameRes);

    if (gameRes.winner === 'user') {
      toast.success(`Game ${gameNum}: WIN! (${gameRes.myScore} - ${gameRes.oppScore})`);
    } else {
      toast.error(`Game ${gameNum}: LOSS! (${gameRes.myScore} - ${gameRes.oppScore})`);
    }

    if (isOver) {
      if (newMyWins === 4) {
        toast.success(`🎉 Won the ${currentSeries.roundName} (4-${newOppWins})!`);
      } else {
        toast.error(`❌ Eliminated in ${currentSeries.roundName} (4-${newMyWins}). Better luck next time!`);
      }
    }
  };

  const handleSimulateFullSeries = () => {
    if (!currentSeries || currentSeries.isOver) return;

    const seriesRes = simulateFullSeries(myTeam, currentSeries.oppTeam, currentSeries.roundName);

    setCurrentSeries({
      ...currentSeries,
      myWins: seriesRes.myWins,
      oppWins: seriesRes.oppWins,
      games: seriesRes.games,
      isOver: true,
    });

    if (seriesRes.games.length > 0) {
      setSelectedGameForBoxScore(seriesRes.games[seriesRes.games.length - 1]);
    }

    if (seriesRes.winner === 'user') {
      toast.success(`🎉 Won the ${currentSeries.roundName} (${seriesRes.myWins}-${seriesRes.oppWins})!`);
    } else {
      toast.error(`❌ Eliminated in ${currentSeries.roundName} (${seriesRes.oppWins}-${seriesRes.myWins})!`);
    }
  };

  const handleAdvancePlayoffRound = () => {
    if (!playoffOpponents || !currentSeries || !currentSeries.isOver) return;

    if (currentSeries.myWins < 4) {
      toast.error(locale === 'en' ? 'You were eliminated! Reset to try again.' : 'Bạn đã bị loại! Bấm Reset để thử lại.');
      return;
    }

    const nextIndex = currentRoundIndex + 1;
    if (nextIndex === 1) {
      setCurrentRoundIndex(1);
      startSeries(playoffOpponents.round2, 'Conference Semifinals');
    } else if (nextIndex === 2) {
      setCurrentRoundIndex(2);
      startSeries(playoffOpponents.confFinals, `${conference === 'West' ? 'Western' : 'Eastern'} Conference Finals`);
    } else if (nextIndex === 3) {
      setCurrentRoundIndex(3);
      startSeries(playoffOpponents.nbaFinals, 'NBA Finals');
    } else {
      // Champion!
      setIsChampion(true);
      toast.success(locale === 'en' ? '🏆 CONGRATULATIONS! YOU ARE THE NBA CHAMPION!' : '🏆 CHÚC MỪNG! BẠN ĐÃ ĐẠT CÚP VÔ ĐỊCH NBA FINALS!');
    }
  };

  const handleResetGame = () => {
    setConference(null);
    setTeamName('');
    setGameStarted(false);
    setMyTeam({ PG: null, SG: null, SF: null, PF: null, C: null });
    setPackCount(0);
    setSkipsLeft(MAX_SKIPS);
    setCurrentPack(null);
    setPickedCardId(null);
    setPickedPlayerNames(new Set());
    setPlayoffMode(false);
    setPlayoffOpponents(null);
    setCurrentRoundIndex(0);
    setCurrentSeries(null);
    setIsChampion(false);
    setSelectedGameForBoxScore(null);
    toast.success(locale === 'en' ? 'Game reset! Draft a new team.' : 'Đã làm mới Game! Hãy bốc đội hình mới.');
  };

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'icon':
        return 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/30 border border-amber-300';
      case 'elite':
        return 'bg-purple-900/60 text-purple-300 border border-purple-500/40 shadow-sm';
      case 'gold':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm';
      case 'silver':
        return 'bg-slate-700/60 text-slate-300 border border-slate-500/40';
      default:
        return 'bg-amber-900/40 text-amber-500 border border-amber-800/40';
    }
  };

  const getCardBorderStyle = (rarity: string) => {
    switch (rarity) {
      case 'icon':
        return 'border-2 border-amber-400 shadow-2xl shadow-rose-500/30 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950';
      case 'elite':
        return 'border-2 border-purple-500 shadow-xl shadow-purple-500/20 bg-slate-900';
      case 'gold':
        return 'border-2 border-amber-500/80 shadow-lg shadow-amber-500/20 bg-slate-900';
      case 'silver':
        return 'border border-slate-600 bg-slate-900/90';
      default:
        return 'border border-amber-900/60 bg-slate-950';
    }
  };

  const roundNames = ['First Round', 'Conference Semis', 'Conference Finals', 'NBA Finals'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Header Bar */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest">
          <span>🏀 HOOPICK — DRAFT YOUR FIVE</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wider gradient-text-gold">
          HOOPICK
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm font-medium leading-normal max-w-xl mx-auto">
          {locale === 'en'
            ? 'Pick a conference, open packs of historical NBA rosters, draft your starting 5, and lead your team to an NBA Championship!'
            : 'Chọn Miền, mở gói thẻ đội hình xuất phát NBA lịch sử, draft đội 5 người và dẫn dắt đội bóng chinh phục Cúp vô địch NBA Finals!'}
        </p>

        {/* Stats Bar */}
        {gameStarted && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-4 max-w-3xl mx-auto text-center font-mono">
            <div className="glass-card p-2.5 rounded-2xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{locale === 'en' ? 'CONF' : 'MIỀN'}</span>
              <span className="text-xs font-extrabold text-amber-400 uppercase">{conference}</span>
            </div>

            <div className="glass-card p-2.5 rounded-2xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{locale === 'en' ? 'TEAM' : 'ĐỘI BÓNG'}</span>
              <span className="text-xs font-extrabold text-white truncate block">{teamName}</span>
            </div>

            <div className="glass-card p-2.5 rounded-2xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{locale === 'en' ? 'PACKS' : 'GÓI BÀI'}</span>
              <span className="text-xs font-extrabold text-white">{packCount}/{MAX_PACKS}</span>
            </div>

            <div className="glass-card p-2.5 rounded-2xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{locale === 'en' ? 'LINEUP' : 'ĐỘI HÌNH'}</span>
              <span className="text-xs font-extrabold text-emerald-400">{filledCount}/5</span>
            </div>

            <div className="glass-card p-2.5 rounded-2xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{locale === 'en' ? 'SKIPS' : 'LƯỢT SKIP'}</span>
              <span className="text-xs font-extrabold text-orange-400">{skipsLeft}</span>
            </div>

            <div className="glass-card p-2.5 rounded-2xl border border-amber-500/30">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{locale === 'en' ? 'TEAM OVR' : 'CHỈ SỐ OVR'}</span>
              <span className="text-sm font-black text-amber-400">{teamOvr}</span>
            </div>
          </div>
        )}
      </div>

      {/* STEP 1: CONFERENCE & TEAM NAME SETUP */}
      {!gameStarted && (
        <form onSubmit={handleStartDraft} className="glass-card p-8 rounded-3xl border border-amber-500/30 shadow-2xl max-w-2xl mx-auto space-y-8 text-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">STEP 1: SELECT CONFERENCE</span>
            <h2 className="text-xl font-black text-white">
              {locale === 'en' ? 'Choose Conference to Draft From' : 'Chọn Miền Thi Đấu & Bốc Thẻ'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleChooseConference('West')}
                className={`p-6 rounded-2xl border-2 text-center transition duration-300 ${
                  conference === 'West'
                    ? 'border-amber-500 bg-gradient-to-b from-amber-500/20 to-orange-500/10 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-xl flex items-center justify-center mx-auto mb-3">
                  W
                </div>
                <h3 className="text-base font-black text-white">WESTERN CONFERENCE</h3>
                <p className="text-xs text-slate-400 mt-1">Lakers, Warriors, Spurs, Nuggets, Suns...</p>
              </button>

              <button
                type="button"
                onClick={() => handleChooseConference('East')}
                className={`p-6 rounded-2xl border-2 text-center transition duration-300 ${
                  conference === 'East'
                    ? 'border-amber-500 bg-gradient-to-b from-amber-500/20 to-orange-500/10 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 font-black text-xl flex items-center justify-center mx-auto mb-3">
                  E
                </div>
                <h3 className="text-base font-black text-white">EASTERN CONFERENCE</h3>
                <p className="text-xs text-slate-400 mt-1">Bulls, Heat, Celtics, Cavs, Bucks, Pistons...</p>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-left">
              {locale === 'en' ? 'Enter Your Custom Team Name:' : 'Đặt Tên Cho Đội Bóng Của Bạn:'}
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder={locale === 'en' ? 'e.g. BuzzerBet All-Stars' : 'Ví dụ: BuzzerBet All-Stars'}
              maxLength={30}
              className="w-full glass-input p-4 rounded-2xl text-sm font-bold text-white placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={!conference}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 disabled:opacity-40 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl hover:scale-[1.02] transition duration-300"
          >
            {locale === 'en' ? 'START DRAFTING PACKS →' : 'BẮT ĐẦU BỐC THẺ ĐỘI HÌNH →'}
          </button>
        </form>
      )}

      {/* STEP 2: PACK OPENING & SELECTION ZONE */}
      {gameStarted && !playoffMode && (
        <div className="space-y-8">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
            <div>
              <h2 className="text-base font-black text-white">
                {locale === 'en' ? `Pack ${packCount}/${MAX_PACKS}` : `Gói Bài ${packCount}/${MAX_PACKS}`}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {locale === 'en'
                  ? 'Open a pack to reveal 5 historical roster cards. Pick 1 player for your starting 5!'
                  : 'Mở gói bài để xem 5 cầu thủ xuất phát lịch sử. Chọn 1 cầu thủ cho đội hình 5 người!'}
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={handleOpenPack}
                disabled={isOpeningPack || packCount >= MAX_PACKS || (currentPack !== null && pickedCardId === null)}
                className="flex-1 sm:flex-initial px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-40 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition duration-300 whitespace-nowrap"
              >
                {isOpeningPack
                  ? (locale === 'en' ? 'OPENING...' : 'ĐANG MỞ...')
                  : currentPack === null
                  ? (locale === 'en' ? '📦 OPEN PACK' : '📦 MỞ GÓI BÀI')
                  : (locale === 'en' ? '📦 NEXT PACK' : '📦 MỞ GÓI TIẾP')}
              </button>

              {currentPack !== null && pickedCardId === null && skipsLeft > 0 && (
                <button
                  onClick={handleSkipPack}
                  disabled={isOpeningPack}
                  className="px-4 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-orange-400 font-extrabold rounded-2xl text-xs whitespace-nowrap transition"
                >
                  🔄 {locale === 'en' ? `Skip (${skipsLeft} left)` : `Đổi Gói (${skipsLeft} lượt)`}
                </button>
              )}
            </div>
          </div>

          {/* Cards Reveal Grid */}
          {currentPack && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono px-2">
                <span className="text-slate-400">
                  {locale === 'en' ? 'Franchise Roster:' : 'Đội Hình:'} <strong className="text-amber-400 font-sans text-sm">{currentPack[0].t} ({currentPack[0].e})</strong>
                </span>
                {pickedCardId && (
                  <span className="text-emerald-400 font-bold">
                    ✅ {locale === 'en' ? 'Player drafted for this pack!' : 'Đã chọn 1 cầu thủ cho gói này!'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                {currentPack.map((card) => {
                  const rarity = rarityFromOvr(card.o);
                  const isPicked = card.cardId === pickedCardId;
                  const isAlreadyInTeam = pickedPlayerNames.has(card.n);
                  const eligPosList = eligiblePositions(card.n, card.p);

                  return (
                    <div
                      key={card.cardId}
                      className={`p-4 rounded-2xl flex flex-col justify-between space-y-3 relative transition duration-300 ${getCardBorderStyle(
                        rarity
                      )} ${isPicked ? 'ring-2 ring-emerald-400 scale-[1.03]' : ''} ${
                        pickedCardId !== null && !isPicked ? 'opacity-50 grayscale-[30%]' : ''
                      }`}
                    >
                      <div className="space-y-2 text-center">
                        {/* Rarity Badge */}
                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block tracking-wider ${getRarityBadgeStyle(rarity)}`}>
                          {RARITY_LABELS[rarity]}
                        </span>

                        {/* OVR Rating */}
                        <div className="text-3xl font-black font-mono text-white leading-none">
                          {card.o}
                        </div>

                        {/* Position Badge */}
                        <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                          {card.p} {eligPosList.length > 1 && `(${eligPosList.join('/')})`}
                        </div>

                        {/* Name & Franchise */}
                        <div>
                          <div className="text-xs font-black text-white leading-tight">{card.n}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5">{card.t} '{card.e.slice(2)}</div>
                        </div>
                      </div>

                      {/* Pick Buttons per Eligible Position */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        {isPicked ? (
                          <div className="py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase rounded-xl text-center">
                            ✅ DRAFTED
                          </div>
                        ) : isAlreadyInTeam ? (
                          <div className="py-2 bg-slate-900 text-slate-500 text-[10px] font-bold uppercase rounded-xl text-center">
                            OWNED
                          </div>
                        ) : pickedCardId !== null ? (
                          <div className="py-2 bg-slate-900/50 text-slate-600 text-[10px] font-bold uppercase rounded-xl text-center">
                            LOCKED
                          </div>
                        ) : (
                          eligPosList.map((pos) => {
                            const isSlotFilled = myTeam[pos] !== null;
                            return (
                              <button
                                key={pos}
                                onClick={() => handlePickPlayer(card, pos)}
                                disabled={isSlotFilled}
                                className={`w-full py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                                  isSlotFilled
                                    ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                                    : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-slate-700'
                                }`}
                              >
                                {isSlotFilled ? `${pos} Filled` : `+ Add to ${pos}`}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TACTICAL BASKETBALL COURT LINEUP */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white leading-normal">
                  {locale === 'en' ? 'Tactical Basketball Court Starting 5' : 'Sơ Đồ Đội Hình 5 Người Trên Sân Bóng'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {locale === 'en'
                    ? 'Fill all 5 slots (PG, SG, SF, PF, C) to launch your Playoff Run!'
                    : 'Điền đủ 5 vị trí (PG, SG, SF, PF, C) để bắt đầu chiến dịch Playoff!'}
                </p>
              </div>

              {filledCount === 5 && (
                <button
                  onClick={handleStartPlayoffs}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 hover:scale-105 transition duration-300"
                >
                  🚀 {locale === 'en' ? 'START PLAYOFFS →' : 'BẮT ĐẦU ĐẤU PLAYOFF →'}
                </button>
              )}
            </div>

            {/* Tactical Court View */}
            <div className="relative max-w-md mx-auto aspect-[4/5] bg-gradient-to-b from-amber-950/80 via-slate-950 to-slate-950 border-2 border-amber-700/60 rounded-3xl p-4 shadow-2xl overflow-hidden">
              {/* Court SVG Lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 500">
                <rect x="10" y="10" width="380" height="480" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                <path d="M40,20 L40,140 A200,200 0 0 0 360,140 L360,20" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                <rect x="130" y="10" width="140" height="190" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="200" cy="200" r="60" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="200" cy="35" r="10" fill="none" stroke="#fbbf24" strokeWidth="3" />
              </svg>

              {/* Slot Positions on Court */}
              {/* PG (Bottom Center) */}
              <CourtSlotCard position="PG" player={myTeam.PG} style={{ left: '50%', top: '88%' }} />

              {/* SG (Bottom Right) */}
              <CourtSlotCard position="SG" player={myTeam.SG} style={{ left: '82%', top: '65%' }} />

              {/* SF (Bottom Left) */}
              <CourtSlotCard position="SF" player={myTeam.SF} style={{ left: '18%', top: '65%' }} />

              {/* PF (Top Left) */}
              <CourtSlotCard position="PF" player={myTeam.PF} style={{ left: '28%', top: '30%' }} />

              {/* C (Top Right) */}
              <CourtSlotCard position="C" player={myTeam.C} style={{ left: '72%', top: '30%' }} />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PLAYOFF TOURNAMENT SIMULATION */}
      {playoffMode && currentSeries && (
        <div className="space-y-8">
          {/* Bracket Progress Header */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-base font-black text-white">
                🏆 {locale === 'en' ? 'NBA Playoff Championship Run' : 'Chiến Dịch Playoff NBA'}
              </h2>
              <span className="text-xs font-mono text-amber-400">
                {teamName} ({teamOvr} OVR)
              </span>
            </div>

            {/* 4 Bracket Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
              {roundNames.map((rName, idx) => {
                const isCurrent = idx === currentRoundIndex;
                const isDone = idx < currentRoundIndex;

                return (
                  <div
                    key={rName}
                    className={`p-3 rounded-2xl border text-xs font-bold transition ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : isCurrent
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="block text-[10px] uppercase">{isDone ? '✅ PASSED' : isCurrent ? '⚡ PLAYING' : 'LOCKED'}</span>
                    <span className="font-sans font-black mt-0.5 block truncate">{rName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Championship Trophy Banner */}
          {isChampion && (
            <div className="glass-card p-8 rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-950/60 via-slate-950 to-slate-950 text-center space-y-4 shadow-2xl animate-scale-in">
              <div className="text-6xl animate-bounce">🏆</div>
              <h2 className="text-3xl sm:text-4xl font-black text-amber-300 uppercase tracking-wider">
                NBA FINALS CHAMPIONS!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-normal">
                {locale === 'en'
                  ? `Congratulations! ${teamName} (${teamOvr} OVR) won the NBA Championship Trophy!`
                  : `Chúc mừng! ${teamName} (${teamOvr} OVR) đã xuất sắc giành Cúp Vô Địch NBA Finals!`}
              </p>
              <button
                onClick={handleResetGame}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl hover:scale-105 transition duration-300"
              >
                🔄 {locale === 'en' ? 'PLAY AGAIN / DRAFT NEW TEAM' : 'CHƠI LẠI / BỐC ĐỘI HÌNH MỚI'}
              </button>
            </div>
          )}

          {/* Live Scoreboard Card */}
          {!isChampion && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl text-center">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                  {currentSeries.roundName.toUpperCase()} • BEST OF 7
                </span>
                <h3 className="text-xl font-black text-white">
                  {teamName} vs {currentSeries.oppTeam.franchise} ({currentSeries.oppTeam.year})
                </h3>
              </div>

              {/* Score Display */}
              <div className="grid grid-cols-3 items-center gap-4 max-w-lg mx-auto py-4">
                {/* User Team */}
                <div className="space-y-1 text-center">
                  <span className="text-xs font-bold text-slate-400 truncate block">{teamName}</span>
                  <div className="text-4xl font-black font-mono text-amber-400">{currentSeries.myWins}</div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{teamOvr} OVR</span>
                </div>

                {/* VS Badge */}
                <div className="flex flex-col items-center space-y-1">
                  <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-slate-400">
                    VS
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-bold">
                    Series: {currentSeries.myWins} - {currentSeries.oppWins}
                  </span>
                </div>

                {/* Opponent Team */}
                <div className="space-y-1 text-center">
                  <span className="text-xs font-bold text-slate-400 truncate block">{currentSeries.oppTeam.franchise}</span>
                  <div className="text-4xl font-black font-mono text-orange-500">{currentSeries.oppWins}</div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {Object.values(currentSeries.oppTeam.roster).reduce((sum, r) => sum + r.o, 0) / 5} OVR
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {!currentSeries.isOver ? (
                  <>
                    <button
                      onClick={handleSimulateNextGame}
                      className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition"
                    >
                      ⚡ {locale === 'en' ? `SIMULATE GAME ${currentSeries.games.length + 1}` : `MÔ PHỎNG TRẬN ${currentSeries.games.length + 1}`}
                    </button>

                    <button
                      onClick={handleSimulateFullSeries}
                      className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition"
                    >
                      ⏩ {locale === 'en' ? 'SIMULATE ENTIRE SERIES' : 'MÔ PHỎNG TOÀN BỘ SERIES'}
                    </button>
                  </>
                ) : currentSeries.myWins === 4 ? (
                  <button
                    onClick={handleAdvancePlayoffRound}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 hover:scale-105 transition"
                  >
                    🎉 {locale === 'en' ? 'ADVANCE TO NEXT ROUND →' : 'TIẾN VÀO VÒNG TIẾP THEO →'}
                  </button>
                ) : (
                  <button
                    onClick={handleResetGame}
                    className="w-full sm:w-auto px-8 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-black rounded-2xl text-xs uppercase tracking-wider transition"
                  >
                    ❌ {locale === 'en' ? 'ELIMINATED! START NEW DRAFT' : 'ĐÃ BỊ LOẠI! THỬ LẠI DRAFT MỚI'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* BOX SCORE SECTION */}
          {selectedGameForBoxScore && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white">
                  📊 Game {selectedGameForBoxScore.gameNumber} Box Score ({selectedGameForBoxScore.myScore} - {selectedGameForBoxScore.oppScore})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* My Team Box Score */}
                <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-amber-400 font-mono uppercase">{teamName}</h4>
                  <table className="w-full text-xs font-mono text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-500 border-b border-slate-800">
                        <th className="pb-1">POS</th>
                        <th className="pb-1">PLAYER</th>
                        <th className="pb-1 text-center">PTS</th>
                        <th className="pb-1 text-center">REB</th>
                        <th className="pb-1 text-center">AST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {selectedGameForBoxScore.myBoxScore.map((st) => (
                        <tr key={st.name}>
                          <td className="py-1.5 text-slate-400 font-bold">{st.pos}</td>
                          <td className="py-1.5 text-white font-sans font-bold">{st.name}</td>
                          <td className="py-1.5 text-center font-bold text-amber-400">{st.pts}</td>
                          <td className="py-1.5 text-center text-slate-300">{st.reb}</td>
                          <td className="py-1.5 text-center text-slate-300">{st.ast}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Opponent Team Box Score */}
                <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-orange-400 font-mono uppercase">{currentSeries.oppTeam.franchise} ({currentSeries.oppTeam.year})</h4>
                  <table className="w-full text-xs font-mono text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-500 border-b border-slate-800">
                        <th className="pb-1">POS</th>
                        <th className="pb-1">PLAYER</th>
                        <th className="pb-1 text-center">PTS</th>
                        <th className="pb-1 text-center">REB</th>
                        <th className="pb-1 text-center">AST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {selectedGameForBoxScore.oppBoxScore.map((st) => (
                        <tr key={st.name}>
                          <td className="py-1.5 text-slate-400 font-bold">{st.pos}</td>
                          <td className="py-1.5 text-white font-sans font-bold">{st.name}</td>
                          <td className="py-1.5 text-center font-bold text-orange-400">{st.pts}</td>
                          <td className="py-1.5 text-center text-slate-300">{st.reb}</td>
                          <td className="py-1.5 text-center text-slate-300">{st.ast}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Reset Row */}
          <div className="text-center pt-4">
            <button
              onClick={handleResetGame}
              className="px-6 py-2.5 rounded-full border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 text-xs font-bold transition"
            >
              🔄 {locale === 'en' ? 'Reset Team & Collection' : 'Làm Mới Đội Hình & Chơi Lại'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Tactical Court Position Slot Component
function CourtSlotCard({
  position,
  player,
  style,
}: {
  position: Position;
  player: HoopickPlayer | null;
  style: React.CSSProperties;
}) {
  const rarity = player ? rarityFromOvr(player.o) : 'bronze';

  const getSlotBorder = () => {
    if (!player) return 'border-dashed border-slate-700 bg-slate-950/80 text-slate-600';
    switch (rarity) {
      case 'icon':
        return 'border-2 border-amber-400 bg-gradient-to-b from-purple-950 to-slate-950 text-amber-300 shadow-lg shadow-rose-500/20';
      case 'elite':
        return 'border-2 border-purple-500 bg-slate-900 text-purple-300 shadow-md';
      case 'gold':
        return 'border-2 border-amber-500 bg-slate-900 text-amber-400 shadow-md';
      default:
        return 'border border-slate-600 bg-slate-900 text-slate-200';
    }
  };

  return (
    <div
      style={style}
      className={`absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center text-center p-2 transition duration-300 ${getSlotBorder()}`}
    >
      <span className="text-[10px] font-black font-mono uppercase text-slate-400 leading-none">{position}</span>

      {player ? (
        <div className="space-y-0.5 mt-1">
          <div className="text-base sm:text-lg font-black font-mono leading-none">{player.o}</div>
          <div className="text-[10px] font-bold font-sans text-white leading-tight truncate max-w-[70px] sm:max-w-[80px]">
            {player.n}
          </div>
        </div>
      ) : (
        <span className="text-[10px] font-bold text-slate-600 mt-2">EMPTY</span>
      )}
    </div>
  );
}
