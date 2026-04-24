import { InjectionToken, Provider } from '@angular/core';

export interface AppEnvironment {
  production: boolean;
  apiFootballBaseUrl: string;
  apiFootballKey: string;
}

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT');

export function provideAppEnvironment(environment: AppEnvironment): Provider {
  return {
    provide: APP_ENVIRONMENT,
    useValue: environment
  };
}
