import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, ClickOutsideDirective, TranslatePipe, ImageUrlPipe],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  @Input() showCreateTrip = true;
  @Input() currentPage: 'dashboard' | 'journals' | 'profile' | 'other' = 'dashboard';

  themeService = inject(ThemeService);
  translateService = inject(TranslationService);
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  router = inject(Router);

  showUserMenu = false;
  showMobileMenu = false;
  profileImageUrl: string | null = null;

  ngOnInit(): void {
    this.loadProfileImage();
  }

  private loadProfileImage(): void {
    const storedImageUrl = localStorage.getItem('auth_profileImageUrl');
    this.profileImageUrl = storedImageUrl ? this.profileService.getProfileImageUrl(storedImageUrl) : null;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.translateService.toggleLanguage();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.showMobileMenu = false;
    }
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    if (this.showMobileMenu) {
      this.showUserMenu = false;
    }
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  scrollToJournals(): void {
    if (this.currentPage === 'journals') {
      return;
    }

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
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }
}
