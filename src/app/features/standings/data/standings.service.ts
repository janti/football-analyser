import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';

import { StandingsRow } from '../../../core/models';
import { ApiFootballService } from '../../../core/services/api-football.service';
import { mapStandingsResponse } from './standings.mapper';

@Injectable({ providedIn: 'root' })
export class StandingsService {
  private readonly api = inject(ApiFootballService);
  private readonly cache = new Map<string, StandingsRow[]>();

  getStandings(leagueId: number): Observable<StandingsRow[]> {
    const season = this.resolveCurrentSeason();

    return this.fetchStandingsForSeason(leagueId, season).pipe(
      switchMap((rows) => {
        if (rows.length > 0) {
          return of(rows);
        }

        // Fallback to previous season when current season has no published table yet.
        return this.fetchStandingsForSeason(leagueId, season - 1);
      })
    );
  }

  private fetchStandingsForSeason(leagueId: number, season: number): Observable<StandingsRow[]> {
    const key = `${leagueId}:${season}`;
    const cached = this.cache.get(key);
    if (cached) {
      return of(cached);
    }

    return this.api.getStandingsByLeague(leagueId, season).pipe(
      map((res) => {
        const item = res.response[0];
        const rows = item ? mapStandingsResponse(item) : [];
        this.cache.set(key, rows);
        return rows;
      })
    );
  }

  private resolveCurrentSeason(): number {
    const now = new Date();
    return now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  }
}
