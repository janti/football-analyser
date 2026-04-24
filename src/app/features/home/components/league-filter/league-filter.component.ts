import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { LeagueFilterOption } from '../../../../core/models';
import { TPipe } from '../../../../shared/i18n';

@Component({
  selector: 'app-league-filter',
  standalone: true,
  imports: [TPipe],
  templateUrl: './league-filter.component.html',
  styleUrl: './league-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeagueFilterComponent {
  readonly options = input.required<LeagueFilterOption[]>();
  readonly selectedIds = input.required<number[]>();

  readonly toggle = output<number>();
  readonly clearAll = output<void>();
  readonly selectDefaults = output<void>();

  trackByLeagueId = (_: number, item: LeagueFilterOption): number => item.id;
}
