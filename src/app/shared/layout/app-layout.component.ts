import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { LocalizationService, TPipe } from '../i18n';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet, RouterLink, RouterLinkActive, TPipe],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppLayoutComponent {
  private readonly localization = inject(LocalizationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems = [
    { labelKey: 'nav.home', link: '/' },
    { labelKey: 'nav.standings', link: '/standings' },
    { labelKey: 'nav.search', link: '/search' }
  ];

  readonly language = this.localization.language;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isLoginPage$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map(() => this.router.url.startsWith('/login')),
    startWith(this.router.url.startsWith('/login'))
  );

  setLanguage(language: 'fi' | 'en'): void {
    this.localization.setLanguage(language);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
