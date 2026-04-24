import { MonoTypeOperatorFunction, retry, timer } from 'rxjs';

export function withRetryBackoff<T>(count = 1, delayMs = 500): MonoTypeOperatorFunction<T> {
  return retry({
    count,
    delay: (_error, retryIndex) => timer(delayMs * retryIndex)
  });
}
