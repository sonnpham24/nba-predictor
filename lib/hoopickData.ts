export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export interface HoopickPlayer {
  n: string; // Name
  o: number; // Overall rating (65-99)
  p: Position; // Primary Position
  t?: string; // Team franchise
  e?: string; // Era/Year
}

export interface HoopickTeam {
  franchise: string;
  year: string;
  conference: 'East' | 'West';
  tier: 'Legendary' | 'Contender' | 'Playoff';
  roster: {
    PG: { n: string; o: number };
    SG: { n: string; o: number };
    SF: { n: string; o: number };
    PF: { n: string; o: number };
    C: { n: string; o: number };
  };
}

export interface TeamMeta {
  abbr: string;
  color: string;
  text: string;
}

export const TEAM_META: Record<string, TeamMeta> = {
  'Chicago Bulls': { abbr: 'CHI', color: '#CE1141', text: '#FFFFFF' },
  'Miami Heat': { abbr: 'MIA', color: '#98002E', text: '#FFFFFF' },
  'Cleveland Cavaliers': { abbr: 'CLE', color: '#860038', text: '#FFFFFF' },
  'L.A. Lakers': { abbr: 'LAL', color: '#552583', text: '#FDB927' },
  'Boston Celtics': { abbr: 'BOS', color: '#007A33', text: '#FFFFFF' },
  'Houston Rockets': { abbr: 'HOU', color: '#CE1141', text: '#FFFFFF' },
  'San Antonio Spurs': { abbr: 'SAS', color: '#0C2340', text: '#C4CED4' },
  'Golden State Warriors': { abbr: 'GSW', color: '#1D428A', text: '#FFC72C' },
  'Toronto Raptors': { abbr: 'TOR', color: '#CE1141', text: '#FFFFFF' },
  'Milwaukee Bucks': { abbr: 'MIL', color: '#00471B', text: '#EEE1C6' },
  'Detroit Pistons': { abbr: 'DET', color: '#C8102E', text: '#FFFFFF' },
  'Philadelphia 76ers': { abbr: 'PHI', color: '#006BB6', text: '#FFFFFF' },
  'Dallas Mavericks': { abbr: 'DAL', color: '#00538C', text: '#FFFFFF' },
  'Denver Nuggets': { abbr: 'DEN', color: '#0E2240', text: '#FEC524' },
  'Phoenix Suns': { abbr: 'PHX', color: '#E56020', text: '#FFFFFF' },
  'Atlanta Hawks': { abbr: 'ATL', color: '#E03A3E', text: '#FFFFFF' },
  'Brooklyn Nets': { abbr: 'BKN', color: '#000000', text: '#FFFFFF' },
  'Charlotte Hornets': { abbr: 'CHA', color: '#1D1160', text: '#00788C' },
  'Indiana Pacers': { abbr: 'IND', color: '#002D62', text: '#FDBB30' },
  'New York Knicks': { abbr: 'NYK', color: '#006BB6', text: '#F58426' },
  'Orlando Magic': { abbr: 'ORL', color: '#0077C0', text: '#FFFFFF' },
  'Washington Wizards': { abbr: 'WAS', color: '#002B5C', text: '#E31837' },
  'L.A. Clippers': { abbr: 'LAC', color: '#C8102E', text: '#1D428A' },
  'Memphis Grizzlies': { abbr: 'MEM', color: '#5D76A9', text: '#12173F' },
  'Minnesota Timberwolves': { abbr: 'MIN', color: '#0C2340', text: '#78BE20' },
  'New Orleans Pelicans': { abbr: 'NOP', color: '#0C2340', text: '#B4975A' },
  'Oklahoma City Thunder': { abbr: 'OKC', color: '#007AC1', text: '#EF3B24' },
  'Portland Trail Blazers': { abbr: 'POR', color: '#E03A3E', text: '#FFFFFF' },
  'Sacramento Kings': { abbr: 'SAC', color: '#5A2D81', text: '#63727A' },
  'Utah Jazz': { abbr: 'UTA', color: '#002B5C', text: '#F9A01B' },
  'Charlotte Bobcats': { abbr: 'CHA', color: '#F26522', text: '#002B5C' },
  'New Jersey Nets': { abbr: 'NJN', color: '#002B5C', text: '#C4CED4' },
};

