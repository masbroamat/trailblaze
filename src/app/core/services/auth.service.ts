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
    return !!sessionStorage.getItem(this.TOKEN_KEY);
  }

  register(userData: RegisterRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/register`, userData);
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data.token) {
          sessionStorage.setItem(this.TOKEN_KEY, response.data.token);
          sessionStorage.setItem("auth_username", response.data.username);
          sessionStorage.setItem("auth_fullName", response.data.fullName);
          this.isLoggedIn$.next(true);
        }
      })
    );
  }

  logout() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem("auth_username");
    sessionStorage.removeItem("auth_fullName");
    this.isLoggedIn$.next(false);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }
}
