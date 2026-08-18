import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = 'test-secret-key-123456';
process.env.JWT_SECRET = JWT_SECRET;

async function runAuthTests() {
  console.log('Running Auth Tests (Baseline + Jose readiness)...');

  // Test 1: Standard jsonwebtoken sign & verify
  const payload = { id: 1, username: 'testuser', isAdmin: true };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  const decoded = jwt.verify(token, JWT_SECRET) as typeof payload;
  assert.strictEqual(decoded.id, 1);
  assert.strictEqual(decoded.username, 'testuser');
  assert.strictEqual(decoded.isAdmin, true);

  // Test 2: Verify jose compatibility with secret
  const secretKey = new TextEncoder().encode(JWT_SECRET);
  const joseToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secretKey);

  const verified = await jwtVerify(joseToken, secretKey);
  assert.strictEqual(verified.payload.id, 1);
  assert.strictEqual(verified.payload.username, 'testuser');
  assert.strictEqual(verified.payload.isAdmin, true);

  console.log('✅ All Auth Tests Passed!');
}

runAuthTests().catch((err) => {
  console.error('❌ Auth Test Failed:', err);
  process.exit(1);
});
