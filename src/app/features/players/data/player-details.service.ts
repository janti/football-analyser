import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { ApiFootballService } from '../../../core/services/api-football.service';
import { mapPlayerDetails } from './player-details.mapper';
import { PlayerDetailsVm } from './player-details.models';

@Injectable({ providedIn: 'root' })
export class PlayerDetailsService {
  private readonly api = inject(ApiFootballService);
  private readonly cache = new Map<string, PlayerDetailsVm | null>();

  getPlayerDetails(playerId: number): Observable<PlayerDetailsVm | null> {
    const season = this.resolveSeason();
    const key = `${playerId}:${season}`;
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return of(cached);
    }

    return this.api.getPlayerDetails(playerId, season).pipe(
      map((res) => res.response[0] ?? null),
      map((item) => (item ? mapPlayerDetails(item) : null)),
      map((data) => {
        this.cache.set(key, data);
        return data;
      }),
      catchError(() => of(null))
    );
  }

  private resolveSeason(): number {
    const now = new Date();
    return now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  }
}
