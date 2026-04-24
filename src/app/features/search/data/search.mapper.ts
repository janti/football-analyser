import { ApiFixtureResponseItem, ApiPlayerDetailsItem, ApiPlayerSearchItem, ApiTeamSearchItem } from '../../../core/api/api-football.types';
import { Match, Player, Team } from '../../../core/models';

export function mapTeamSearchItem(item: ApiTeamSearchItem): Team {
  return {
    id: item.team.id,
    name: item.team.name,
    logo: item.team.logo,
    country: item.team.country
  };
}

export function mapPlayerSearchItem(item: ApiPlayerSearchItem | ApiPlayerDetailsItem): Player {
  const teamStat = item.statistics?.[0]?.team;
  return {
    id: item.player.id,
    name: item.player.name,
    age: item.player.age,
    nationality: item.player.nationality,
    photo: item.player.photo,
    team: teamStat
      ? {
          id: teamStat.id,
          name: teamStat.name,
          logo: teamStat.logo,
          country: teamStat.country
        }
      : undefined
  };
}

export function mapFixtureToMatch(item: ApiFixtureResponseItem): Match {
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
