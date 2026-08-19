import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://site.api.espn.com/apis/v2/sports/basketball/nba/standings', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 }, // Cache 5 minutes
    });

    if (!res.ok) {
      throw new Error('ESPN Standings API returned non-OK status');
    }

    const data = await res.json();
    const children = data.children || [];

    const eastGroup = children.find((c: any) => c.name?.toLowerCase().includes('eastern')) || children[0];
    const westGroup = children.find((c: any) => c.name?.toLowerCase().includes('western')) || children[1];

    const parseConferenceStandings = (group: any) => {
      if (!group || !group.standings || !group.standings.entries) return [];
      return group.standings.entries.map((entry: any, index: number) => {
        const team = entry.team || {};
        const stats = entry.stats || [];

        const getStatVal = (nameStr: string) => {
          const s = stats.find((st: any) => st.name?.toLowerCase() === nameStr.toLowerCase() || st.type?.toLowerCase() === nameStr.toLowerCase());
          return s?.displayValue || s?.value || '0';
        };

        return {
          rank: index + 1,
          id: team.id,
          name: team.displayName || team.name,
          abbreviation: team.abbrev || team.abbreviation,
          logo: team.logos?.[0]?.href || '/logos/unknown.png',
          wins: getStatVal('wins'),
          losses: getStatVal('losses'),
          pct: getStatVal('winPercent'),
          gb: getStatVal('gamesBehind'),
          home: getStatVal('Home'),
          away: getStatVal('Road'),
          streak: getStatVal('streak'),
        };
      });
    };

    const eastStandings = parseConferenceStandings(eastGroup);
    const westStandings = parseConferenceStandings(westGroup);

    return NextResponse.json({
      season: '2026-27',
      east: eastStandings,
      west: westStandings,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching standings' }, { status: 500 });
  }
}
