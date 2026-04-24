export type MatchDetailsTab = 'overview' | 'lineups' | 'events' | 'stats';

export interface MatchHeaderVm {
  fixtureId: number;
  leagueName: string;
  leagueCountry: string;
  leagueLogo?: string;
  venueName?: string;
  venueCity?: string;
  date: string;
  status: string;
  minute: number | null;
  homeTeam: { id: number; name: string; logo?: string; score: number | null };
  awayTeam: { id: number; name: string; logo?: string; score: number | null };
}

export interface MatchLineupTeamVm {
  teamId: number;
  teamName: string;
  teamLogo?: string;
  formation?: string;
  coach?: string;
  startXI: Array<{ id?: number; name: string; number?: number; pos?: string }>;
  substitutes: Array<{ id?: number; name: string; number?: number; pos?: string }>;
}

export interface MatchEventVm {
  minute: number | null;
  extra: number | null;
  teamId: number;
  teamName: string;
  teamLogo?: string;
  playerId?: number;
  playerName?: string;
  assistId?: number;
  assistName?: string;
  type: string;
  detail: string;
}

export interface MatchStatRowVm {
  type: string;
  homeValue: string | number | null;
  awayValue: string | number | null;
}

export interface MatchDetailsVm {
  header: MatchHeaderVm;
  lineups: MatchLineupTeamVm[];
  events: MatchEventVm[];
  stats: MatchStatRowVm[];
}
