import { ApiFixtureResponseItem } from '../../../core/api/api-football.types';
import { Match } from '../../../core/models';

export function mapApiFixtureToMatch(item: ApiFixtureResponseItem): Match {
  return {
    id: item.fixture.id,
    date: item.fixture.date,
    league: {
      id: item.league.id,
      name: item.league.name,
      country: item.league.country,
      logo: item.league.logo,
      season: item.league.season
    },
    homeTeam: {
      id: item.teams.home.id,
      name: item.teams.home.name,
      logo: item.teams.home.logo
    },
    awayTeam: {
      id: item.teams.away.id,
      name: item.teams.away.name,
      logo: item.teams.away.logo
    },
    homeGoals: item.goals.home,
    awayGoals: item.goals.away,
    status: item.fixture.status.short,
    minute: item.fixture.status.elapsed
  };
}
