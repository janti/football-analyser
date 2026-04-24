import { Match, Player, Team } from '../../../core/models';

export type SearchTab = 'matches' | 'teams' | 'players';

export interface SearchVm {
  tab: SearchTab;
  query: string;
  loading: boolean;
  error: string | null;
  matches: Match[];
  teams: Team[];
  players: Player[];
}
