export type RegularDisplayStatus = 'SCHEDULED' | 'LOCKED' | 'IN_PROGRESS' | 'FINISHED';

type TeamLike = {
  id?: number | null;
  name?: string | null;
};

type MatchupLike = {
  teamAId?: number | null;
  teamBId?: number | null;
  teamA?: TeamLike | null;
  teamB?: TeamLike | null;
  customTeamA?: string | null;
  customTeamB?: string | null;
  status?: string | null;
  startTime: Date | string;
  lockTime: Date | string;
  openTime?: Date | string | null;
  isSettled?: boolean | null;
};

type PredictionLike = {
  predictedWinnerId?: number | null;
  customPredictedWinner?: string | null;
};

function normalizeName(value?: string | null) {
  return (value || '').trim().toLowerCase();
}

export function getRegularDisplayStatus(matchup: MatchupLike, now = new Date()): RegularDisplayStatus {
  if (matchup.status === 'FINISHED' || matchup.isSettled) return 'FINISHED';
  if (matchup.status === 'IN_PROGRESS') return 'IN_PROGRESS';

  const lockTime = new Date(matchup.lockTime);
  const startTime = new Date(matchup.startTime);
  const effectiveLock = Number.isNaN(lockTime.getTime()) ? startTime : lockTime;

  if (now >= effectiveLock || now >= startTime) return 'LOCKED';
  return 'SCHEDULED';
}

export function isRegularPredictionWindowOpen(matchup: MatchupLike, now = new Date()) {
  if (getRegularDisplayStatus(matchup, now) !== 'SCHEDULED') return false;

  const openTime = matchup.openTime ? new Date(matchup.openTime) : null;
  const lockTime = new Date(matchup.lockTime);

  const afterOpen = !openTime || Number.isNaN(openTime.getTime()) || now >= openTime;
  const beforeLock = !Number.isNaN(lockTime.getTime()) && now < lockTime;

  return afterOpen && beforeLock;
}

export function getRegularPredictionSide(prediction: PredictionLike, matchup: MatchupLike): 'A' | 'B' | null {
  if (prediction.predictedWinnerId !== null && prediction.predictedWinnerId !== undefined) {
    if (prediction.predictedWinnerId === matchup.teamAId || prediction.predictedWinnerId === matchup.teamA?.id) {
      return 'A';
    }
    if (prediction.predictedWinnerId === matchup.teamBId || prediction.predictedWinnerId === matchup.teamB?.id) {
      return 'B';
    }
  }

  const pickName = normalizeName(prediction.customPredictedWinner);
  if (!pickName) return null;

  const teamAName = normalizeName(matchup.customTeamA || matchup.teamA?.name);
  const teamBName = normalizeName(matchup.customTeamB || matchup.teamB?.name);

  if (pickName === teamAName) return 'A';
  if (pickName === teamBName) return 'B';

  return null;
}

export function calculateRegularVoteSplit(predictions: PredictionLike[], matchup: MatchupLike) {
  let votesTeamA = 0;
  let votesTeamB = 0;

  for (const prediction of predictions) {
    const side = getRegularPredictionSide(prediction, matchup);
    if (side === 'A') votesTeamA += 1;
    if (side === 'B') votesTeamB += 1;
  }

  const totalPredictions = votesTeamA + votesTeamB;
  const percentTeamA = totalPredictions > 0 ? Math.round((votesTeamA / totalPredictions) * 100) : 50;
  const percentTeamB = totalPredictions > 0 ? 100 - percentTeamA : 50;

  return {
    totalPredictions,
    votesTeamA,
    votesTeamB,
    percentTeamA,
    percentTeamB,
  };
}
