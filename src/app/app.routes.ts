import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page.component').then(
        (m) => m.LoginPageComponent
      )
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/pages/home-page.component').then(
        (m) => m.HomePageComponent
      )
  },
  {
    path: 'matches/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/matches/pages/match-details-page.component').then(
        (m) => m.MatchDetailsPageComponent
      )
  },
  {
    path: 'players/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/players/pages/player-details-page.component').then(
        (m) => m.PlayerDetailsPageComponent
      )
  },
  {
    path: 'teams/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/teams/pages/team-details-page.component').then(
        (m) => m.TeamDetailsPageComponent
      )
  },
  {
    path: 'standings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/standings/pages/standings-page.component').then(
        (m) => m.StandingsPageComponent
      )
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/search/pages/search-page.component').then(
        (m) => m.SearchPageComponent
      )
  },
  { path: '**', redirectTo: '' }
];
