import assert from 'node:assert';
import {
  loginSchema,
  registerSchema,
  predictionSchema,
  lockTimeSchema,
  resultSchema,
} from '../lib/validations';

function runValidationTests() {
  console.log('Running Zod Validation Tests...');

  // Test 1: Login schema
  const validLogin = loginSchema.safeParse({ username: 'admin', password: 'password123' });
  assert.strictEqual(validLogin.success, true);

  const invalidLogin = loginSchema.safeParse({ username: '', password: '' });
  assert.strictEqual(invalidLogin.success, false);

  // Test 2: Register schema
  const validReg = registerSchema.safeParse({ username: 'john', password: 'password123' });
  assert.strictEqual(validReg.success, true);

  const shortPass = registerSchema.safeParse({ username: 'john', password: '123' });
  assert.strictEqual(shortPass.success, false);

  // Test 3: Prediction schema
  const validPred = predictionSchema.safeParse({
    matchupId: 1,
    teamA: 'LAL',
    teamB: 'BOS',
    predictedWinner: 'LAL',
    predictedScore: '4-2',
  });
  assert.strictEqual(validPred.success, true);

  const invalidScore = predictionSchema.safeParse({
    matchupId: 1,
    teamA: 'LAL',
    teamB: 'BOS',
    predictedWinner: 'LAL',
    predictedScore: '4/2', // invalid format
  });
  assert.strictEqual(invalidScore.success, false);

  // Test 4: LockTime schema
  const validLock = lockTimeSchema.safeParse({
    matchupId: 1,
    lockTime: '2025-05-01T20:00:00.000Z',
  });
  assert.strictEqual(validLock.success, true);

  const invalidDate = lockTimeSchema.safeParse({
    matchupId: 1,
    lockTime: 'not-a-date',
  });
  assert.strictEqual(invalidDate.success, false);

  // Test 5: Result schema
  const validRes = resultSchema.safeParse({
    matchupId: 1,
    actualWinner: 'BOS',
    actualScore: '4-3',
  });
  assert.strictEqual(validRes.success, true);

  console.log('✅ All Zod Validation Tests Passed!');
}

runValidationTests();
