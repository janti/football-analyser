import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Match } from '../../../../core/models';
import { MatchCardComponent } from '../match-card/match-card.component';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [MatchCardComponent],
  templateUrl: './matches-list.component.html',
  styleUrl: './matches-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchesListComponent {
  readonly matches = input.required<Match[]>();

  trackByMatchId = (_: number, item: Match): number => item.id;
}
