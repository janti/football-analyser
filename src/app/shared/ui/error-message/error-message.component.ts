import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  template: `
    <div class="error" role="alert">
      <strong>{{ title() }}</strong>
      <p>{{ message() }}</p>
    </div>
  `,
  styles: `
    .error {
      border: 1px solid #7f1d1d;
      border-radius: 12px;
      background: #450a0a;
      padding: 0.8rem 0.9rem;
      color: #fecaca;
    }
    strong {
      display: block;
    }
    p {
      margin: 0.35rem 0 0;
    }
  `
})
export class ErrorMessageComponent {
  readonly title = input('Virhe');
  readonly message = input('Jokin meni pieleen.');
}
