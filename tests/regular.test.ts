import assert from 'node:assert';
import { calculateLockTime, calculateOpenTime, isPredictionOpen } from '../lib/dateUtils';

function runRegularSeasonTests() {
  console.log('Running Regular Season & Scraper Tests...');

  // Test 1: Calculate lockTime (-30 mins) and openTime (-7 days)
  const matchTime = new Date('2026-08-20T20:00:00.000Z');
  const lockTime = calculateLockTime(matchTime);
  const openTime = calculateOpenTime(matchTime);

  const expectedLock = new Date('2026-08-20T19:30:00.000Z').getTime();
  const expectedOpen = new Date('2026-08-13T20:00:00.000Z').getTime();

  assert.strictEqual(lockTime.getTime(), expectedLock);
  assert.strictEqual(openTime.getTime(), expectedOpen);

  // Test 2: Prediction window checks
  const validPredictionNow = new Date('2026-08-20T19:00:00.000Z'); // 1 hour before start
  assert.strictEqual(isPredictionOpen(matchTime, validPredictionNow), true);

  const lockedPredictionNow = new Date('2026-08-20T19:35:00.000Z'); // 25 mins before start (locked)
  assert.strictEqual(isPredictionOpen(matchTime, lockedPredictionNow), false);

  const tooEarlyPredictionNow = new Date('2026-08-12T20:00:00.000Z'); // 8 days before start
  assert.strictEqual(isPredictionOpen(matchTime, tooEarlyPredictionNow), false);

  // Test 3: Scoring logic (+1 point for correct winning team prediction)
  function calculateRegularScore(predictedWinnerId: number, actualWinnerId: number): number {
    return predictedWinnerId === actualWinnerId ? 1 : 0;
  }

  assert.strictEqual(calculateRegularScore(10, 10), 1);
  assert.strictEqual(calculateRegularScore(10, 12), 0);

  console.log('✅ All Regular Season Tests Passed!');
}

runRegularSeasonTests();
