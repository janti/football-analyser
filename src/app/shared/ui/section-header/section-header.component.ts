import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  template: `
    <div class="header">
      <h2>{{ title() }}</h2>
      @if (subtitle()) {
        <p>{{ subtitle() }}</p>
      }
    </div>
  `,
  styles: `
    .header {
      display: grid;
      gap: 0.2rem;
    }
    h2 {
      margin: 0;
      color: #f8fafc;
    }
    p {
      margin: 0;
      color: #94a3b8;
    }
  `
})
export class SectionHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
