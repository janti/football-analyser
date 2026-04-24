import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { TPipe } from '../../../shared/i18n';
import { EmptyStateComponent, ErrorMessageComponent, LoadingSpinnerComponent, SectionHeaderComponent } from '../../../shared/ui';
import { TeamDetailsVm } from '../data/team-details.models';
import { TeamDetailsService } from '../data/team-details.service';
import { TeamDetailsTab } from '../data/team-details.models';

interface TeamPageVm {
  loading: boolean;
  error: string | null;
  data: TeamDetailsVm | null;
}

@Component({
  selector: 'app-team-details-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink, DatePipe, TPipe, SectionHeaderComponent, LoadingSpinnerComponent, ErrorMessageComponent, EmptyStateComponent],
  templateUrl: './team-details-page.component.html',
  styleUrl: './team-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TeamDetailsService);

  readonly tabs: Array<{ key: TeamDetailsTab; label: string }> = [
    { key: 'overview', label: 'team.tabs.overview' },
    { key: 'squad', label: 'team.tabs.squad' },
    { key: 'recent', label: 'team.tabs.recent' },
    { key: 'standings', label: 'team.tabs.standings' }
  ];

  activeTab: TeamDetailsTab = 'overview';

  readonly vm$ = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    switchMap((teamId) => {
      if (!Number.isFinite(teamId) || teamId <= 0) {
        return of<TeamPageVm>({ loading: false, error: 'team.invalidId', data: null });
      }

      return this.service.getTeamDetails(teamId).pipe(
        map((data) => ({ loading: false, error: null, data })),
        startWith({ loading: true, error: null, data: this.emptyData() }),
        catchError(() =>
          of<TeamPageVm>({ loading: false, error: 'team.loadError', data: null })
        )
      );
    })
  );

  setTab(tab: TeamDetailsTab): void {
    this.activeTab = tab;
  }

  trackByTab = (_: number, t: { key: TeamDetailsTab }): TeamDetailsTab => t.key;
  trackByPlayer = (_: number, p: { id: number }): number => p.id;
  trackByMatch = (_: number, m: { id: number }): number => m.id;
  trackByStanding = (_: number, row: { team: { id: number } }): number => row.team.id;

  private emptyData(): TeamDetailsVm {
    return {
      id: 0,
      name: '-',
      country: '-',
      squad: [],
      recentMatches: [],
      standingsRows: []
    };
  }
}
