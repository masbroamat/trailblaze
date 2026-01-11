import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentYear = new Date().getFullYear();

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  get loginFormControl() {
    return this.loginForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;

        const backendMsg = err.error?.message || '';

        if (err.status === 400 && err.error?.data?.invalidFields) {
          this.errorMessage = err.error.data.invalidFields[0].message;
        } else if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Invalid username or password.';
        } else if (
          backendMsg.includes('JDBC') ||
          backendMsg.includes('Connection') ||
          backendMsg.includes('ORA-') ||
          err.status === 0 ||
          err.status === 503
        ) {
          this.errorMessage = 'System is currently unavailable. Please try again later.';
        } else {
          this.errorMessage = backendMsg || 'Something went wrong. Please try again.';
        }
      }
    });
  }
}
