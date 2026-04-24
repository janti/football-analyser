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
  readonly quickDateOffsets = [0, 1, 2, 3];

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
    this.homeMatchesFacade.setSelectedLeagueIds(this.homeMatchesFacade.leagueOptions.map((x) => x.id));
  }

  onQuickDateSelect(daysBack: number): void {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
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

  isSelectedDate(daysBack: number, selectedDate: string): boolean {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    return this.toIsoDate(date) === selectedDate;
  }

  quickDateLabel(daysBack: number): string {
    if (daysBack === 0) {
      return this.localization.t('home.today');
    }
    return this.localization.t('home.daysBack', { n: daysBack });
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
