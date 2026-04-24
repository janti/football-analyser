import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concat,
  forkJoin,
  map,
  Observable,
  of,
  shareReplay,
  switchMap
} from 'rxjs';

import { ApiFootballService } from '../../../core/services/api-football.service';
import { LeagueFilterOption, Match } from '../../../core/models';
import { mapApiFixtureToMatch } from './home-matches.mapper';

interface HomeMatchesState {
  loading: boolean;
  error: string | null;
  matches: Match[];
}

interface LoadMatchesResult {
  matches: Match[];
  failedCount: number;
}

@Injectable({ providedIn: 'root' })
export class HomeMatchesFacade {
  private readonly api = inject(ApiFootballService);

  readonly leagueOptions: LeagueFilterOption[] = [
    { id: 39, name: 'Premier League' },
    { id: 140, name: 'La Liga' },
    { id: 135, name: 'Serie A' },
    { id: 78, name: 'Bundesliga' },
    { id: 61, name: 'Ligue 1' },
    { id: 2, name: 'Champions League' }
  ];
  private readonly leagueOrder = new Map<number, number>(this.leagueOptions.map((league, index) => [league.id, index]));

  private readonly defaultLeagueIds = this.leagueOptions.map((x) => x.id);
  private readonly selectedLeagueIdsSubject = new BehaviorSubject<number[]>(this.defaultLeagueIds);
  readonly selectedLeagueIds$ = this.selectedLeagueIdsSubject.asObservable();

  private readonly selectedDateSubject = new BehaviorSubject<string>(new Date().toISOString().slice(0, 10));
  readonly selectedDate$ = this.selectedDateSubject.asObservable();
  private readonly cache = new Map<string, Match[]>();

  readonly state$: Observable<HomeMatchesState> = combineLatest([this.selectedLeagueIds$, this.selectedDate$]).pipe(
    switchMap(([leagueIds, date]) => {
      if (!leagueIds.length) {
        return of<HomeMatchesState>({ loading: false, error: null, matches: [] });
      }

      return concat(
        of<HomeMatchesState>({ loading: true, error: null, matches: [] }),
        this.loadMatches(leagueIds, date).pipe(
          map(({ matches, failedCount }) => ({
            loading: false,
            error:
              failedCount > 0 && matches.length === 0
                ? 'Osa liigoista ei latautunut. Naytetaan saatavilla olevat ottelut.'
                : null,
            matches
          })),
          catchError((error: unknown) =>
            of<HomeMatchesState>({
              loading: false,
              error: this.mapErrorMessage(error),
              matches: []
            })
          )
        )
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly vm$ = combineLatest([this.state$, this.selectedLeagueIds$, this.selectedDate$]).pipe(
    map(([state, selectedLeagueIds, selectedDate]) => ({
      ...state,
      selectedLeagueIds,
      selectedDate,
      leagueOptions: this.leagueOptions
    }))
  );

  setSelectedLeagueIds(leagueIds: number[]): void {
    this.selectedLeagueIdsSubject.next([...leagueIds].sort((a, b) => a - b));
  }

  setSelectedDate(dateIso: string): void {
    this.selectedDateSubject.next(dateIso);
  }

  toggleLeague(leagueId: number): void {
    const selected = this.selectedLeagueIdsSubject.value;
    const next = selected.includes(leagueId) ? selected.filter((id) => id !== leagueId) : [...selected, leagueId];
    this.setSelectedLeagueIds(next);
  }

  private loadMatches(leagueIds: number[], dateIso: string): Observable<LoadMatchesResult> {
    const sortedLeagueIds = [...leagueIds].sort((a, b) => a - b);
    const cacheKey = `${dateIso}:${sortedLeagueIds.join(',')}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return of({ matches: cached, failedCount: 0 });
    }

    const requests = sortedLeagueIds.map((leagueId) =>
      this.api.getFixturesByDateAndLeague(dateIso, leagueId).pipe(
        map((response) => ({ response, failed: false })),
        catchError(() => of({ response: null, failed: true }))
      )
    );

    return forkJoin(requests).pipe(
      map((results) => {
        const failedCount = results.filter((x) => x.failed).length;
        const matches = results
          .filter((x) => x.response !== null)
          .flatMap((x) => x.response!.response.map(mapApiFixtureToMatch))
          .sort((a, b) => {
            const leagueA = this.leagueOrder.get(a.league.id) ?? Number.MAX_SAFE_INTEGER;
            const leagueB = this.leagueOrder.get(b.league.id) ?? Number.MAX_SAFE_INTEGER;
            if (leagueA !== leagueB) {
              return leagueA - leagueB;
            }

            const timeDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (timeDiff !== 0) {
              return timeDiff;
            }

            return a.homeTeam.name.localeCompare(b.homeTeam.name);
          });

        this.cache.set(cacheKey, matches);
        return { matches, failedCount };
      })
    );
  }

  private mapErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) {
        return 'API-kaytto estettiin (401/403). Tarkista kirjautumistiedot ja palvelimen ymparistomuuttujat.';
      }

      if (error.status === 429) {
        return 'API-pyyntoraja tuli vastaan (429). Yrita hetken kuluttua uudelleen.';
      }
    }

    return 'Otteluiden lataus epaonnistui. Tarkista API-avain tai verkkoyhteys.';
  }
}
