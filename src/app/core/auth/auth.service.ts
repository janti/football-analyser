import { Injectable, signal } from '@angular/core';

const AUTH_STORAGE_KEY = 'football-analyser-authenticated';
const USER_STORAGE_KEY = 'football-analyser-user';
const APP_PASSWORD_STORAGE_KEY = 'football-analyser-app-password';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal<boolean>(this.readAuthState());
  readonly username = signal<string>(this.readUsername());
  readonly appPassword = signal<string>(this.readAppPassword());

  login(username: string, password: string): boolean {
    // Lightweight demo auth for hosted previews (not secure).
    if (username.trim().length < 2 || password.trim().length < 4) {
      return false;
    }

    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    sessionStorage.setItem(USER_STORAGE_KEY, username.trim());
    sessionStorage.setItem(APP_PASSWORD_STORAGE_KEY, password.trim());
    this.isAuthenticated.set(true);
    this.username.set(username.trim());
    this.appPassword.set(password.trim());
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(APP_PASSWORD_STORAGE_KEY);
    this.isAuthenticated.set(false);
    this.username.set('');
    this.appPassword.set('');
  }

  private readAuthState(): boolean {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  }

  private readUsername(): string {
    return sessionStorage.getItem(USER_STORAGE_KEY) ?? '';
  }

  private readAppPassword(): string {
    return sessionStorage.getItem(APP_PASSWORD_STORAGE_KEY) ?? '';
  }
}
