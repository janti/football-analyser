import { StandingsRow } from '../../../core/models';

export interface StandingLeagueOption {
  id: number;
  name: string;
  country: string;
}

export interface StandingsVm {
  loading: boolean;
  error: string | null;
  rows: StandingsRow[];
  selectedLeagueId: number;
  leagueOptions: StandingLeagueOption[];
}
