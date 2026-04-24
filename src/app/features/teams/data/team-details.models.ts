import { Match, StandingsRow } from '../../../core/models';

export type TeamDetailsTab = 'overview' | 'squad' | 'recent' | 'standings';

export interface TeamDetailsVm {
  id: number;
  name: string;
  logo?: string;
  country?: string;
  founded?: number;
  venueName?: string;
  venueCity?: string;
  venueCapacity?: number;
  squad: Array<{ id: number; name: string; age?: number; number?: number; position?: string; photo?: string }>;
  recentMatches: Match[];
  standingsRows: StandingsRow[];
}
