import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { TPipe } from '../../../shared/i18n';
import { EmptyStateComponent, ErrorMessageComponent, LoadingSpinnerComponent, SectionHeaderComponent } from '../../../shared/ui';
import { PlayerDetailsVm } from '../data/player-details.models';
import { PlayerDetailsService } from '../data/player-details.service';

interface PlayerPageVm {
  loading: boolean;
  error: string | null;
  data: PlayerDetailsVm | null;
}

@Component({
  selector: 'app-player-details-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink, TPipe, SectionHeaderComponent, LoadingSpinnerComponent, ErrorMessageComponent, EmptyStateComponent],
  templateUrl: './player-details-page.component.html',
  styleUrl: './player-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(PlayerDetailsService);

  readonly vm$ = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    switchMap((playerId) => {
      if (!Number.isFinite(playerId) || playerId <= 0) {
        return of<PlayerPageVm>({ loading: false, error: 'player.invalidId', data: null });
      }

      return this.service.getPlayerDetails(playerId).pipe(
        map((data) => ({ loading: false, error: null, data })),
        startWith({ loading: true, error: null, data: this.emptyData() }),
        catchError(() =>
          of<PlayerPageVm>({ loading: false, error: 'player.loadError', data: null })
        )
      );
    })
  );

  trackByGroup = (_: number, group: { title: string }): string => group.title;
  trackByItem = (_: number, item: { label: string }): string => item.label;

  private emptyData(): PlayerDetailsVm {
    return {
      id: 0,
      name: '-',
      nationality: '-',
      statGroups: []
    };
  }
}
