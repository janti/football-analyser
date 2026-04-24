export interface PlayerStatGroupVm {
  title: string;
  items: Array<{ label: string; value: string | number }>;
}

export interface PlayerDetailsVm {
  id: number;
  name: string;
  photo?: string;
  age?: number;
  nationality?: string;
  birthCountry?: string;
  height?: string;
  weight?: string;
  position?: string;
  currentTeam?: { id: number; name: string; logo?: string };
  statGroups: PlayerStatGroupVm[];
}
