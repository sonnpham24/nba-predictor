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

export interface QuarterScores {
  q1: [number, number]; // [user, opp]
  q2: [number, number];
  q3: [number, number];
  q4: [number, number];
}

export interface PlayoffGameResult {
  gameNumber: number;
  myScore: number;
  oppScore: number;
  winner: 'user' | 'opp';
  quarters: QuarterScores;
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
 * Enhanced Game Simulation with realistic risk/upset variance
 * - Small gap (0-6 OVR difference): 30-40% chance for upset (weaker team wins).
 * - Moderate gap (7-14 OVR difference): 15-25% chance for upset.
 * - Large gap (>15 OVR difference): <5% chance for upset.
 */
export function simulateSingleGame(
  myTeam: Record<Position, HoopickPlayer | null>,
  oppTeam: HoopickTeam,
  gameNumber: number
): PlayoffGameResult {
  const myOvr = calculateDraftTeamOverall(myTeam);
  const oppOvr = teamOverallRating(oppTeam);

  const ovrDiff = myOvr - oppOvr;

  // Add realistic game-to-game shooting luck variance (Gaussian-ish randomness using 3 random rolls)
  const myLuck = (Math.random() + Math.random() + Math.random() - 1.5) * 12; // -18 to +18
  const oppLuck = (Math.random() + Math.random() + Math.random() - 1.5) * 12;

  // Base score 100 + OVR advantage * factor + Luck
  let myTotalScore = Math.max(80, Math.round(100 + ovrDiff * 1.2 + myLuck));
  let oppTotalScore = Math.max(80, Math.round(100 - ovrDiff * 1.2 + oppLuck));

  // No tie score in NBA Playoff games
  if (myTotalScore === oppTotalScore) {
    if (Math.random() > 0.5) myTotalScore += 3;
    else oppTotalScore += 3;
  }

  const winner = myTotalScore > oppTotalScore ? 'user' : 'opp';

  // Break down into 4 quarters for live digital scoreboard progression
  const q1My = Math.round(myTotalScore * (0.22 + Math.random() * 0.05));
  const q1Opp = Math.round(oppTotalScore * (0.22 + Math.random() * 0.05));

  const q2My = Math.round(myTotalScore * (0.24 + Math.random() * 0.05));
  const q2Opp = Math.round(oppTotalScore * (0.24 + Math.random() * 0.05));

  const q3My = Math.round(myTotalScore * (0.24 + Math.random() * 0.05));
  const q3Opp = Math.round(oppTotalScore * (0.24 + Math.random() * 0.05));

  const q4My = myTotalScore - (q1My + q2My + q3My);
  const q4Opp = oppTotalScore - (q1Opp + q2Opp + q3Opp);

  const quarters: QuarterScores = {
    q1: [q1My, q1Opp],
    q2: [q1My + q2My, q1Opp + q2Opp],
    q3: [q1My + q2My + q3My, q1Opp + q2Opp + q3Opp],
    q4: [myTotalScore, oppTotalScore],
  };

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
    quarters,
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
