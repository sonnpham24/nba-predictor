import prisma from '@/lib/prisma';
import { calculateLockTime, calculateOpenTime } from '@/lib/dateUtils';
import { logSystemEvent } from '@/lib/logger';
import { fetchAndAutoResolvePropsForMatchup } from '@/lib/espnBoxscore';

const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

// Official ESPN IDs for Eastern Conference teams
const EASTERN_TEAM_IDS = new Set([1, 2, 4, 5, 8, 11, 14, 15, 17, 18, 19, 20, 27, 28, 30]);

const EASTERN_ABBREVS = new Set([
  'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DET', 'IND', 'MIA', 'MIL', 'NY', 'NYK', 'ORL', 'PHI', 'TOR', 'WSH', 'WAS'
]);

export function getNormalizedConference(teamId: number, abbrev: string): 'Eastern Conference' | 'Western Conference' {
  if (EASTERN_TEAM_IDS.has(teamId) || EASTERN_ABBREVS.has(abbrev.toUpperCase())) {
    return 'Eastern Conference';
  }
  return 'Western Conference';
}

export async function fetchNbaTeams() {
  try {
    const res = await fetch(`${ESPN_BASE_URL}/teams`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`ESPN API returned status ${res.status}`);

    const data = await res.json();
    const teamsList = data.sports?.[0]?.leagues?.[0]?.teams || [];

    let count = 0;
    for (const item of teamsList) {
      const t = item.team;
      const teamId = parseInt(t.id);
      const name = t.displayName || t.name;
      const abbreviation = t.abbreviation || t.shortDisplayName || name.substring(0, 3).toUpperCase();
      const logo = t.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/nba/500/${abbreviation.toLowerCase()}.png`;
      const color = t.color ? `#${t.color}` : '#000000';
      const conference = getNormalizedConference(teamId, abbreviation);

      const existing = await prisma.team.findUnique({ where: { id: teamId } });

      await prisma.team.upsert({
        where: { id: teamId },
        update: {
          name,
          abbreviation,
          logo,
          color,
          conference,
        },
        create: {
          id: teamId,
          name,
          abbreviation,
          logo,
          color,
          conference,
          isApproved: existing?.isApproved ?? false,
          scrapedData: existing?.scrapedData ?? null,
        },
      });

      count++;
    }

    await logSystemEvent('FETCH_TEAMS', `Cào thành công 30 đội bóng với Conference chuẩn từ ESPN API.`, 'INFO');
    return { success: true, count };
  } catch (err: any) {
    await logSystemEvent('FETCH_TEAMS_ERROR', `Lỗi khi cào 30 đội bóng: ${err.message}`, 'ERROR');
    return { success: false, error: err.message };
  }
}

export async function scrapeTeamRoster(teamId: number) {
  try {
    const res = await fetch(`${ESPN_BASE_URL}/teams/${teamId}/roster`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`ESPN Roster API returned status ${res.status}`);

    const data = await res.json();
    const rawAthletes = data.athletes || [];

    const positionStarters = new Set<string>();

    const athletes = rawAthletes.map((a: any, idx: number) => {
      const pos = a.position?.abbreviation || 'N/A';
      let isStarter = a.starter === true;

      if (!isStarter && !positionStarters.has(pos) && positionStarters.size < 5 && ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F'].includes(pos)) {
        positionStarters.add(pos);
        isStarter = true;
      } else if (idx < 5 && positionStarters.size < 5) {
        isStarter = true;
      }

      return {
        id: a.id,
        fullName: a.fullName,
        displayName: a.displayName,
        jersey: a.jersey || 'N/A',
        position: pos,
        height: a.displayHeight || 'N/A',
        weight: a.displayWeight || 'N/A',
        headshot: a.headshot?.href || null,
        starter: isStarter,
      };
    });

    const rosterData = {
      scrapedAt: new Date().toISOString(),
      athleteCount: athletes.length,
      athletes,
      coach: data.coach?.[0]?.firstName ? `${data.coach[0].firstName} ${data.coach[0].lastName}` : 'N/A',
    };

    const pendingDataJson = JSON.stringify(rosterData);

    await prisma.team.update({
      where: { id: teamId },
      data: {
        pendingData: pendingDataJson,
        isApproved: false,
      },
    });

    await logSystemEvent('SCRAPE_ROSTER', `Cào Roster cho đội bóng ID ${teamId} thành công (${athletes.length} cầu thủ). Đang chờ Admin duyệt.`, 'INFO');
    return { success: true, teamId, athleteCount: athletes.length, rosterData };
  } catch (err: any) {
    await logSystemEvent('SCRAPE_ROSTER_ERROR', `Lỗi khi cào Roster đội ID ${teamId}: ${err.message}`, 'ERROR');
    return { success: false, error: err.message };
  }
}

