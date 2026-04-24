import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { TPipe } from '../../../shared/i18n';
import { EmptyStateComponent, ErrorMessageComponent, LoadingSpinnerComponent, SectionHeaderComponent } from '../../../shared/ui';
import { formatKickoffTime, formatMatchStatus, formatScore } from '../../../shared/utils/match-formatters';
import { MatchDetailsService } from '../data/match-details.service';
import { MatchDetailsTab, MatchDetailsVm, MatchEventVm } from '../data/match-details.models';

interface MatchDetailsPageVm {
  loading: boolean;
  error: string | null;
  empty: boolean;
  details: MatchDetailsVm | null;
}

@Component({
  selector: 'app-match-details-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink, DatePipe, TPipe, SectionHeaderComponent, LoadingSpinnerComponent, ErrorMessageComponent, EmptyStateComponent],
  templateUrl: './match-details-page.component.html',
  styleUrl: './match-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(MatchDetailsService);

  readonly tabs: Array<{ key: MatchDetailsTab; label: string }> = [
    { key: 'overview', label: 'match.tabs.overview' },
    { key: 'lineups', label: 'match.tabs.lineups' },
    { key: 'events', label: 'match.tabs.events' },
    { key: 'stats', label: 'match.tabs.stats' }
  ];

  activeTab: MatchDetailsTab = 'overview';

  constructor() {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (this.isMatchDetailsTab(tab)) {
      this.activeTab = tab;
    }
  }

  readonly vm$ = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    switchMap((matchId) => {
      if (!Number.isFinite(matchId) || matchId <= 0) {
        return of<MatchDetailsPageVm>({
          loading: false,
          error: 'match.invalidId',
          empty: true,
          details: null
        });
      }

      return this.service.getMatchDetails(matchId).pipe(
        map((details) => ({
          loading: false,
          error: null,
          empty: !details,
          details
        })),
        startWith({
          loading: true,
          error: null,
          empty: false,
          details: this.buildEmptyDetails()
        }),
        catchError(() =>
          of<MatchDetailsPageVm>({
            loading: false,
            error: 'match.loadError',
            empty: true,
            details: null
          })
        )
      );
    })
  );

  setTab(tab: MatchDetailsTab): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  trackByTab = (_: number, t: { key: MatchDetailsTab }): MatchDetailsTab => t.key;
  trackByLineup = (_: number, lineup: { teamId: number }): number => lineup.teamId;
  trackByEvent = (_: number, e: { minute: number | null; teamId: number; detail: string }): string =>
    `${e.minute ?? 0}-${e.teamId}-${e.detail}`;
  trackByStat = (_: number, s: { type: string }): string => s.type;
  hasSubstitutionEvents(events: MatchEventVm[]): boolean {
    return events.some((event) => event.type.toLowerCase().includes('subst'));
  }
  goalScorers(events: MatchEventVm[], teamId: number): string[] {
    return events
      .filter((event) => event.teamId === teamId && event.type.toLowerCase().includes('goal'))
      .map((event) => {
        const minute = event.minute ?? 0;
        const extra = event.extra ? `+${event.extra}` : '';
        return `${event.playerName || '-'} ${minute}${extra}'`;
      });
  }
  readonly formatKickoffTime = formatKickoffTime;
  readonly formatMatchStatus = formatMatchStatus;
  readonly formatScore = formatScore;

  private isMatchDetailsTab(value: string | null): value is MatchDetailsTab {
    return value === 'overview' || value === 'lineups' || value === 'events' || value === 'stats';
  }

  private buildEmptyDetails(): MatchDetailsVm {
    return {
      header: {
        fixtureId: 0,
        leagueName: '-',
        leagueCountry: '-',
        date: new Date().toISOString(),
        status: '-',
        minute: null,
        homeTeam: { id: 0, name: '-', score: null },
        awayTeam: { id: 0, name: '-', score: null }
      },
      lineups: [],
      events: [],
      stats: []
    };
  }
}
