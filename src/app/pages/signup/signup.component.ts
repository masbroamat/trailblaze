import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentYear = new Date().getFullYear();

  signupForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  get signupFormControl() {
    return this.signupForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userData = this.signupForm.value;

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Account created successfully! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (err) => {
        this.isLoading = false;

        const backendMsg = err.error?.message || '';

        if (err.status === 400 && err.error?.data?.invalidFields) {
          this.errorMessage = err.error.data.invalidFields[0].message;
        } else if (err.status === 409) {
          this.errorMessage = 'Username already exists.';
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

