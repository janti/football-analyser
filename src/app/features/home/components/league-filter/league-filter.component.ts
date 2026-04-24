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
  readonly defaultLeagueIds = input.required<number[]>();
  readonly selectedIds = input.required<number[]>();

  readonly toggle = output<number>();
  readonly clearAll = output<void>();
  readonly selectDefaults = output<void>();

  trackByLeagueId = (_: number, item: LeagueFilterOption): number => item.id;

  readonly menCountries = ['England', 'Spain', 'Italy', 'Germany', 'France', 'Finland', 'Sweden', 'Norway'];
  readonly womenCountries = ['England', 'Spain', 'Italy', 'Germany', 'France', 'Finland', 'Sweden', 'Norway'];

  leaguesByCountryAndGender(country: string, gender: 'men' | 'women'): LeagueFilterOption[] {
    return this.options().filter((x) => x.country === country && x.gender === gender && !this.defaultLeagueIds().includes(x.id));
  }

  visiblePrimaryLeagues(): LeagueFilterOption[] {
    const visibleIds = new Set<number>([...this.defaultLeagueIds(), ...this.selectedIds()]);
    return this.options().filter((x) => visibleIds.has(x.id));
  }
}
