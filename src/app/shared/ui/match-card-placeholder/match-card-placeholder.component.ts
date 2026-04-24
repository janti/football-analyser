import { Component } from '@angular/core';

@Component({
  selector: 'app-match-card-placeholder',
  standalone: true,
  template: `
    <article class="card">
      <div class="meta shimmer"></div>
      <div class="row">
        <span class="name shimmer"></span>
        <span class="score shimmer"></span>
      </div>
      <div class="row">
        <span class="name shimmer"></span>
        <span class="score shimmer"></span>
      </div>
    </article>
  `,
  styles: `
    .card {
      border: 1px solid #1f2937;
      border-radius: 14px;
      padding: 0.9rem;
      background: #111827;
      display: grid;
      gap: 0.6rem;
    }
    .meta {
      width: 55%;
      height: 12px;
      border-radius: 8px;
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .name {
      width: 68%;
      height: 14px;
      border-radius: 8px;
    }
    .score {
      width: 26px;
      height: 14px;
      border-radius: 8px;
    }
    .shimmer {
      background: linear-gradient(90deg, #1f2937 25%, #334155 50%, #1f2937 75%);
      background-size: 200% 100%;
      animation: shimmer 1.25s infinite;
    }
    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `
})
export class MatchCardPlaceholderComponent {}
