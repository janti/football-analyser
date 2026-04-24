import { ApiFixtureResponseItem, ApiStandingsResponseItem, ApiTeamDetailsItem, ApiTeamSquadItem } from '../../../core/api/api-football.types';
import { Match, StandingsRow } from '../../../core/models';
import { TeamDetailsVm } from './team-details.models';

function mapRecentMatch(item: ApiFixtureResponseItem): Match {
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

function mapStandingsRows(item: ApiStandingsResponseItem | null): StandingsRow[] {
  const rows = item?.league.standings?.[0] ?? [];
  return rows.map((row) => ({
    rank: row.rank,
    team: {
      id: row.team.id,
      name: row.team.name,
      logo: row.team.logo
    },
    played: row.all.played,
    wins: row.all.win,
    draws: row.all.draw,
    losses: row.all.lose,
    goalsFor: row.all.goals.for,
    goalsAgainst: row.all.goals.against,
    points: row.points
  }));
}

export function mapTeamDetailsVm(
  teamInfo: ApiTeamDetailsItem,
  squad: ApiTeamSquadItem | null,
  recentMatches: ApiFixtureResponseItem[],
  standings: ApiStandingsResponseItem | null
): TeamDetailsVm {
  return {
    id: teamInfo.team.id,
    name: teamInfo.team.name,
    logo: teamInfo.team.logo,
    country: teamInfo.team.country,
    founded: teamInfo.team.founded,
    venueName: teamInfo.venue?.name,
    venueCity: teamInfo.venue?.city,
    venueCapacity: teamInfo.venue?.capacity,
    squad: squad?.players ?? [],
    recentMatches: recentMatches.map(mapRecentMatch),
    standingsRows: mapStandingsRows(standings)
  };
}
