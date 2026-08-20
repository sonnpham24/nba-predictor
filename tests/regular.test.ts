import assert from 'node:assert';
import { calculateLockTime, calculateOpenTime, isPredictionOpen } from '../lib/dateUtils';
import { calculateRegularVoteSplit, getRegularDisplayStatus } from '../lib/regularMatchupUtils';

function runRegularSeasonTests() {
  console.log('Running Regular Season & Scraper Tests...');

  // Test 1: Calculate lockTime (exact tip-off start time) and openTime (-7 days)
  const matchTime = new Date('2026-08-20T20:00:00.000Z');
  const lockTime = calculateLockTime(matchTime);
  const openTime = calculateOpenTime(matchTime);

  const expectedLock = new Date('2026-08-20T20:00:00.000Z').getTime();
  const expectedOpen = new Date('2026-08-13T20:00:00.000Z').getTime();

  assert.strictEqual(lockTime.getTime(), expectedLock);
  assert.strictEqual(openTime.getTime(), expectedOpen);

  // Test 2: Prediction window checks
  const validPredictionNow = new Date('2026-08-20T19:00:00.000Z'); // 1 hour before start
  assert.strictEqual(isPredictionOpen(matchTime, validPredictionNow), true);

  const lockedPredictionNow = new Date('2026-08-20T20:05:00.000Z'); // 5 mins after start (locked)
  assert.strictEqual(isPredictionOpen(matchTime, lockedPredictionNow), false);

  const tooEarlyPredictionNow = new Date('2026-08-12T20:00:00.000Z'); // 8 days before start
  assert.strictEqual(isPredictionOpen(matchTime, tooEarlyPredictionNow), false);

  // Test 3: Scoring logic (+1 point for correct winning team prediction)
  function calculateRegularScore(predictedWinnerId: number, actualWinnerId: number): number {
    return predictedWinnerId === actualWinnerId ? 1 : 0;
  }

  assert.strictEqual(calculateRegularScore(10, 10), 1);
  assert.strictEqual(calculateRegularScore(10, 12), 0);

  // Test 4: Team B vote split should show 100% on Team B, not Team A
  const split = calculateRegularVoteSplit(
    [{ predictedWinnerId: 2, customPredictedWinner: null }],
    {
      teamAId: 1,
      teamBId: 2,
      teamA: { id: 1, name: 'Team A' },
      teamB: { id: 2, name: 'Team B' },
      startTime: matchTime,
      lockTime,
    }
  );

  assert.strictEqual(split.votesTeamA, 0);
  assert.strictEqual(split.votesTeamB, 1);
  assert.strictEqual(split.percentTeamA, 0);
  assert.strictEqual(split.percentTeamB, 100);

  // Test 5: Scheduled DB status should display as locked once lock time has passed
  assert.strictEqual(
    getRegularDisplayStatus(
      {
        status: 'SCHEDULED',
        startTime: matchTime,
        lockTime,
      },
      lockedPredictionNow
    ),
    'LOCKED'
  );

  console.log('✅ All Regular Season Tests Passed!');
}

runRegularSeasonTests();
