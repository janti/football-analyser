import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { TPipe } from '../../../shared/i18n';
import { EmptyStateComponent, ErrorMessageComponent, LoadingSpinnerComponent, SectionHeaderComponent } from '../../../shared/ui';
import { StandingLeagueOption, StandingsVm } from '../data/standings.models';
import { StandingsService } from '../data/standings.service';

@Component({
  selector: 'app-standings-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink, TPipe, SectionHeaderComponent, LoadingSpinnerComponent, ErrorMessageComponent, EmptyStateComponent],
  templateUrl: './standings-page.component.html',
  styleUrl: './standings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandingsPageComponent {
  readonly leagueOptions: StandingLeagueOption[] = [
    { id: 39, name: 'Premier League', country: 'England' },
    { id: 140, name: 'La Liga', country: 'Spain' },
    { id: 135, name: 'Serie A', country: 'Italy' },
    { id: 78, name: 'Bundesliga', country: 'Germany' },
    { id: 61, name: 'Ligue 1', country: 'France' }
  ];

  private readonly selectedLeagueId$ = new BehaviorSubject<number>(39);

  readonly vm$ = this.selectedLeagueId$.pipe(
    switchMap((selectedLeagueId) =>
      this.standingsService.getStandings(selectedLeagueId).pipe(
        map((rows) => this.buildVm(selectedLeagueId, rows, null, false)),
        startWith(this.buildVm(selectedLeagueId, [], null, true)),
        catchError(() =>
          of(this.buildVm(selectedLeagueId, [], 'standings.loadError', false))
        )
      )
    )
  );

  constructor(
    private readonly standingsService: StandingsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    const leagueParam = Number(this.route.snapshot.queryParamMap.get('league'));
    if (this.leagueOptions.some((x) => x.id === leagueParam)) {
      this.selectedLeagueId$.next(leagueParam);
    }
  }

  selectLeague(leagueId: number): void {
    this.selectedLeagueId$.next(leagueId);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { league: leagueId },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  trackByLeague = (_: number, league: StandingLeagueOption): number => league.id;
  trackByRow = (_: number, row: { team: { id: number } }): number => row.team.id;

  private buildVm(selectedLeagueId: number, rows: StandingsVm['rows'], error: string | null, loading: boolean): StandingsVm {
    return {
      loading,
      error,
      rows,
      selectedLeagueId,
      leagueOptions: this.leagueOptions
    };
  }
}
