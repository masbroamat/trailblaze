import { effect, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'bm';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  private translateService = inject(TranslateService);
  private readonly LANG_KEY = 'trailblaze_language';

  currentLanguage = signal<Language>(this.getStoredLanguage());

  constructor() {
    effect(() => {
      this.translateService.use(this.currentLanguage());
    });
  }

  private getStoredLanguage(): Language {
    const stored = localStorage.getItem(this.LANG_KEY) as Language;
    return stored || 'en';
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  toggleLanguage(): void {
    const newLang = this.currentLanguage() === 'en' ? 'bm' : 'en';
    this.setLanguage(newLang);
  }

  isEnglish(): boolean {
    return this.currentLanguage() === 'en';
  }
}
