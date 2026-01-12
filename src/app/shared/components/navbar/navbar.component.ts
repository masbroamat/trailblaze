import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, ClickOutsideDirective, TranslatePipe],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  @Input() showCreateTrip = true;
  @Input() currentPage: 'dashboard' | 'journals' | 'profile' | 'other' = 'dashboard';

  themeService = inject(ThemeService);
  translateService = inject(TranslationService);
  authService = inject(AuthService);
  router = inject(Router);

  showUserMenu = false;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.translateService.toggleLanguage();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  scrollToJournals(): void {
    if (!this.router.url.includes('/dashboard')) {
      this.router.navigate(['/dashboard']).then(() => {
        setTimeout(() => this.doScroll(), 100);
      });
    } else {
      this.doScroll();
    }
  }

  private doScroll(): void {
    const searchSection = document.querySelector('.sticky.top-20');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}

