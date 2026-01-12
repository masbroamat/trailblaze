import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ProfileUpdateResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = `${environment.apiUrl}/profile`;
  private readonly BACKEND_URL = `${environment.apiUrl}`.replace('/api', '');

  private http = inject(HttpClient);

  updateProfile(userId: number, username: string, fullName: string, profileImage?: File): Observable<ApiResponse<ProfileUpdateResponse>> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('fullName', fullName);

    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    return this.http.put<ApiResponse<ProfileUpdateResponse>>(`${this.API_URL}/${userId}`, formData).pipe(
      tap(response => {
        if (response.success && response.data) {
          sessionStorage.setItem('auth_username', response.data.username);
          sessionStorage.setItem('auth_fullName', response.data.fullName);
          if (response.data.profilePicUrl) {
            sessionStorage.setItem('auth_profileImageUrl', response.data.profilePicUrl);
          }
        }
      })
    );
  }

  getProfileImageUrl(url: string | null): string {
    if (!url) return '';

    const parts = url.split('/');
    const filename = parts.pop();
    const path = parts.join('/');
    const encodedFilename = encodeURIComponent(filename || '');

    return `${this.BACKEND_URL}${path}/${encodedFilename}`;
  }
}
