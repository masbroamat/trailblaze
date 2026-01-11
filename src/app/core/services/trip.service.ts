import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, CreateTripRequest, Trip } from '../models/interfaces';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/trips`;

  constructor() { }

  getTrips(search?: string, year?: string): Observable<ApiResponse<Trip[]>> {
    let params = new HttpParams();
    if(search) params = params.set('search', search);
    if(year) params = params.set('year', year);

    return this.http.get<ApiResponse<Trip[]>>(`${this.API_URL}`, { params });
  }

  getTripById(tripId: number): Observable<ApiResponse<Trip>> {
    return this.http.get<ApiResponse<Trip>>(`${this.API_URL}/${tripId}`);
  }

  createTrip(tripData: CreateTripRequest): Observable<ApiResponse<Trip>> {
    return this.http.post<ApiResponse<Trip>>(`${this.API_URL}`, tripData);
  }

  uploadCoverImage(tripId: number, file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<string>>(`${this.API_URL}/${tripId}/image`, formData);
  }

  deleteTrip(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}