// Versatile players who can play multiple positions
export const VERSATILE_POSITIONS: Record<string, Position[]> = {
  'LeBron James': ['SF', 'PF', 'PG'],
  'Giannis Antetokounmpo': ['PF', 'C', 'SF'],
  'Kevin Durant': ['SF', 'PF'],
  'Draymond Green': ['PF', 'C'],
  'Anthony Davis': ['PF', 'C'],
  'Kawhi Leonard': ['SF', 'PF'],
  'Pascal Siakam': ['SF', 'PF'],
  'Dirk Nowitzki': ['PF', 'C'],
  'Tim Duncan': ['PF', 'C'],
  'Kevin Garnett': ['PF', 'C'],
  'Shawn Marion': ['SF', 'PF'],
  'Amar\'e Stoudemire': ['PF', 'C'],
  'Magic Johnson': ['PG', 'SG', 'SF'],
  'Luka Doncic': ['PG', 'SG'],
  'Jayson Tatum': ['SF', 'PF'],
  'Victor Wembanyama': ['PF', 'C'],
  'Nikola Jokic': ['C', 'PF'],
  'James Harden': ['SG', 'PG'],
  'Paul Pierce': ['SF', 'SG'],
  'Ben Simmons': ['PG', 'PF'],
  'Kobe Bryant': ['SG', 'SF'],
  'Shaquille O\'Neal': ['C'],
  'Kyrie Irving': ['PG', 'SG'],
  'Jimmy Butler': ['SF', 'SG'],
  'Devin Booker': ['SG', 'PG'],
  'Paul George': ['SF', 'SG'],
};

export function eligiblePositions(playerName: string, primaryPos: Position): Position[] {
  return VERSATILE_POSITIONS[playerName] || [primaryPos];
}