export async function approveTeamData(teamId: number) {
  try {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || !team.pendingData) {
      return { success: false, error: 'Không tìm thấy dữ liệu chờ duyệt (pendingData) cho đội này' };
    }

    await prisma.team.update({
      where: { id: teamId },
      data: {
        scrapedData: team.pendingData,
        pendingData: null,
        isApproved: true,
      },
    });

    await logSystemEvent('APPROVE_TEAM_DATA', `Admin đã duyệt dữ liệu Roster mới cho đội ${team.name} (ID ${teamId}).`, 'INFO');
    return { success: true, teamId };
  } catch (err: any) {
    await logSystemEvent('APPROVE_TEAM_DATA_ERROR', `Lỗi khi duyệt dữ liệu đội ID ${teamId}: ${err.message}`, 'ERROR');
    return { success: false, error: err.message };
  }
}

export async function fetchUpcomingSchedule(daysAhead = 7) {
  try {
    const teamCount = await prisma.team.count();
    if (teamCount === 0) {
      await fetchNbaTeams();
    }

    let totalSaved = 0;
    const now = new Date();

    for (let dayOffset = 0; dayOffset <= daysAhead; dayOffset++) {
      const targetDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const dateStr = targetDate.toISOString().slice(0, 10).replace(/-/g, '');

      const res = await fetch(`${ESPN_BASE_URL}/scoreboard?dates=${dateStr}`, { cache: 'no-store' });
      if (!res.ok) continue;

      const data = await res.json();
      const events = data.events || [];

      for (const ev of events) {
        const espnId = ev.id;
        const competition = ev.competitions?.[0];
        if (!competition) continue;

        const competitors = competition.competitors || [];
        const homeComp = competitors.find((c: any) => c.homeAway === 'home');
        const awayComp = competitors.find((c: any) => c.homeAway === 'away');

        if (!homeComp || !awayComp) continue;

        const teamAId = parseInt(homeComp.team.id);
        const teamBId = parseInt(awayComp.team.id);

        const abbrevA = homeComp.team.abbreviation || 'TMA';
        const abbrevB = awayComp.team.abbreviation || 'TMB';

        await prisma.team.upsert({
          where: { id: teamAId },
          update: {
            conference: getNormalizedConference(teamAId, abbrevA),
          },
          create: {
            id: teamAId,
            name: homeComp.team.displayName || homeComp.team.name,
            abbreviation: abbrevA,
            logo: homeComp.team.logo || `https://a.espncdn.com/i/teamlogos/nba/500/${abbrevA.toLowerCase()}.png`,
            conference: getNormalizedConference(teamAId, abbrevA),
          },
        });

        await prisma.team.upsert({
          where: { id: teamBId },
          update: {
            conference: getNormalizedConference(teamBId, abbrevB),
          },
          create: {
            id: teamBId,
            name: awayComp.team.displayName || awayComp.team.name,
            abbreviation: abbrevB,
            logo: awayComp.team.logo || `https://a.espncdn.com/i/teamlogos/nba/500/${abbrevB.toLowerCase()}.png`,
            conference: getNormalizedConference(teamBId, abbrevB),
          },
        });

        const startTime = new Date(competition.date || ev.date);
        const lockTime = calculateLockTime(startTime); // Lock time is exact tip-off
        const openTime = calculateOpenTime(startTime);

        const statusState = competition.status?.type?.state;
        let status = 'SCHEDULED';
        if (statusState === 'in') status = 'IN_PROGRESS';
        else if (statusState === 'post') status = 'FINISHED';

        const scoreA = homeComp.score ? parseInt(homeComp.score) : null;
        const scoreB = homeComp.score ? parseInt(awayComp.score) : null;
        const clock = competition.status?.displayClock || null;
        const period = competition.status?.period || null;

        let actualWinnerId: number | null = null;
        let actualScore: string | null = null;

        if (status === 'FINISHED' && scoreA !== null && scoreB !== null) {
          actualScore = `${scoreA} - ${scoreB}`;
          actualWinnerId = scoreA > scoreB ? teamAId : teamBId;
        }

        await prisma.regularMatchup.upsert({
          where: { espnId },
          update: {
            startTime,
            lockTime,
            openTime,
            status,
            clock,
            period,
            scoreA,
            scoreB,
            actualWinnerId: actualWinnerId ?? undefined,
            actualScore: actualScore ?? undefined,
          },
          create: {
            espnId,
            teamAId,
            teamBId,
            startTime,
            lockTime,
            openTime,
            status,
            clock,
            period,
            scoreA,
            scoreB,
            actualWinnerId,
            actualScore,
          },
        });

        totalSaved++;
      }
    }

    await logSystemEvent('FETCH_SCHEDULE', `Đã cào và đồng bộ ${totalSaved} trận đấu Regular Season trong vòng ${daysAhead} ngày tới.`, 'INFO');
    return { success: true, count: totalSaved };
  } catch (err: any) {
    await logSystemEvent('FETCH_SCHEDULE_ERROR', `Lỗi khi cào lịch thi đấu: ${err.message}`, 'ERROR');
    return { success: false, error: err.message };
  }
}

