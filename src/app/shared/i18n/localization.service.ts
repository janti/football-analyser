import { Injectable, signal } from '@angular/core';
import { enTranslations } from './translations.en';
import { fiTranslations } from './translations.fi';
import { Language, TranslationDictionary } from './translations.types';
export type { Language } from './translations.types';

const STORAGE_KEY = 'football-analyser-language';

const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  fi: fiTranslations,
  en: enTranslations
};

@Injectable({ providedIn: 'root' })
export class LocalizationService {
  readonly language = signal<Language>(this.detectInitialLanguage());

  setLanguage(language: Language): void {
    this.language.set(language);
    localStorage.setItem(STORAGE_KEY, language);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const lang = this.language();
    let value = TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(`{{${paramKey}}}`, String(paramValue));
      });
    }
    return value;
  }

  private detectInitialLanguage(): Language {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fi' || stored === 'en') {
      return stored;
    }
    return navigator.language?.toLowerCase().startsWith('fi') ? 'fi' : 'en';
  }
}
