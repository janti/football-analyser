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
  failedStatuses: number[];
}

@Injectable({ providedIn: 'root' })
export class HomeMatchesFacade {
  private readonly api = inject(ApiFootballService);

  readonly leagueOptions: LeagueFilterOption[] = [
    { id: 39, name: 'Premier League', country: 'England', gender: 'men' },
    { id: 140, name: 'La Liga', country: 'Spain', gender: 'men' },
    { id: 135, name: 'Serie A', country: 'Italy', gender: 'men' },
    { id: 78, name: 'Bundesliga', country: 'Germany', gender: 'men' },
    { id: 61, name: 'Ligue 1', country: 'France', gender: 'men' },
    { id: 179, name: 'Veikkausliiga', country: 'Finland', gender: 'men' },
    { id: 113, name: 'Allsvenskan', country: 'Sweden', gender: 'men' },
    { id: 103, name: 'Eliteserien', country: 'Norway', gender: 'men' },
    { id: 44, name: "Women's Super League", country: 'England', gender: 'women' },
    { id: 142, name: 'Liga F', country: 'Spain', gender: 'women' },
    { id: 139, name: "Serie A Women", country: 'Italy', gender: 'women' },
    { id: 183, name: "Frauen-Bundesliga", country: 'Germany', gender: 'women' },
    { id: 168, name: "Division 1 Feminine", country: 'France', gender: 'women' },
    { id: 244, name: 'Kansallinen Liiga', country: 'Finland', gender: 'women' },
    { id: 114, name: 'Damallsvenskan', country: 'Sweden', gender: 'women' },
    { id: 220, name: 'Toppserien', country: 'Norway', gender: 'women' },
    { id: 2, name: 'Champions League', country: 'Europe', gender: 'men' },
    { id: 1, name: 'World Cup' },
    { id: 4, name: 'Euro Championship' },
    { id: 10, name: 'Friendlies' },
    { id: 11, name: 'UEFA Nations League' },
    { id: 32, name: 'World Cup - Qualification Europe' },
    { id: 34, name: 'Euro Championship - Qualification' }
  ];
  readonly defaultLeagueIds: number[] = [39, 140, 135, 78, 61, 2, 1, 4, 10, 11, 32, 34];
  private readonly leagueOrder = new Map<number, number>(this.leagueOptions.map((league, index) => [league.id, index]));
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
          map(({ matches, failedCount, failedStatuses }) => {
            if (failedCount > 0 && matches.length === 0) {
              return {
                loading: false,
                error: this.mapPartialFailureMessage(failedStatuses),
                matches
              };
            }

            return {
              loading: false,
              error: null,
              matches
            };
          }),
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
      leagueOptions: this.leagueOptions,
      defaultLeagueIds: this.defaultLeagueIds
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
      return of({ matches: cached, failedCount: 0, failedStatuses: [] });
    }

    const requests = sortedLeagueIds.map((leagueId) =>
      this.api.getFixturesByDateAndLeague(dateIso, leagueId).pipe(
        map((response) => ({ response, failed: false, status: 0 })),
        catchError((error: unknown) =>
          of({
            response: null,
            failed: true,
            status: error instanceof HttpErrorResponse ? error.status : 0
          })
        )
      )
    );

    return forkJoin(requests).pipe(
      map((results) => {
        const failedCount = results.filter((x) => x.failed).length;
        const failedStatuses = results.filter((x) => x.failed).map((x) => x.status);
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
        return { matches, failedCount, failedStatuses };
      })
    );
  }

  private mapPartialFailureMessage(statuses: number[]): string {
    if (statuses.some((status) => status === 401 || status === 403)) {
      return 'Kirjautumistiedot hylattiin (401/403). Kirjaudu uudelleen APP_GATE_USER ja APP_GATE_PASSWORD -tiedoilla.';
    }

    if (statuses.some((status) => status === 500)) {
      return 'Palvelinvirhe (500). Tarkista Vercel Environment Variables: API_FOOTBALL_KEY, APP_GATE_USER, APP_GATE_PASSWORD.';
    }

    if (statuses.some((status) => status === 429)) {
      return 'API-pyyntoraja tuli vastaan (429). Yrita hetken kuluttua uudelleen.';
    }

    return 'Osa liigoista ei latautunut. Naytetaan saatavilla olevat ottelut.';
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
