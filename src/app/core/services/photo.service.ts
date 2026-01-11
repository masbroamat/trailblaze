import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Photo } from '../models/interfaces';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  constructor() { }

  getPhotosByEntryId(entryId: number): Observable<ApiResponse<Photo[]>> {
    return this.http.get<ApiResponse<Photo[]>>(`${this.API_URL}/entries/${entryId}/photos`);
  }

  uploadPhotos(entryId: number, files: File[]): Observable<ApiResponse<any>> {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<ApiResponse<any>>(`${this.API_URL}/entries/${entryId}/photos`, formData);
  }

  deletePhotos(photoId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/photos/${photoId}`);
  }

  setCoverPhoto(photoId: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.API_URL}/photos/${photoId}/cover`, {});
  }
}
