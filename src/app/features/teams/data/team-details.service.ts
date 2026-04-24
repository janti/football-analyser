import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { ApiFootballService } from '../../../core/services/api-football.service';
import { mapTeamDetailsVm } from './team-details.mapper';
import { TeamDetailsVm } from './team-details.models';

@Injectable({ providedIn: 'root' })
export class TeamDetailsService {
  private readonly api = inject(ApiFootballService);
  private readonly cache = new Map<number, TeamDetailsVm | null>();

  getTeamDetails(teamId: number) {
    const cached = this.cache.get(teamId);
    if (cached !== undefined) {
      return of(cached);
    }

    return forkJoin({
      team: this.api.getTeamDetails(teamId),
      squad: this.api.getTeamSquad(teamId).pipe(catchError(() => of({ response: [] }))),
      recent: this.api.getLastFixturesByTeam(teamId, 8).pipe(catchError(() => of({ response: [] })))
    }).pipe(
      switchMap(({ team, squad, recent }) => {
        const teamInfo = team.response[0];
        if (!teamInfo) {
          return of<TeamDetailsVm | null>(null);
        }

        const firstMatch = recent.response[0];
        const leagueId = firstMatch?.league.id;
        const season = firstMatch?.league.season;
        if (!leagueId || !season) {
          const vm = mapTeamDetailsVm(teamInfo, squad.response[0] ?? null, recent.response, null);
          this.cache.set(teamId, vm);
          return of(vm);
        }

        return this.api.getStandingsByLeague(leagueId, season).pipe(
          map((standings) => {
            const vm = mapTeamDetailsVm(teamInfo, squad.response[0] ?? null, recent.response, standings.response[0] ?? null);
            this.cache.set(teamId, vm);
            return vm;
          }),
          catchError(() => {
            const vm = mapTeamDetailsVm(teamInfo, squad.response[0] ?? null, recent.response, null);
            this.cache.set(teamId, vm);
            return of(vm);
          })
        );
      }),
      catchError(() => {
        this.cache.set(teamId, null);
        return of<TeamDetailsVm | null>(null);
      })
    );
  }
}
