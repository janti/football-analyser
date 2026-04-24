export interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: Record<string, string>;
  results: number;
  paging: { current: number; total: number };
  response: T;
}

export interface ApiFixtureResponseItem {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    season: number;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface ApiTeamSearchItem {
  team: {
    id: number;
    name: string;
    logo: string;
    country?: string;
  };
}

export interface ApiPlayerSearchItem {
  player: {
    id: number;
    name: string;
    age?: number;
    nationality?: string;
    photo?: string;
  };
  statistics?: Array<{
    team: {
      id: number;
      name: string;
      logo?: string;
      country?: string;
    };
  }>;
}

export interface ApiStandingsResponseItem {
  league: {
    id: number;
    name: string;
    country: string;
    season: number;
    standings: Array<
      Array<{
        rank: number;
        team: {
          id: number;
          name: string;
          logo?: string;
        };
        all: {
          played: number;
          win: number;
          draw: number;
          lose: number;
          goals: {
            for: number;
            against: number;
          };
        };
        goalsDiff: number;
        points: number;
      }>
    >;
  };
}

export interface ApiFixtureDetailsItem {
  fixture: {
    id: number;
    date: string;
    venue?: {
      name?: string;
      city?: string;
    };
    status: {
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo?: string;
    season: number;
  };
  teams: {
    home: { id: number; name: string; logo?: string; winner?: boolean };
    away: { id: number; name: string; logo?: string; winner?: boolean };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score?: {
    halftime?: { home: number | null; away: number | null };
    fulltime?: { home: number | null; away: number | null };
  };
}

export interface ApiFixtureLineupItem {
  team: {
    id: number;
    name: string;
    logo?: string;
    colors?: { player?: { primary?: string } };
  };
  coach: { id?: number; name: string; photo?: string };
  formation?: string;
  startXI: Array<{ player: { id?: number; name: string; number?: number; pos?: string } }>;
  substitutes: Array<{ player: { id?: number; name: string; number?: number; pos?: string } }>;
}

export interface ApiFixtureEventItem {
  time: { elapsed: number | null; extra?: number | null };
  team: { id: number; name: string; logo?: string };
  player: { id?: number; name?: string };
  assist?: { id?: number; name?: string };
  type: string;
  detail: string;
  comments?: string | null;
}

export interface ApiFixtureStatisticsItem {
  team: { id: number; name: string; logo?: string };
  statistics: Array<{ type: string; value: string | number | null }>;
}

export interface ApiPlayerDetailsItem {
  player: {
    id: number;
    name: string;
    firstname?: string;
    lastname?: string;
    age?: number;
    nationality?: string;
    height?: string;
    weight?: string;
    photo?: string;
    birth?: {
      date?: string;
      place?: string;
      country?: string;
    };
  };
  statistics?: Array<{
    team: {
      id: number;
      name: string;
      logo?: string;
      country?: string;
    };
    league: {
      id: number;
      name: string;
      country?: string;
      season?: number;
    };
    games?: {
      appearences?: number;
      lineups?: number;
      minutes?: number;
      position?: string;
      rating?: string;
    };
    shots?: {
      total?: number;
      on?: number;
    };
    goals?: {
      total?: number;
      assists?: number;
    };
    passes?: {
      total?: number;
      key?: number;
      accuracy?: string;
    };
    tackles?: {
      total?: number;
      blocks?: number;
      interceptions?: number;
    };
    cards?: {
      yellow?: number;
      red?: number;
    };
    fouls?: {
      committed?: number;
      drawn?: number;
    };
    dribbles?: {
      attempts?: number;
      success?: number;
      past?: number;
    };
    duels?: {
      total?: number;
      won?: number;
    };
    penalty?: {
      won?: number;
      committed?: number;
      scored?: number;
      missed?: number;
      saved?: number;
    };
  }>;
}

export interface ApiTeamDetailsItem {
  team: {
    id: number;
    name: string;
    code?: string;
    country?: string;
    founded?: number;
    logo?: string;
  };
  venue?: {
    id?: number;
    name?: string;
    city?: string;
    capacity?: number;
    surface?: string;
    image?: string;
  };
}

export interface ApiTeamSquadItem {
  team: {
    id: number;
    name: string;
    logo?: string;
  };
  players: Array<{
    id: number;
    name: string;
    age?: number;
    number?: number;
    position?: string;
    photo?: string;
  }>;
}
