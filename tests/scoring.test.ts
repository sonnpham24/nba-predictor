import assert from 'node:assert';

function calculatePredictionScore(
  predictedWinner: string,
  predictedScore: string,
  actualWinner: string,
  actualScore: string
): number {
  if (predictedWinner !== actualWinner) {
    return 0;
  }

  const [predA, predB] = predictedScore.split('-').map(Number);
  const [actA, actB] = actualScore.split('-').map(Number);

  const predictedTotalGames = predA + predB;
  const actualTotalGames = actA + actB;

  if (predA === actA && predB === actB) {
    return 3; // Đúng hoàn toàn
  } else if (Math.abs(predictedTotalGames - actualTotalGames) === 1) {
    return 2; // Lệch đúng 1 game
  } else {
    return 1; // Đúng đội, lệch > 1 game
  }
}

function runScoringTests() {
  console.log('Running Scoring Tests...');

  // Test 1: Exact match -> 3 points
  assert.strictEqual(calculatePredictionScore('LAL', '4-2', 'LAL', '4-2'), 3);

  // Test 2: Correct winner, total games diff = 1 (e.g. predicted 4-2=6 games vs actual 4-3=7 games) -> 2 points
  assert.strictEqual(calculatePredictionScore('LAL', '4-2', 'LAL', '4-3'), 2);

  // Test 3: Correct winner, total games diff > 1 (e.g. predicted 4-0=4 games vs actual 4-3=7 games) -> 1 point
  assert.strictEqual(calculatePredictionScore('LAL', '4-0', 'LAL', '4-3'), 1);

  // Test 4: Wrong winner -> 0 points
  assert.strictEqual(calculatePredictionScore('BOS', '4-2', 'LAL', '4-2'), 0);

  console.log('✅ All Scoring Tests Passed!');
}

runScoringTests();
