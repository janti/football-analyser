import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';

import { ApiFootballService } from '../../../core/services/api-football.service';
import { mapToMatchDetailsVm } from './match-details.mapper';
import { MatchDetailsVm } from './match-details.models';

@Injectable({ providedIn: 'root' })
export class MatchDetailsService {
  private readonly api = inject(ApiFootballService);
  private readonly cache = new Map<number, MatchDetailsVm | null>();

  getMatchDetails(fixtureId: number): Observable<MatchDetailsVm | null> {
    const cached = this.cache.get(fixtureId);
    if (cached !== undefined) {
      return of(cached);
    }

    return forkJoin({
      fixture: this.api.getFixtureDetails(fixtureId),
      lineups: this.api.getFixtureLineups(fixtureId),
      events: this.api.getFixtureEvents(fixtureId),
      stats: this.api.getFixtureStatistics(fixtureId)
    }).pipe(
      map(({ fixture, lineups, events, stats }) => {
        const item = fixture.response[0];
        if (!item) {
          this.cache.set(fixtureId, null);
          return null;
        }

        const vm = mapToMatchDetailsVm(item, lineups.response, events.response, stats.response);
        this.cache.set(fixtureId, vm);
        return vm;
      })
    );
  }
}
