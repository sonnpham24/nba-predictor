import { HOOPICK_TEAMS, rarityFromOvr, teamOverallRating } from '../lib/hoopickData';
import { drawPackFromConference, generatePlayoffOpponents, simulateSingleGame } from '../lib/hoopickEngine';

function runHoopickTests() {
  console.log('Running Hoopick Draft Game Tests...');

  // 1. Verify Team Dataset
  console.log(`Checking HOOPICK_TEAMS dataset... Total teams: ${HOOPICK_TEAMS.length}`);
  if (HOOPICK_TEAMS.length < 40) {
    throw new Error(`Expected at least 40 teams, found ${HOOPICK_TEAMS.length}`);
  }

  for (const team of HOOPICK_TEAMS) {
    if (!team.franchise || !team.year || !team.conference || !team.tier) {
      throw new Error(`Invalid team metadata: ${JSON.stringify(team)}`);
    }
    const positions = ['PG', 'SG', 'SF', 'PF', 'C'] as const;
    for (const pos of positions) {
      const p = team.roster[pos];
      if (!p || !p.n || typeof p.o !== 'number' || p.o < 50 || p.o > 99) {
        throw new Error(`Invalid player data for ${team.franchise} (${team.year}) at ${pos}`);
      }
    }
  }
  console.log('✅ PASS: HOOPICK_TEAMS dataset validation passed!');

  // 2. Rarity Mapping
  if (rarityFromOvr(98) !== 'icon') throw new Error('OVR 98 should be icon');
  if (rarityFromOvr(91) !== 'elite') throw new Error('OVR 91 should be elite');
  if (rarityFromOvr(84) !== 'gold') throw new Error('OVR 84 should be gold');
  if (rarityFromOvr(74) !== 'silver') throw new Error('OVR 74 should be silver');
  if (rarityFromOvr(65) !== 'bronze') throw new Error('OVR 65 should be bronze');
  console.log('✅ PASS: Rarity calculation verified!');

  // 3. Pack Drawing
  const westPack = drawPackFromConference('West');
  const eastPack = drawPackFromConference('East');
  if (westPack.length !== 5 || eastPack.length !== 5) {
    throw new Error('Pack draw must return exactly 5 player cards');
  }
  console.log('✅ PASS: Pack drawing algorithm verified!');

  // 4. Playoff Simulation
  const opps = generatePlayoffOpponents('West');
  if (!opps.round1 || !opps.round2 || !opps.confFinals || !opps.nbaFinals) {
    throw new Error('Playoff opponents generation failed');
  }

  const sampleTeam = {
    PG: { n: 'Stephen Curry', o: 97, p: 'PG' as const },
    SG: { n: 'Klay Thompson', o: 87, p: 'SG' as const },
    SF: { n: 'Kevin Durant', o: 96, p: 'SF' as const },
    PF: { n: 'Draymond Green', o: 84, p: 'PF' as const },
    C: { n: 'Shaquille O\'Neal', o: 96, p: 'C' as const },
  };

  const gameRes = simulateSingleGame(sampleTeam, opps.round1, 1);
  if (!gameRes.myScore || !gameRes.oppScore || gameRes.myBoxScore.length !== 5) {
    throw new Error('Playoff game simulation returned invalid result');
  }
  console.log(`✅ PASS: Game simulation verified! Result: ${gameRes.myScore} - ${gameRes.oppScore}`);

  console.log('🎉 ALL HOOPICK DRAFT GAME TESTS PASSED SUCCESSFULLY!');
}

runHoopickTests();
