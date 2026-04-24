import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Match } from '../../../../core/models';
import { formatKickoffTime, formatMatchStatus, formatScore } from '../../../../shared/utils/match-formatters';

@Component({
  selector: 'app-home-match-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchCardComponent {
  readonly match = input.required<Match>();

  readonly formatKickoffTime = formatKickoffTime;
  readonly formatMatchStatus = formatMatchStatus;
  readonly formatScore = formatScore;
}
