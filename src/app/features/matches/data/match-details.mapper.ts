import {
  ApiFixtureDetailsItem,
  ApiFixtureEventItem,
  ApiFixtureLineupItem,
  ApiFixtureStatisticsItem
} from '../../../core/api/api-football.types';
import { MatchDetailsVm, MatchEventVm, MatchLineupTeamVm, MatchStatRowVm } from './match-details.models';

function mapLineup(item: ApiFixtureLineupItem): MatchLineupTeamVm {
  return {
    teamId: item.team.id,
    teamName: item.team.name,
    teamLogo: item.team.logo,
    formation: item.formation,
    coach: item.coach?.name,
    startXI: item.startXI.map((x) => x.player),
    substitutes: item.substitutes.map((x) => x.player)
  };
}

function mapEvent(item: ApiFixtureEventItem): MatchEventVm {
  return {
    minute: item.time.elapsed,
    extra: item.time.extra ?? null,
    teamId: item.team.id,
    teamName: item.team.name,
    teamLogo: item.team.logo,
    playerId: item.player?.id,
    playerName: item.player?.name,
    assistId: item.assist?.id,
    assistName: item.assist?.name,
    type: item.type,
    detail: item.detail
  };
}

function mapStats(statItems: ApiFixtureStatisticsItem[]): MatchStatRowVm[] {
  const [home, away] = statItems;
  const types = new Set<string>([...(home?.statistics ?? []).map((x) => x.type), ...(away?.statistics ?? []).map((x) => x.type)]);

  return [...types].map((type) => ({
    type,
    homeValue: home?.statistics.find((x) => x.type === type)?.value ?? null,
    awayValue: away?.statistics.find((x) => x.type === type)?.value ?? null
  }));
}

export function mapToMatchDetailsVm(
  fixture: ApiFixtureDetailsItem,
  lineups: ApiFixtureLineupItem[],
  events: ApiFixtureEventItem[],
  stats: ApiFixtureStatisticsItem[]
): MatchDetailsVm {
  return {
    header: {
      fixtureId: fixture.fixture.id,
      leagueName: fixture.league.name,
      leagueCountry: fixture.league.country,
      leagueLogo: fixture.league.logo,
      venueName: fixture.fixture.venue?.name,
      venueCity: fixture.fixture.venue?.city,
      date: fixture.fixture.date,
      status: fixture.fixture.status.short,
      minute: fixture.fixture.status.elapsed,
      homeTeam: {
        id: fixture.teams.home.id,
        name: fixture.teams.home.name,
        logo: fixture.teams.home.logo,
        score: fixture.goals.home
      },
      awayTeam: {
        id: fixture.teams.away.id,
        name: fixture.teams.away.name,
        logo: fixture.teams.away.logo,
        score: fixture.goals.away
      }
    },
    lineups: lineups.map(mapLineup),
    events: events.map(mapEvent).sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0)),
    stats: mapStats(stats)
  };
}
