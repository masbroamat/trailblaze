import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';

  public isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  private http = inject(HttpClient);

  constructor() { }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  register(userData: RegisterRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/register`, userData);
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data.token) {
          localStorage.setItem(this.TOKEN_KEY, response.data.token);
          localStorage.setItem("auth_userId", response.data.userId.toString());
          localStorage.setItem("auth_username", response.data.username);
          localStorage.setItem("auth_fullName", response.data.fullName);
          if (response.data.profilePicUrl) {
            localStorage.setItem("auth_profileImageUrl", response.data.profilePicUrl);
          }
          this.isLoggedIn$.next(true);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem("auth_userId");
    localStorage.removeItem("auth_username");
    localStorage.removeItem("auth_fullName");
    localStorage.removeItem("auth_profileImageUrl");
    this.isLoggedIn$.next(false);
  }

  getUserId(): number | null {
    const id = localStorage.getItem("auth_userId");
    return id ? parseInt(id, 10) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
