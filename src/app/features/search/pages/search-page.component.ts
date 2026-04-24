import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil
} from 'rxjs';

import { Match, Player, Team } from '../../../core/models';
import { TPipe } from '../../../shared/i18n';
import { EmptyStateComponent, ErrorMessageComponent, LoadingSpinnerComponent, SectionHeaderComponent } from '../../../shared/ui';
import { SearchService } from '../data/search.service';
import { SearchTab, SearchVm } from '../data/search.models';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink, DatePipe, TPipe, SectionHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, ErrorMessageComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPageComponent implements OnDestroy {
  readonly tabs: Array<{ key: SearchTab; label: string }> = [
    { key: 'matches', label: 'search.tab.matches' },
    { key: 'teams', label: 'search.tab.teams' },
    { key: 'players', label: 'search.tab.players' }
  ];

  readonly queryControl = new FormControl('', { nonNullable: true });

  private readonly destroy$ = new Subject<void>();
  private readonly tabSubject = new BehaviorSubject<SearchTab>('matches');
  readonly tab$ = this.tabSubject.asObservable();

  readonly vm$ = combineLatest([
    this.tab$,
    this.queryControl.valueChanges.pipe(startWith(this.queryControl.value), debounceTime(350), distinctUntilChanged())
  ]).pipe(
    switchMap(([tab, query]) => this.buildVm(tab, query))
  );

  constructor(
    private readonly searchService: SearchService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.syncFromQueryParams();

    this.queryControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { q: value || null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: SearchTab): void {
    this.tabSubject.next(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  trackByMatch = (_: number, item: Match): number => item.id;
  trackByTeam = (_: number, item: Team): number => item.id;
  trackByPlayer = (_: number, item: Player): number => item.id;

  private syncFromQueryParams(): void {
    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    const qParam = this.route.snapshot.queryParamMap.get('q') ?? '';

    if (tabParam === 'matches' || tabParam === 'teams' || tabParam === 'players') {
      this.tabSubject.next(tabParam);
    }

    this.queryControl.setValue(qParam, { emitEvent: false });
  }

  private buildVm(tab: SearchTab, rawQuery: string): Observable<SearchVm> {
    const query = rawQuery.trim();
    if (query.length < 2) {
      return of<SearchVm>({
        tab,
        query,
        loading: false,
        error: null,
        matches: [],
        teams: [],
        players: []
      });
    }

    const loadingVm: SearchVm = {
      tab,
      query,
      loading: true,
      error: null,
      matches: [],
      teams: [],
      players: []
    };

    const errorVm: SearchVm = {
      tab,
      query,
      loading: false,
      error: 'search.loadError',
      matches: [],
      teams: [],
      players: []
    };

    if (tab === 'teams') {
      return this.searchService.searchTeams(query).pipe(
        map(
          (teams): SearchVm => ({
            tab,
            query,
            loading: false,
            error: null,
            matches: [],
            teams,
            players: []
          })
        ),
        startWith(loadingVm),
        catchError(() => of(errorVm))
      );
    }

    if (tab === 'players') {
      return this.searchService.searchPlayers(query).pipe(
        map(
          (players): SearchVm => ({
            tab,
            query,
            loading: false,
            error: null,
            matches: [],
            teams: [],
            players
          })
        ),
        startWith(loadingVm),
        catchError(() => of(errorVm))
      );
    }

    return this.searchService.searchMatches(query).pipe(
      map(
        (matches): SearchVm => ({
          tab,
          query,
          loading: false,
          error: null,
          matches,
          teams: [],
          players: []
        })
      ),
      startWith(loadingVm),
      catchError(() => of(errorVm))
    );
  }
}
