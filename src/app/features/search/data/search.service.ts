import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, catchError } from 'rxjs';

import { Match, Player, Team } from '../../../core/models';
import { ApiFootballService } from '../../../core/services/api-football.service';
import { mapFixtureToMatch, mapPlayerSearchItem, mapTeamSearchItem } from './search.mapper';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly api = inject(ApiFootballService);
  private readonly topLeagues = [39, 140, 135, 78, 61];
  private readonly teamCache = new Map<string, Team[]>();
  private readonly playerCache = new Map<string, Player[]>();
  private readonly matchCache = new Map<string, Match[]>();

  searchTeams(query: string): Observable<Team[]> {
    const key = query.trim().toLowerCase();
    const cached = this.teamCache.get(key);
    if (cached) {
      return of(cached);
    }

    return this.api.searchTeams(query).pipe(
      map((res) => res.response.map(mapTeamSearchItem)),
      map((teams) => {
        this.teamCache.set(key, teams);
        return teams;
      })
    );
  }

  searchPlayers(query: string): Observable<Player[]> {
    const key = query.trim().toLowerCase();
    const cached = this.playerCache.get(key);
    if (cached) {
      return of(cached);
    }

    const season = this.resolveSeason();
    const leagueRequests = this.topLeagues.map((leagueId) =>
      this.api.searchPlayersByLeague(query, leagueId, season).pipe(
        map((res) => res.response),
        catchError(() => of([]))
      )
    );

    return forkJoin({
      profile: this.api.searchPlayers(query).pipe(
        map((res) => res.response),
        catchError(() => of([]))
      ),
      leagueBuckets: forkJoin(leagueRequests)
    }).pipe(
      map(({ profile, leagueBuckets }) => {
        const merged = [...profile, ...leagueBuckets.flat()];
        const byId = new Map<number, Player>();

        for (const item of merged) {
          const mapped = mapPlayerSearchItem(item);
          const existing = byId.get(mapped.id);
          if (!existing || (!existing.team && mapped.team)) {
            byId.set(mapped.id, mapped);
          }
        }

        const players = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
        this.playerCache.set(key, players);
        return players;
      })
    );
  }

  searchMatches(query: string): Observable<Match[]> {
    const key = query.trim().toLowerCase();
    const cached = this.matchCache.get(key);
    if (cached) {
      return of(cached);
    }

    return this.searchTeams(query).pipe(
      switchMap((teams) => {
        const limitedTeams = teams.slice(0, 4);
        if (!limitedTeams.length) {
          return of<Match[]>([]);
        }

        return forkJoin(limitedTeams.map((team) => this.api.getFixturesByTeam(team.id, 8))).pipe(
          map((responses) =>
            responses
              .flatMap((res) => res.response.map(mapFixtureToMatch))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          ),
          map((matches) => {
            this.matchCache.set(key, matches);
            return matches;
          })
        );
      })
    );
  }

  private resolveSeason(): number {
    const now = new Date();
    return now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  }
}
