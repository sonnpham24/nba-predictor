import prisma from '../lib/prisma';
import { resolveAndSettleProp } from '../lib/propSettlement';

async function runPropBetTests() {
  console.log('Running Yes/No Prop Bet & Opposite Vote Requirement Tests...');

  try {
    // 1. Setup mock user and matchup
    let userA = await prisma.user.findUnique({ where: { username: 'testprop_userA' } });
    if (!userA) {
      userA = await prisma.user.create({
        data: { username: 'testprop_userA', password: 'password123', isEmailVerified: true },
      });
    }

    let userB = await prisma.user.findUnique({ where: { username: 'testprop_userB' } });
    if (!userB) {
      userB = await prisma.user.create({
        data: { username: 'testprop_userB', password: 'password123', isEmailVerified: true },
      });
    }

    const matchup = await prisma.regularMatchup.create({
      data: {
        startTime: new Date(),
        lockTime: new Date(),
        openTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        customTeamA: 'Prop Team A',
        customTeamB: 'Prop Team B',
        isCustom: true,
      },
    });

    // 2. Test Case A: Single sided vote (Only User A votes YES, no one votes NO)
    const prop1 = await prisma.regularProp.create({
      data: {
        matchupId: matchup.id,
        creatorId: userA.id,
        question: 'Stephen Curry > 8 3PM?',
        playerName: 'Stephen Curry',
        statType: '3PM',
        threshold: 8,
      },
    });

    await prisma.propVote.create({
      data: { propId: prop1.id, userId: userA.id, vote: 'YES' },
    });

    const initAdjA = (await prisma.user.findUnique({ where: { id: userA.id } }))?.scoreAdjustment || 0;

    const res1 = await resolveAndSettleProp(prop1.id, 'YES', 9);
    console.log('Prop 1 Result (1-sided vote):', res1.message);

    const afterAdjA1 = (await prisma.user.findUnique({ where: { id: userA.id } }))?.scoreAdjustment || 0;
    if (afterAdjA1 !== initAdjA) {
      throw new Error(`FAIL: Single-sided vote awarded points! Expected ${initAdjA}, got ${afterAdjA1}`);
    }
    console.log('✅ PASS: Single-sided vote correctly awarded 0 points!');

    // 3. Test Case B: Opposite sided vote (User A votes YES, User B votes NO)
    const prop2 = await prisma.regularProp.create({
      data: {
        matchupId: matchup.id,
        creatorId: userA.id,
        question: 'Giannis > 10 Rebounds?',
        playerName: 'Giannis Antetokounmpo',
        statType: 'REB',
        threshold: 10,
      },
    });

    await prisma.propVote.create({ data: { propId: prop2.id, userId: userA.id, vote: 'YES' } });
    await prisma.propVote.create({ data: { propId: prop2.id, userId: userB.id, vote: 'NO' } });

    const res2 = await resolveAndSettleProp(prop2.id, 'YES', 12);
    console.log('Prop 2 Result (2-sided vote):', res2.message);

    const afterAdjA2 = (await prisma.user.findUnique({ where: { id: userA.id } }))?.scoreAdjustment || 0;
    if (afterAdjA2 !== initAdjA + 1) {
      throw new Error(`FAIL: Opposite-sided vote failed to award +1 point! Expected ${initAdjA + 1}, got ${afterAdjA2}`);
    }
    console.log('✅ PASS: Opposite-sided vote correctly awarded +1 point to winner!');

    // Clean up mock data
    await prisma.propVote.deleteMany({ where: { propId: { in: [prop1.id, prop2.id] } } });
    await prisma.regularProp.deleteMany({ where: { id: { in: [prop1.id, prop2.id] } } });
    await prisma.regularMatchup.delete({ where: { id: matchup.id } });

    console.log('🎉 ALL PROP BET & OPPOSITE VOTE TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Prop Bet Test Error:', err);
    process.exit(1);
  }
}

runPropBetTests();
