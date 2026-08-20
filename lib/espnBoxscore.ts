import prisma from '@/lib/prisma';
import { resolveAndSettleProp } from '@/lib/propSettlement';
import { logSystemEvent } from '@/lib/logger';

const ESPN_SUMMARY_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary';

export async function fetchAndAutoResolvePropsForMatchup(matchupId: number) {
  try {
    const matchup = await prisma.regularMatchup.findUnique({
      where: { id: matchupId },
      include: {
        props: {
          where: { isResolved: false, playerName: { not: null } },
        },
      },
    });

    if (!matchup || !matchup.espnId || matchup.props.length === 0) {
      return { success: true, resolvedCount: 0 };
    }

    const res = await fetch(`${ESPN_SUMMARY_URL}?event=${matchup.espnId}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`ESPN Summary API returned status ${res.status}`);
    }

    const data = await res.json();
    const playersTable = data.boxscore?.players || [];

    // Map player stats from ESPN boxscore JSON
    const playerStatsMap: { [nameLower: string]: { [stat: string]: number } } = {};

    for (const teamBox of playersTable) {
      const statsCategories = teamBox.statistics?.[0]?.names || [];
      const athletes = teamBox.statistics?.[0]?.athletes || [];

      for (const item of athletes) {
        const name = item.athlete?.displayName || item.athlete?.fullName || '';
        if (!name) continue;

        const nameLower = name.toLowerCase().trim();
        const statsArr = item.stats || [];

        const statsObj: { [stat: string]: number } = {};
        statsCategories.forEach((catName: string, idx: number) => {
          const valStr = statsArr[idx] || '0';
          if (catName === '3PT') {
            // e.g. "8-12" -> 8 3PM
            const [made] = valStr.split('-').map(Number);
            statsObj['3PM'] = made || 0;
          } else {
            statsObj[catName.toUpperCase()] = parseFloat(valStr) || 0;
          }
        });

        // Common aliases
        statsObj['PTS'] = statsObj['PTS'] || 0;
        statsObj['REB'] = statsObj['REB'] || 0;
        statsObj['AST'] = statsObj['AST'] || 0;
        statsObj['BLK'] = statsObj['BLK'] || 0;
        statsObj['STL'] = statsObj['STL'] || 0;
        statsObj['MIN'] = statsObj['MIN'] || 0;

        playerStatsMap[nameLower] = statsObj;
      }
    }

    let resolvedCount = 0;

    for (const prop of matchup.props) {
      if (!prop.playerName || !prop.statType || prop.threshold === null) continue;

      const pNameLower = prop.playerName.toLowerCase().trim();
      const statTypeUpper = prop.statType.toUpperCase().trim();

      // Search player in stats map
      const foundNameKey = Object.keys(playerStatsMap).find((k) => k.includes(pNameLower) || pNameLower.includes(k));
      if (!foundNameKey) continue;

      const statsObj = playerStatsMap[foundNameKey];
      const actualVal = statsObj[statTypeUpper] !== undefined ? statsObj[statTypeUpper] : 0;

      const outcome: 'YES' | 'NO' = actualVal >= prop.threshold ? 'YES' : 'NO';

      await resolveAndSettleProp(prop.id, outcome, actualVal);
      resolvedCount++;
    }

    if (resolvedCount > 0) {
      await logSystemEvent('AUTO_RESOLVE_PROPS', `Tự động cào Boxscore ESPN và chốt ${resolvedCount} câu hỏi Prop cho trận #${matchupId}.`, 'INFO');
    }

    return { success: true, resolvedCount };
  } catch (err: any) {
    console.error(`Auto resolve props error for matchup #${matchupId}:`, err);
    return { success: false, error: err.message };
  }
}