export const HOOPICK_TEAMS: HoopickTeam[] = [
  // --- LEGENDARY TIER ---
  {
    franchise: 'Chicago Bulls',
    year: '1996',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Ron Harper', o: 75 },
      SG: { n: 'Michael Jordan', o: 99 },
      SF: { n: 'Scottie Pippen', o: 90 },
      PF: { n: 'Dennis Rodman', o: 82 },
      C: { n: 'Luc Longley', o: 68 },
    },
  },
  {
    franchise: 'Golden State Warriors',
    year: '2017',
    conference: 'West',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Stephen Curry', o: 97 },
      SG: { n: 'Klay Thompson', o: 87 },
      SF: { n: 'Kevin Durant', o: 96 },
      PF: { n: 'Draymond Green', o: 84 },
      C: { n: 'Zaza Pachulia', o: 65 },
    },
  },
  {
    franchise: 'Miami Heat',
    year: '2013',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Mario Chalmers', o: 72 },
      SG: { n: 'Dwyane Wade', o: 91 },
      SF: { n: 'LeBron James', o: 98 },
      PF: { n: 'Chris Bosh', o: 88 },
      C: { n: 'Chris Andersen', o: 68 },
    },
  },
  {
    franchise: 'L.A. Lakers',
    year: '2001',
    conference: 'West',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Derek Fisher', o: 72 },
      SG: { n: 'Kobe Bryant', o: 92 },
      SF: { n: 'Rick Fox', o: 70 },
      PF: { n: 'Horace Grant', o: 74 },
      C: { n: 'Shaquille O\'Neal', o: 96 },
    },
  },
  {
    franchise: 'Boston Celtics',
    year: '1986',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Dennis Johnson', o: 78 },
      SG: { n: 'Danny Ainge', o: 76 },
      SF: { n: 'Larry Bird', o: 97 },
      PF: { n: 'Kevin McHale', o: 90 },
      C: { n: 'Robert Parish', o: 86 },
    },
  },
  {
    franchise: 'Denver Nuggets',
    year: '2023',
    conference: 'West',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Jamal Murray', o: 86 },
      SG: { n: 'Kentavious Caldwell-Pope', o: 75 },
      SF: { n: 'Michael Porter Jr.', o: 78 },
      PF: { n: 'Aaron Gordon', o: 80 },
      C: { n: 'Nikola Jokic', o: 98 },
    },
  },
  {
    franchise: 'Cleveland Cavaliers',
    year: '2016',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Kyrie Irving', o: 92 },
      SG: { n: 'J.R. Smith', o: 74 },
      SF: { n: 'LeBron James', o: 96 },
      PF: { n: 'Kevin Love', o: 88 },
      C: { n: 'Tristan Thompson', o: 74 },
    },
  },
  {
    franchise: 'Houston Rockets',
    year: '1994',
    conference: 'West',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Kenny Smith', o: 74 },
      SG: { n: 'Vernon Maxwell', o: 70 },
      SF: { n: 'Robert Horry', o: 74 },
      PF: { n: 'Otis Thorpe', o: 76 },
      C: { n: 'Hakeem Olajuwon', o: 95 },
    },
  },
  {
    franchise: 'San Antonio Spurs',
    year: '1999',
    conference: 'West',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Avery Johnson', o: 74 },
      SG: { n: 'Mario Elie', o: 70 },
      SF: { n: 'Sean Elliott', o: 78 },
      PF: { n: 'Tim Duncan', o: 92 },
      C: { n: 'David Robinson', o: 88 },
    },
  },
  {
    franchise: 'Detroit Pistons',
    year: '2004',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Chauncey Billups', o: 86 },
      SG: { n: 'Richard Hamilton', o: 82 },
      SF: { n: 'Tayshaun Prince', o: 76 },
      PF: { n: 'Rasheed Wallace', o: 85 },
      C: { n: 'Ben Wallace', o: 88 },
    },
  },
  {
    franchise: 'L.A. Lakers',
    year: '1987',
    conference: 'West',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Magic Johnson', o: 96 },
      SG: { n: 'Byron Scott', o: 78 },
      SF: { n: 'James Worthy', o: 88 },
      PF: { n: 'A.C. Green', o: 74 },
      C: { n: 'Kareem Abdul-Jabbar', o: 91 },
    },
  },
  {
    franchise: 'Boston Celtics',
    year: '2008',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Rajon Rondo', o: 78 },
      SG: { n: 'Ray Allen', o: 85 },
      SF: { n: 'Paul Pierce', o: 87 },
      PF: { n: 'Kevin Garnett', o: 92 },
      C: { n: 'Kendrick Perkins', o: 70 },
    },
  },
  {
    franchise: 'Chicago Bulls',
    year: '1991',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'John Paxson', o: 74 },
      SG: { n: 'Michael Jordan', o: 98 },
      SF: { n: 'Scottie Pippen', o: 88 },
      PF: { n: 'Horace Grant', o: 78 },
      C: { n: 'Bill Cartwright', o: 72 },
    },
  },
  {
    franchise: 'Philadelphia 76ers',
    year: '1983',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Maurice Cheeks', o: 80 },
      SG: { n: 'Andrew Toney', o: 78 },
      SF: { n: 'Julius Erving', o: 92 },
      PF: { n: 'Bobby Jones', o: 76 },
      C: { n: 'Moses Malone', o: 91 },
    },
  },
  {
    franchise: 'Milwaukee Bucks',
    year: '2021',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Jrue Holiday', o: 85 },
      SG: { n: 'Bryn Forbes', o: 68 },
      SF: { n: 'Khris Middleton', o: 85 },
      PF: { n: 'Giannis Antetokounmpo', o: 96 },
      C: { n: 'Brook Lopez', o: 76 },
    },
  },
  {
    franchise: 'Boston Celtics',
    year: '2024',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Jrue Holiday', o: 84 },
      SG: { n: 'Derrick White', o: 84 },
      SF: { n: 'Jaylen Brown', o: 90 },
      PF: { n: 'Jayson Tatum', o: 93 },
      C: { n: 'Kristaps Porzingis', o: 86 },
    },
  },
  // --- NEW SUPER-STRONG TEAMS (>=1 Icon) ---
  {
    franchise: 'L.A. Lakers',
    year: '2000',
    conference: 'West',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Ron Harper', o: 74 },
      SG: { n: 'Kobe Bryant', o: 93 },
      SF: { n: 'Glen Rice', o: 78 },
      PF: { n: 'A.C. Green', o: 72 },
      C: { n: 'Shaquille O\'Neal', o: 97 },
    },
  },
  {
    franchise: 'Houston Rockets',
    year: '2018',
    conference: 'West',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Chris Paul', o: 92 },
      SG: { n: 'James Harden', o: 96 },
      SF: { n: 'Trevor Ariza', o: 76 },
      PF: { n: 'P.J. Tucker', o: 76 },
      C: { n: 'Clint Capela', o: 84 },
    },
  },
  {
    franchise: 'San Antonio Spurs',
    year: '2003',
    conference: 'West',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Tony Parker', o: 86 },
      SG: { n: 'Stephen Jackson', o: 76 },
      SF: { n: 'Bruce Bowen', o: 76 },
      PF: { n: 'Tim Duncan', o: 97 },
      C: { n: 'David Robinson', o: 80 },
    },
  },
  {
    franchise: 'Chicago Bulls',
    year: '1993',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'BJ Armstrong', o: 76 },
      SG: { n: 'Michael Jordan', o: 99 },
      SF: { n: 'Scottie Pippen', o: 94 },
      PF: { n: 'Horace Grant', o: 82 },
      C: { n: 'Bill Cartwright', o: 70 },
    },
  },
  {
    franchise: 'Miami Heat',
    year: '2012',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Mario Chalmers', o: 72 },
      SG: { n: 'Dwyane Wade', o: 92 },
      SF: { n: 'LeBron James', o: 97 },
      PF: { n: 'Shane Battier', o: 74 },
      C: { n: 'Chris Bosh', o: 88 },
    },
  },
  {
    franchise: 'Boston Celtics',
    year: '1985',
    conference: 'East',
    tier: 'Legendary',
    roster: {
      PG: { n: 'Dennis Johnson', o: 80 },
      SG: { n: 'Danny Ainge', o: 76 },
      SF: { n: 'Larry Bird', o: 97 },
      PF: { n: 'Kevin McHale', o: 89 },
      C: { n: 'Robert Parish', o: 86 },
    },
  },

  // --- CONTENDER TIER ---
  {
    franchise: 'Oklahoma City Thunder',
    year: '2012',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Russell Westbrook', o: 90 },
      SG: { n: 'Thabo Sefolosha', o: 70 },
      SF: { n: 'Kevin Durant', o: 95 },
      PF: { n: 'Serge Ibaka', o: 78 },
      C: { n: 'Kendrick Perkins', o: 70 },
    },
  },
  {
    franchise: 'Atlanta Hawks',
    year: '2015',
    conference: 'East',
    tier: 'Contender',
    roster: {
      PG: { n: 'Jeff Teague', o: 78 },
      SG: { n: 'Kyle Korver', o: 76 },
      SF: { n: 'DeMarre Carroll', o: 74 },
      PF: { n: 'Paul Millsap', o: 85 },
      C: { n: 'Al Horford', o: 86 },
    },
  },
  {
    franchise: 'Brooklyn Nets',
    year: '2021',
    conference: 'East',
    tier: 'Contender',
    roster: {
      PG: { n: 'Kyrie Irving', o: 90 },
      SG: { n: 'James Harden', o: 92 },
      SF: { n: 'Kevin Durant', o: 96 },
      PF: { n: 'Jeff Green', o: 68 },
      C: { n: 'DeAndre Jordan', o: 70 },
    },
  },
  {
    franchise: 'L.A. Clippers',
    year: '2014',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Chris Paul', o: 92 },
      SG: { n: 'J.J. Redick', o: 76 },
      SF: { n: 'Matt Barnes', o: 72 },
      PF: { n: 'Blake Griffin', o: 86 },
      C: { n: 'DeAndre Jordan', o: 78 },
    },
  },
  {
    franchise: 'Portland Trail Blazers',
    year: '2019',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Damian Lillard', o: 90 },
      SG: { n: 'CJ McCollum', o: 84 },
      SF: { n: 'Al-Farouq Aminu', o: 72 },
      PF: { n: 'Maurice Harkless', o: 68 },
      C: { n: 'Jusuf Nurkic', o: 76 },
    },
  },
  {
    franchise: 'Phoenix Suns',
    year: '2005',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Steve Nash', o: 93 },
      SG: { n: 'Joe Johnson', o: 82 },
      SF: { n: 'Shawn Marion', o: 87 },
      PF: { n: 'Amar\'e Stoudemire', o: 85 },
      C: { n: 'Jake Voskuhl', o: 63 },
    },
  },
  {
    franchise: 'Dallas Mavericks',
    year: '2011',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Jason Kidd', o: 80 },
      SG: { n: 'DeShawn Stevenson', o: 66 },
      SF: { n: 'Shawn Marion', o: 78 },
      PF: { n: 'Dirk Nowitzki', o: 94 },
      C: { n: 'Tyson Chandler', o: 76 },
    },
  },
  {
    franchise: 'Sacramento Kings',
    year: '2002',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Mike Bibby', o: 82 },
      SG: { n: 'Doug Christie', o: 76 },
      SF: { n: 'Peja Stojakovic', o: 80 },
      PF: { n: 'Chris Webber', o: 88 },
      C: { n: 'Vlade Divac', o: 80 },
    },
  },
  {
    franchise: 'Minnesota Timberwolves',
    year: '2004',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Sam Cassell', o: 80 },
      SG: { n: 'Latrell Sprewell', o: 78 },
      SF: { n: 'Wally Szczerbiak', o: 74 },
      PF: { n: 'Kevin Garnett', o: 94 },
      C: { n: 'Michael Olowokandi', o: 65 },
    },
  },
  {
    franchise: 'Memphis Grizzlies',
    year: '2013',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Mike Conley', o: 82 },
      SG: { n: 'Tony Allen', o: 74 },
      SF: { n: 'Tayshaun Prince', o: 72 },
      PF: { n: 'Zach Randolph', o: 82 },
      C: { n: 'Marc Gasol', o: 86 },
    },
  },
  {
    franchise: 'Toronto Raptors',
    year: '2019',
    conference: 'East',
    tier: 'Contender',
    roster: {
      PG: { n: 'Kyle Lowry', o: 84 },
      SG: { n: 'Danny Green', o: 76 },
      SF: { n: 'Kawhi Leonard', o: 94 },
      PF: { n: 'Pascal Siakam', o: 82 },
      C: { n: 'Marc Gasol', o: 80 },
    },
  },
  {
    franchise: 'Indiana Pacers',
    year: '2000',
    conference: 'East',
    tier: 'Contender',
    roster: {
      PG: { n: 'Mark Jackson', o: 76 },
      SG: { n: 'Reggie Miller', o: 87 },
      SF: { n: 'Jalen Rose', o: 78 },
      PF: { n: 'Dale Davis', o: 74 },
      C: { n: 'Rik Smits', o: 76 },
    },
  },
  {
    franchise: 'New York Knicks',
    year: '1994',
    conference: 'East',
    tier: 'Contender',
    roster: {
      PG: { n: 'Derek Harper', o: 74 },
      SG: { n: 'John Starks', o: 78 },
      SF: { n: 'Charles Smith', o: 70 },
      PF: { n: 'Charles Oakley', o: 78 },
      C: { n: 'Patrick Ewing', o: 90 },
    },
  },
  {
    franchise: 'Orlando Magic',
    year: '1995',
    conference: 'East',
    tier: 'Contender',
    roster: {
      PG: { n: 'Penny Hardaway', o: 90 },
      SG: { n: 'Nick Anderson', o: 76 },
      SF: { n: 'Dennis Scott', o: 74 },
      PF: { n: 'Horace Grant', o: 78 },
      C: { n: 'Shaquille O\'Neal', o: 96 },
    },
  },
  {
    franchise: 'Dallas Mavericks',
    year: '2024',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Luka Doncic', o: 96 },
      SG: { n: 'Kyrie Irving', o: 90 },
      SF: { n: 'Derrick Jones Jr.', o: 74 },
      PF: { n: 'P.J. Washington', o: 78 },
      C: { n: 'Dereck Lively II', o: 78 },
    },
  },
  {
    franchise: 'Minnesota Timberwolves',
    year: '2024',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Mike Conley', o: 78 },
      SG: { n: 'Anthony Edwards', o: 90 },
      SF: { n: 'Jaden McDaniels', o: 78 },
      PF: { n: 'Karl-Anthony Towns', o: 86 },
      C: { n: 'Rudy Gobert', o: 84 },
    },
  },
  // --- NEW STRONG TEAMS (>1 Elite) ---
  {
    franchise: 'L.A. Lakers',
    year: '2020',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Kentavious Caldwell-Pope', o: 76 },
      SG: { n: 'Danny Green', o: 74 },
      SF: { n: 'LeBron James', o: 96 },
      PF: { n: 'Anthony Davis', o: 94 },
      C: { n: 'JaVale McGee', o: 72 },
    },
  },
  {
    franchise: 'L.A. Clippers',
    year: '2020',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Patrick Beverley', o: 76 },
      SG: { n: 'Paul George', o: 90 },
      SF: { n: 'Kawhi Leonard', o: 94 },
      PF: { n: 'Marcus Morris', o: 76 },
      C: { n: 'Ivica Zubac', o: 74 },
    },
  },
  {
    franchise: 'San Antonio Spurs',
    year: '2014',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Tony Parker', o: 88 },
      SG: { n: 'Danny Green', o: 76 },
      SF: { n: 'Kawhi Leonard', o: 91 },
      PF: { n: 'Tim Duncan', o: 89 },
      C: { n: 'Tiago Splitter', o: 72 },
    },
  },
  {
    franchise: 'Phoenix Suns',
    year: '2024',
    conference: 'West',
    tier: 'Contender',
    roster: {
      PG: { n: 'Devin Booker', o: 92 },
      SG: { n: 'Bradley Beal', o: 84 },
      SF: { n: 'Grayson Allen', o: 76 },
      PF: { n: 'Kevin Durant', o: 95 },
      C: { n: 'Jusuf Nurkic', o: 76 },
    },
  },
  {
    franchise: 'Miami Heat',
    year: '2006',
    conference: 'East',
    tier: 'Contender',
    roster: {
      PG: { n: 'Jason Williams', o: 76 },
      SG: { n: 'Dwyane Wade', o: 95 },
      SF: { n: 'Antoine Walker', o: 78 },
      PF: { n: 'Udonis Haslem', o: 74 },
      C: { n: 'Shaquille O\'Neal', o: 90 },
    },
  },
  {
    franchise: 'New Jersey Nets',
    year: '2002',
    conference: 'East',
    tier: 'Contender',
    roster: {
      PG: { n: 'Jason Kidd', o: 93 },
      SG: { n: 'Kerry Kittles', o: 76 },
      SF: { n: 'Richard Jefferson', o: 78 },
      PF: { n: 'Kenyon Martin', o: 84 },
      C: { n: 'Todd MacCulloch', o: 68 },
    },
  },
  {
    franchise: 'Miami Heat',
    year: '2023',
    conference: 'East',
    tier: 'Contender',
    roster: {
      PG: { n: 'Gabe Vincent', o: 76 },
      SG: { n: 'Max Strus', o: 74 },
      SF: { n: 'Jimmy Butler', o: 93 },
      PF: { n: 'Kevin Love', o: 74 },
      C: { n: 'Bam Adebayo', o: 88 },
    },
  },
  {
    franchise: 'Milwaukee Bucks',
    year: '2019',
    conference: 'East',
    tier: 'Contender',
    roster: {
      PG: { n: 'Eric Bledsoe', o: 80 },
      SG: { n: 'Malcolm Brogdon', o: 80 },
      SF: { n: 'Khris Middleton', o: 86 },
      PF: { n: 'Giannis Antetokounmpo', o: 95 },
      C: { n: 'Brook Lopez', o: 76 },
    },
  },

  // --- SOLID PLAYOFF TIER ---
  {
    franchise: 'New Orleans Pelicans',
    year: '2018',
    conference: 'West',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Rajon Rondo', o: 76 },
      SG: { n: 'Jrue Holiday', o: 84 },
      SF: { n: 'E\'Twaun Moore', o: 70 },
      PF: { n: 'Nikola Mirotic', o: 76 },
      C: { n: 'Anthony Davis', o: 94 },
    },
  },
  {
    franchise: 'Charlotte Hornets',
    year: '2022',
    conference: 'East',
    tier: 'Playoff',
    roster: {
      PG: { n: 'LaMelo Ball', o: 82 },
      SG: { n: 'Terry Rozier', o: 78 },
      SF: { n: 'Gordon Hayward', o: 78 },
      PF: { n: 'Miles Bridges', o: 80 },
      C: { n: 'Mason Plumlee', o: 70 },
    },
  },
  {
    franchise: 'Charlotte Bobcats',
    year: '2014',
    conference: 'East',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Kemba Walker', o: 78 },
      SG: { n: 'Gerald Henderson', o: 72 },
      SF: { n: 'Michael Kidd-Gilchrist', o: 70 },
      PF: { n: 'Josh McRoberts', o: 70 },
      C: { n: 'Al Jefferson', o: 84 },
    },
  },
  {
    franchise: 'Orlando Magic',
    year: '2009',
    conference: 'East',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Jameer Nelson', o: 78 },
      SG: { n: 'Courtney Lee', o: 70 },
      SF: { n: 'Hedo Turkoglu', o: 80 },
      PF: { n: 'Rashard Lewis', o: 82 },
      C: { n: 'Dwight Howard', o: 90 },
    },
  },
  {
    franchise: 'Utah Jazz',
    year: '2010',
    conference: 'West',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Deron Williams', o: 86 },
      SG: { n: 'CJ Miles', o: 72 },
      SF: { n: 'Ronnie Brewer', o: 70 },
      PF: { n: 'Carlos Boozer', o: 84 },
      C: { n: 'Mehmet Okur', o: 76 },
    },
  },
  {
    franchise: 'New York Knicks',
    year: '2013',
    conference: 'East',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Raymond Felton', o: 74 },
      SG: { n: 'Iman Shumpert', o: 72 },
      SF: { n: 'Carmelo Anthony', o: 91 },
      PF: { n: 'J.R. Smith', o: 80 },
      C: { n: 'Tyson Chandler', o: 80 },
    },
  },
  {
    franchise: 'Boston Celtics',
    year: '2016',
    conference: 'East',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Isaiah Thomas', o: 85 },
      SG: { n: 'Avery Bradley', o: 76 },
      SF: { n: 'Jae Crowder', o: 76 },
      PF: { n: 'Amir Johnson', o: 72 },
      C: { n: 'Al Horford', o: 84 },
    },
  },
  {
    franchise: 'Sacramento Kings',
    year: '2023',
    conference: 'West',
    tier: 'Playoff',
    roster: {
      PG: { n: 'De\'Aaron Fox', o: 88 },
      SG: { n: 'Kevin Huerter', o: 76 },
      SF: { n: 'Keegan Murray', o: 76 },
      PF: { n: 'Harrison Barnes', o: 76 },
      C: { n: 'Domantas Sabonis', o: 88 },
    },
  },
  {
    franchise: 'Minnesota Timberwolves',
    year: '2022',
    conference: 'West',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Patrick Beverley', o: 74 },
      SG: { n: 'D\'Angelo Russell', o: 80 },
      SF: { n: 'Anthony Edwards', o: 84 },
      PF: { n: 'Jarred Vanderbilt', o: 72 },
      C: { n: 'Karl-Anthony Towns', o: 86 },
    },
  },
  {
    franchise: 'Brooklyn Nets',
    year: '2020',
    conference: 'East',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Spencer Dinwiddie', o: 80 },
      SG: { n: 'Caris LeVert', o: 80 },
      SF: { n: 'Joe Harris', o: 76 },
      PF: { n: 'Taurean Prince', o: 72 },
      C: { n: 'Jarrett Allen', o: 76 },
    },
  },
  {
    franchise: 'Milwaukee Bucks',
    year: '2015',
    conference: 'East',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Michael Carter-Williams', o: 74 },
      SG: { n: 'Khris Middleton', o: 76 },
      SF: { n: 'Giannis Antetokounmpo', o: 80 },
      PF: { n: 'Ersan Ilyasova', o: 72 },
      C: { n: 'Zaza Pachulia', o: 70 },
    },
  },
  {
    franchise: 'Utah Jazz',
    year: '2018',
    conference: 'West',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Ricky Rubio', o: 78 },
      SG: { n: 'Donovan Mitchell', o: 82 },
      SF: { n: 'Joe Ingles', o: 76 },
      PF: { n: 'Derrick Favors', o: 76 },
      C: { n: 'Rudy Gobert', o: 86 },
    },
  },
  {
    franchise: 'Indiana Pacers',
    year: '2024',
    conference: 'East',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Tyrese Haliburton', o: 88 },
      SG: { n: 'Andrew Nembhard', o: 76 },
      SF: { n: 'Aaron Nesmith', o: 76 },
      PF: { n: 'Pascal Siakam', o: 86 },
      C: { n: 'Myles Turner', o: 80 },
    },
  },
  {
    franchise: 'Oklahoma City Thunder',
    year: '2024',
    conference: 'West',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Shai Gilgeous-Alexander', o: 96 },
      SG: { n: 'Josh Giddey', o: 76 },
      SF: { n: 'Luguentz Dort', o: 78 },
      PF: { n: 'Jalen Williams', o: 84 },
      C: { n: 'Chet Holmgren', o: 84 },
    },
  },
  // --- NEW AVERAGE & PLAY-IN TEAMS ---
  {
    franchise: 'Memphis Grizzlies',
    year: '2022',
    conference: 'West',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Ja Morant', o: 91 },
      SG: { n: 'Desmond Bane', o: 84 },
      SF: { n: 'Dillon Brooks', o: 76 },
      PF: { n: 'Jaren Jackson Jr.', o: 85 },
      C: { n: 'Steven Adams', o: 78 },
    },
  },
  {
    franchise: 'Portland Trail Blazers',
    year: '2021',
    conference: 'West',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Damian Lillard', o: 92 },
      SG: { n: 'CJ McCollum', o: 84 },
      SF: { n: 'Norman Powell', o: 78 },
      PF: { n: 'Robert Covington', o: 74 },
      C: { n: 'Jusuf Nurkic', o: 78 },
    },
  },
  {
    franchise: 'Golden State Warriors',
    year: '2021',
    conference: 'West',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Stephen Curry', o: 95 },
      SG: { n: 'Kent Bazemore', o: 70 },
      SF: { n: 'Andrew Wiggins', o: 78 },
      PF: { n: 'Draymond Green', o: 80 },
      C: { n: 'Kevon Looney', o: 72 },
    },
  },
  {
    franchise: 'New York Knicks',
    year: '2023',
    conference: 'East',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Jalen Brunson', o: 90 },
      SG: { n: 'Quentin Grimes', o: 74 },
      SF: { n: 'RJ Barrett', o: 78 },
      PF: { n: 'Julius Randle', o: 85 },
      C: { n: 'Mitchell Robinson', o: 76 },
    },
  },
  {
    franchise: 'Atlanta Hawks',
    year: '2021',
    conference: 'East',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Trae Young', o: 90 },
      SG: { n: 'Bogdan Bogdanovic', o: 78 },
      SF: { n: 'Kevin Huerter', o: 74 },
      PF: { n: 'John Collins', o: 82 },
      C: { n: 'Clint Capela', o: 82 },
    },
  },
  {
    franchise: 'Washington Wizards',
    year: '2021',
    conference: 'East',
    tier: 'Playoff',
    roster: {
      PG: { n: 'Russell Westbrook', o: 86 },
      SG: { n: 'Bradley Beal', o: 88 },
      SF: { n: 'Rui Hachimura', o: 74 },
      PF: { n: 'Davis Bertans', o: 70 },
      C: { n: 'Alex Len', o: 68 },
    },
  },
];

export function teamOverallRating(team: HoopickTeam): number {
  const ratings = Object.values(team.roster).map((r) => r.o);
  return Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
}

export function rarityFromOvr(ovr: number): 'bronze' | 'silver' | 'gold' | 'elite' | 'icon' {
  if (ovr >= 95) return 'icon';
  if (ovr >= 90) return 'elite';
  if (ovr >= 80) return 'gold';
  if (ovr >= 70) return 'silver';
  return 'bronze';
}

export const RARITY_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  elite: 'Elite',
  icon: 'Icon',
};
