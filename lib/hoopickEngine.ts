import {
  HOOPICK_TEAMS,
  HoopickPlayer,
  HoopickTeam,
  Position,
  teamOverallRating,
} from './hoopickData';

export interface DrawnPlayerCard {
  cardId: string;
  n: string; // Name
  o: number; // Overall
  p: Position; // Primary Position
  t: string; // Franchise
  e: string; // Year/Era
}

export interface PlayoffPlayerStat {
  name: string;
  pos: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
}

export interface TimelineFrame {
  quarter: string;
  clock: string;
  myScore: number;
  oppScore: number;
}

export interface PlayoffGameResult {
  gameNumber: number;
  myScore: number;
  oppScore: number;
  winner: 'user' | 'opp';
  timeline: TimelineFrame[];
  myBoxScore: PlayoffPlayerStat[];
  oppBoxScore: PlayoffPlayerStat[];
}

export interface PlayoffSeriesResult {
  roundName: string;
  oppTeam: HoopickTeam;
  myWins: number;
  oppWins: number;
  winner: 'user' | 'opp';
  games: PlayoffGameResult[];
}

const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

export function drawPackFromConference(conf: 'East' | 'West'): DrawnPlayerCard[] {
  const pool = HOOPICK_TEAMS.filter((t) => t.conference === conf);
  const selectedTeam = pool[Math.floor(Math.random() * pool.length)];

  return POSITIONS.map((pos, idx) => {
    const r = selectedTeam.roster[pos];
    return {
      cardId: `c_${selectedTeam.franchise.replace(/\s+/g, '')}_${selectedTeam.year}_${pos}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      n: r.n,
      o: r.o,
      p: pos,
      t: selectedTeam.franchise,
      e: selectedTeam.year,
    };
  });
}

export function calculateDraftTeamOverall(myTeam: Record<Position, HoopickPlayer | null>): number {
  const players = Object.values(myTeam).filter((p): p is HoopickPlayer => p !== null);
  if (players.length === 0) return 0;
  const totalOvr = players.reduce((sum, p) => sum + p.o, 0);
  return Math.round(totalOvr / players.length);
}

export function generatePlayoffOpponents(userConf: 'East' | 'West'): {
  round1: HoopickTeam;
  round2: HoopickTeam;
  confFinals: HoopickTeam;
  nbaFinals: HoopickTeam;
} {
  const sameConfPool = HOOPICK_TEAMS.filter((t) => t.conference === userConf);
  const oppConfPool = HOOPICK_TEAMS.filter((t) => t.conference !== userConf);

  const round1Pool = sameConfPool.filter((t) => t.tier === 'Playoff') || sameConfPool;
  const round2Pool = sameConfPool.filter((t) => t.tier === 'Contender') || sameConfPool;
  const confFinalsPool = sameConfPool.filter((t) => t.tier === 'Legendary') || sameConfPool;
  const nbaFinalsPool = oppConfPool.filter((t) => t.tier === 'Legendary') || oppConfPool;

  const getRandom = (arr: HoopickTeam[]) => arr[Math.floor(Math.random() * arr.length)];

  return {
    round1: getRandom(round1Pool),
    round2: getRandom(round2Pool),
    confFinals: getRandom(confFinalsPool),
    nbaFinals: getRandom(nbaFinalsPool),
  };
}

/**
 * Increased Difficulty Game Simulation Engine
 * - Playoff opponents have home-court & defensive intensity (+3.0 OVR advantage).
 * - Higher OVR teams win consistently; mid-tier user teams (78-83 OVR) face tough challenge against 90+ OVR teams.
 * - 40 Granular Timeline Frames (10 frames per quarter) for second-by-second live ticking.
 */
export function simulateSingleGame(
  myTeam: Record<Position, HoopickPlayer | null>,
  oppTeam: HoopickTeam,
  gameNumber: number
): PlayoffGameResult {
  const myOvr = calculateDraftTeamOverall(myTeam);
  const oppOvr = teamOverallRating(oppTeam);

  // Playoff opponent home-court & playoff intensity (+3 OVR)
  const effectiveOppOvr = oppOvr + 3.0;
  const ovrDiff = myOvr - effectiveOppOvr;

  // Moderate game shooting luck variance (-10 to +10)
  const myLuck = (Math.random() + Math.random() + Math.random() - 1.5) * 6.5;
  const oppLuck = (Math.random() + Math.random() + Math.random() - 1.5) * 6.5;

  let myTotalScore = Math.max(78, Math.round(98 + ovrDiff * 1.45 + myLuck));
  let oppTotalScore = Math.max(78, Math.round(101 - ovrDiff * 1.45 + oppLuck));

  if (myTotalScore === oppTotalScore) {
    if (Math.random() > 0.5) myTotalScore += 3;
    else oppTotalScore += 3;
  }

  const winner = myTotalScore > oppTotalScore ? 'user' : 'opp';

  // Generate 40 Granular Timeline Frames (10 per quarter)
  const timeline: TimelineFrame[] = [];
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const clockLabels = [
    '12:00', '10:48', '09:36', '08:24', '07:12',
    '06:00', '04:48', '03:36', '02:24', '01:12'
  ];

  let frameCount = 0;
  const totalFrames = 40;

  for (let qIdx = 0; qIdx < 4; qIdx++) {
    const qName = quarters[qIdx];
    for (let cIdx = 0; cIdx < 10; cIdx++) {
      frameCount++;
      const progress = frameCount / totalFrames;
      const isLast = frameCount === totalFrames;

      const clockText = isLast ? '00:00 (BUZZER)' : clockLabels[cIdx];

      const mScore = isLast
        ? myTotalScore
        : Math.min(myTotalScore - 1, Math.round(myTotalScore * progress * (0.94 + Math.random() * 0.12)));
      const oScore = isLast
        ? oppTotalScore
        : Math.min(oppTotalScore - 1, Math.round(oppTotalScore * progress * (0.94 + Math.random() * 0.12)));

      timeline.push({
        quarter: qName,
        clock: clockText,
        myScore: Math.max(0, mScore),
        oppScore: Math.max(0, oScore),
      });
    }
  }

  // Generate Box Scores
  const myPlayers = POSITIONS.map((pos) => {
    const p = myTeam[pos];
    return {
      n: p ? p.n : `${pos} Replacement`,
      o: p ? p.o : 70,
      p: pos,
    };
  });

  const oppPlayers = POSITIONS.map((pos) => ({
    n: oppTeam.roster[pos].n,
    o: oppTeam.roster[pos].o,
    p: pos,
  }));

  const myBoxScore = generateTeamBoxScore(myPlayers, myTotalScore);
  const oppBoxScore = generateTeamBoxScore(oppPlayers, oppTotalScore);

  return {
    gameNumber,
    myScore: myTotalScore,
    oppScore: oppTotalScore,
    winner,
    timeline,
    myBoxScore,
    oppBoxScore,
  };
}

function generateTeamBoxScore(
  players: { n: string; o: number; p: Position }[],
  totalPoints: number
): PlayoffPlayerStat[] {
  const totalOvr = players.reduce((sum, p) => sum + p.o, 0);

  let allocatedPoints = 0;
  const rawStats = players.map((p) => {
    const weight = p.o / totalOvr;
    const basePts = Math.round(totalPoints * weight * (0.85 + Math.random() * 0.3));
    allocatedPoints += basePts;
    return { player: p, pts: basePts };
  });

  const diff = totalPoints - allocatedPoints;
  if (rawStats.length > 0) {
    rawStats[0].pts += diff;
  }

  return rawStats.map(({ player, pts }) => {
    const isBig = player.p === 'C' || player.p === 'PF';
    const isGuard = player.p === 'PG' || player.p === 'SG';

    const reb = isBig ? Math.floor(Math.random() * 8) + 6 : Math.floor(Math.random() * 5) + 1;
    const ast = isGuard ? Math.floor(Math.random() * 8) + 5 : Math.floor(Math.random() * 4) + 1;
    const stl = Math.floor(Math.random() * 3);
    const blk = isBig ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2);

    return {
      name: player.n,
      pos: player.p,
      pts: Math.max(0, pts),
      reb,
      ast,
      stl,
      blk,
    };
  });
}

export function simulateFullSeries(
  myTeam: Record<Position, HoopickPlayer | null>,
  oppTeam: HoopickTeam,
  roundName: string
): PlayoffSeriesResult {
  let myWins = 0;
  let oppWins = 0;
  const games: PlayoffGameResult[] = [];

  let gameNum = 1;
  while (myWins < 4 && oppWins < 4) {
    const gameRes = simulateSingleGame(myTeam, oppTeam, gameNum);
    games.push(gameRes);

    if (gameRes.winner === 'user') myWins++;
    else oppWins++;

    gameNum++;
  }

  return {
    roundName,
    oppTeam,
    myWins,
    oppWins,
    winner: myWins === 4 ? 'user' : 'opp',
    games,
  };
}
