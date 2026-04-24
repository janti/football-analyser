import { Pipe, PipeTransform } from '@angular/core';

import { LocalizationService } from './localization.service';

@Pipe({
  name: 't',
  standalone: true,
  pure: false
})
export class TPipe implements PipeTransform {
  constructor(private readonly localization: LocalizationService) {}

  transform(key: string, params?: Record<string, string | number>): string {
    return this.localization.t(key, params);
  }
}
