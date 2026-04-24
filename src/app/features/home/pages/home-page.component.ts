import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LocalizationService, TPipe } from '../../../shared/i18n';
import {
  EmptyStateComponent,
  ErrorMessageComponent,
  SkeletonGridComponent,
  SectionHeaderComponent
} from '../../../shared/ui';
import { LeagueFilterComponent } from '../components/league-filter/league-filter.component';
import { MatchesListComponent } from '../components/matches-list/matches-list.component';
import { HomeMatchesFacade } from '../data/home-matches.facade';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    AsyncPipe,
    TPipe,
    SectionHeaderComponent,
    LeagueFilterComponent,
    MatchesListComponent,
    SkeletonGridComponent,
    ErrorMessageComponent,
    EmptyStateComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
  readonly vm$;
  readonly quickDateOffsets = [-3, -2, -1, 0, 1, 2, 3];
  showLeagueDialog = false;

  constructor(
    private readonly homeMatchesFacade: HomeMatchesFacade,
    private readonly localization: LocalizationService
  ) {
    this.vm$ = this.homeMatchesFacade.vm$;
  }

  onToggleLeague(leagueId: number): void {
    this.homeMatchesFacade.toggleLeague(leagueId);
  }

  onClearLeagues(): void {
    this.homeMatchesFacade.setSelectedLeagueIds([]);
  }

  onSelectDefaults(): void {
    this.homeMatchesFacade.setSelectedLeagueIds(this.homeMatchesFacade.defaultLeagueIds);
  }

  openLeagueDialog(): void {
    this.showLeagueDialog = true;
  }

  closeLeagueDialog(): void {
    this.showLeagueDialog = false;
  }

  onQuickDateSelect(dayOffset: number): void {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    this.homeMatchesFacade.setSelectedDate(this.toIsoDate(date));
  }

  onDateInputChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const value = target?.value;
    if (!value) {
      return;
    }
    this.homeMatchesFacade.setSelectedDate(value);
  }

  isSelectedDate(dayOffset: number, selectedDate: string): boolean {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return this.toIsoDate(date) === selectedDate;
  }

  quickDateLabel(dayOffset: number): string {
    if (dayOffset === 0) {
      return this.localization.t('home.today');
    }
    if (dayOffset > 0) {
      return this.localization.t('home.daysAhead', { n: dayOffset });
    }
    return this.localization.t('home.daysBack', { n: Math.abs(dayOffset) });
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
