import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="state">
      <h3>{{ title() }}</h3>
      <p>{{ description() }}</p>
    </div>
  `,
  styles: `
    .state {
      border: 1px dashed #334155;
      border-radius: 14px;
      padding: 1rem;
      background: #0f172a;
    }
    h3 {
      margin: 0;
      font-size: 1rem;
    }
    p {
      margin: 0.4rem 0 0;
      color: #94a3b8;
    }
  `
})
export class EmptyStateComponent {
  readonly title = input('Ei dataa');
  readonly description = input('Tahan osioon ei ole viela sisaltoa.');
}
