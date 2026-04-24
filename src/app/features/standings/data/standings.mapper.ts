import { ApiStandingsResponseItem } from '../../../core/api/api-football.types';
import { StandingsRow } from '../../../core/models';

export function mapStandingsResponse(item: ApiStandingsResponseItem): StandingsRow[] {
  const rows = item.league.standings[0] ?? [];
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
