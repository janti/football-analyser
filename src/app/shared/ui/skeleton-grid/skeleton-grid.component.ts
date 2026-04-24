import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-grid',
  standalone: true,
  templateUrl: './skeleton-grid.component.html',
  styleUrl: './skeleton-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonGridComponent {
  readonly count = input(6);

  get skeletonItems(): number[] {
    return Array.from({ length: this.count() }, (_, index) => index);
  }
}
