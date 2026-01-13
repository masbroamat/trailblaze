import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ToastComponent, TranslatePipe, ImageUrlPipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);
  translateService = inject(TranslationService);
  themeService = inject(ThemeService);

  currentTab: 'profile' | 'theme' = 'profile';

  fullName: string = '';
  username: string = '';
  profileImageUrl: string | null = null;

  isEditing = false;
  isLoading = false;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  syncWithSystem = false;

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    this.username = sessionStorage.getItem('auth_username') || '';
    this.fullName = sessionStorage.getItem('auth_fullName') || '';
    const storedImageUrl = sessionStorage.getItem('auth_profileImageUrl');
    this.profileImageUrl = storedImageUrl ? this.profileService.getProfileImageUrl(storedImageUrl) : null;
  }

  setTab(tab: 'profile' | 'theme'): void {
    this.currentTab = tab;
  }

  toggleEdit(): void {
    if (this.isEditing) {
      this.loadUserData();
      this.selectedFile = null;
      this.previewUrl = null;
    }
    this.isEditing = !this.isEditing;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.toastService.error(
          this.translate.instant('toast.invalidFile.title'),
          this.translate.instant('toast.invalidFile.message')
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error(
          this.translate.instant('toast.fileTooLarge.title'),
          this.translate.instant('toast.fileTooLarge.message')
        );
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.toastService.error(
        this.translate.instant('toast.sessionExpired.title'),
        this.translate.instant('toast.sessionExpired.message')
      );
      this.router.navigate(['/login']);
      return;
    }

    if (!this.username.trim() || !this.fullName.trim()) {
      this.toastService.error(
        this.translate.instant('toast.validationError.title'),
        this.translate.instant('toast.validationError.message')
      );
      return;
    }

    this.isLoading = true;

    this.profileService.updateProfile(userId, this.username, this.fullName, this.selectedFile || undefined)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success(
              this.translate.instant('toast.profileUpdated.title'),
              this.translate.instant('toast.profileUpdated.message')
            );
            this.loadUserData();
            this.isEditing = false;
            this.selectedFile = null;
            this.previewUrl = null;
          }
          this.isLoading = false;
        },
        error: (error) => {
          const message = error.error?.message || this.translate.instant('toast.profileUpdateFailed.message');
          this.toastService.error(
            this.translate.instant('toast.profileUpdateFailed.title'),
            message
          );
          this.isLoading = false;
        }
      });
  }

  selectTheme(theme: 'light' | 'dark'): void {
    this.themeService.setTheme(theme);
    this.toastService.success(
      this.translate.instant('toast.themeUpdated.title'),
      this.translate.instant('toast.themeUpdated.message', { theme })
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
