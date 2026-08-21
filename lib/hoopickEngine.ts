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

export interface PlayoffGameResult {
  gameNumber: number;
  myScore: number;
  oppScore: number;
  winner: 'user' | 'opp';
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

  // Pick diverse tiers for playoff rounds (Round 1 Playoff tier -> Round 2 Contender -> Conf Finals Legendary -> NBA Finals Legendary)
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

export function simulateSingleGame(
  myTeam: Record<Position, HoopickPlayer | null>,
  oppTeam: HoopickTeam,
  gameNumber: number
): PlayoffGameResult {
  const myOvr = calculateDraftTeamOverall(myTeam);
  const oppOvr = teamOverallRating(oppTeam);

  // Base score around 102
  const ovrDiff = myOvr - oppOvr;
  const myVariance = Math.floor(Math.random() * 19) - 9; // -9 to +9
  const oppVariance = Math.floor(Math.random() * 19) - 9;

  let myScore = Math.max(82, Math.round(102 + ovrDiff * 1.4 + myVariance));
  let oppScore = Math.max(82, Math.round(102 - ovrDiff * 1.4 + oppVariance));

  // Ensure no ties in basketball
  if (myScore === oppScore) {
    if (Math.random() > 0.5) myScore += 3;
    else oppScore += 3;
  }

  const winner = myScore > oppScore ? 'user' : 'opp';

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

  const myBoxScore = generateTeamBoxScore(myPlayers, myScore);
  const oppBoxScore = generateTeamBoxScore(oppPlayers, oppScore);

  return {
    gameNumber,
    myScore,
    oppScore,
    winner,
    myBoxScore,
    oppBoxScore,
  };
}

function generateTeamBoxScore(
  players: { n: string; o: number; p: Position }[],
  totalPoints: number
): PlayoffPlayerStat[] {
  const totalOvr = players.reduce((sum, p) => sum + p.o, 0);

  // Distribute points proportional to player OVR with slight randomness
  let allocatedPoints = 0;
  const rawStats = players.map((p) => {
    const weight = p.o / totalOvr;
    const basePts = Math.round(totalPoints * weight * (0.85 + Math.random() * 0.3));
    allocatedPoints += basePts;
    return { player: p, pts: basePts };
  });

  // Adjust point total exact match
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
