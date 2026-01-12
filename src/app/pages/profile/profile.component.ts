import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ToastComponent, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  translateService = inject(TranslationService);
  themeService = inject(ThemeService);

  currentTab: 'profile' | 'theme' = 'profile';

  fullName: string | null = 'Explorer';
  username: string | null = 'explorer';

  syncWithSystem = false;

  ngOnInit(){
    this.username = sessionStorage.getItem("auth_username");
    this.fullName = sessionStorage.getItem("auth_fullName");
  }

  setTab(tab: 'profile' | 'theme'): void {
    this.currentTab = tab;
  }

  selectTheme(theme: 'light' | 'dark'): void {
    this.themeService.setTheme(theme);
    this.toastService.success('Theme updated', `Switched to ${theme} mode`);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

