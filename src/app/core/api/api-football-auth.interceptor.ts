import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { APP_ENVIRONMENT } from '../config/app-environment';

export const apiFootballAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(APP_ENVIRONMENT);
  const auth = inject(AuthService);
  const router = inject(Router);

  const isProxyMode = env.apiFootballBaseUrl === '/api/football';
  const isProxyRequest = isProxyMode
    ? req.url.startsWith('/api/football') || req.url.includes('/api/football/')
    : req.url.startsWith(env.apiFootballBaseUrl);

  if (!isProxyRequest && !env.apiFootballBaseUrl.includes('api-sports.io')) {
    return next(req);
  }

  const isDirectApiMode = env.apiFootballBaseUrl.includes('api-sports.io');
  if (isDirectApiMode) {
    // Never send x-app-password directly to API-Football (CORS preflight will fail).
    if (!env.apiFootballKey) {
      return next(req);
    }

    return next(
      req.clone({
        setHeaders: {
          'x-apisports-key': env.apiFootballKey
        }
      })
    );
  }

  // Proxy mode (Vercel): protect proxy with app password.
  const appUser = auth.username();
  const appPassword = auth.appPassword();
  if (!appUser || !appPassword) {
    return next(req);
  }

  const proxiedReq = req.clone({
    setHeaders: {
      'x-app-user': appUser,
      'x-app-password': appPassword
    }
  });

  return next(proxiedReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