export async function fetchLiveScoreboardAndSettle() {
  try {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const res = await fetch(`${ESPN_BASE_URL}/scoreboard?dates=${todayStr}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Scoreboard API returned status ${res.status}`);

    const data = await res.json();
    const events = data.events || [];

    let updatedCount = 0;
    let settledCount = 0;

    for (const ev of events) {
      const espnId = ev.id;
      const competition = ev.competitions?.[0];
      if (!competition) continue;

      const competitors = competition.competitors || [];
      const homeComp = competitors.find((c: any) => c.homeAway === 'home');
      const awayComp = competitors.find((c: any) => c.homeAway === 'away');

      if (!homeComp || !awayComp) continue;

      const teamAId = parseInt(homeComp.team.id);
      const teamBId = parseInt(awayComp.team.id);

      const statusState = competition.status?.type?.state;
      let status = 'SCHEDULED';
      if (statusState === 'in') status = 'IN_PROGRESS';
      else if (statusState === 'post') status = 'FINISHED';

      const scoreA = homeComp.score !== undefined ? parseInt(homeComp.score) : null;
      const scoreB = awayComp.score !== undefined ? parseInt(awayComp.score) : null;
      const clock = competition.status?.displayClock || null;
      const period = competition.status?.period || null;

      let actualWinnerId: number | null = null;
      let actualScore: string | null = null;

      if (status === 'FINISHED' && scoreA !== null && scoreB !== null) {
        actualScore = `${scoreA} - ${scoreB}`;
        actualWinnerId = scoreA > scoreB ? teamAId : teamBId;
      }

      const existingMatchup = await prisma.regularMatchup.findUnique({ where: { espnId } });

      if (existingMatchup) {
        const isSettlingNow = status === 'FINISHED' && actualWinnerId !== null && !existingMatchup.isSettled;

        await prisma.regularMatchup.update({
          where: { espnId },
          data: {
            status,
            clock,
            period,
            scoreA,
            scoreB,
            actualWinnerId: actualWinnerId ?? existingMatchup.actualWinnerId,
            actualScore: actualScore ?? existingMatchup.actualScore,
            isSettled: isSettlingNow ? true : existingMatchup.isSettled,
          },
        });

        updatedCount++;

        if (isSettlingNow) {
          settledCount++;
          await logSystemEvent(
            'AUTO_SETTLE_MATCH',
            `Tự động hoàn tất & chốt kết quả trận đấu ID ${existingMatchup.id} (Tỉ số: ${actualScore}, Đội thắng ID: ${actualWinnerId}).`,
            'INFO'
          );

          // Tự động cào Boxscore chỉ số cầu thủ và chốt kết quả Prop Bets
          await fetchAndAutoResolvePropsForMatchup(existingMatchup.id);
        }
      }
    }

    return { success: true, updatedCount, settledCount };
  } catch (err: any) {
    await logSystemEvent('LIVE_SYNC_ERROR', `Lỗi khi cào tỉ số Live và tự động cộng điểm: ${err.message}`, 'ERROR');
    return { success: false, error: err.message };
  }
}
