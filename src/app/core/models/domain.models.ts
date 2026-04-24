export interface League {
  id: number;
  name: string;
  country: string;
  logo?: string;
  season?: number;
}

export interface Team {
  id: number;
  name: string;
  logo?: string;
  country?: string;
}

export interface Player {
  id: number;
  name: string;
  age?: number;
  nationality?: string;
  photo?: string;
  team?: Team;
}

export interface Match {
  id: number;
  date: string;
  league: League;
  homeTeam: Team;
  awayTeam: Team;
  homeGoals: number | null;
  awayGoals: number | null;
  status: string;
  minute?: number | null;
}

export interface LeagueFilterOption {
  id: number;
  name: string;
}

export interface FixtureDetails {
  match: Match;
  events: Array<{
    time: number;
    type: string;
    detail: string;
    team: Team;
    player?: Player;
  }>;
  lineups: Array<{
    team: Team;
    coach: string;
    formation?: string;
    startXI: Player[];
    substitutes: Player[];
  }>;
  statistics: Array<{
    team: Team;
    type: string;
    value: string | number | null;
  }>;
}

export interface StandingsRow {
  rank: number;
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}
