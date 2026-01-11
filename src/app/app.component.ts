import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import {
    TranslateService,
    TranslatePipe,
    TranslateDirective
} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'trailblaze';

  private themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.currentTheme();
  }

  private translate = inject(TranslateService);

  constructor() {
      this.translate.addLangs(['bm', 'en']);
      this.translate.setFallbackLang('en');
      this.translate.use('en');
  }
}
