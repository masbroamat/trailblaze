import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, JournalEntry, JournalEntryRequest } from '../models/interfaces';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JournalEntryService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/trips`;

  constructor() { }

  getEntriesByTripId(tripId: number): Observable<ApiResponse<JournalEntry[]>>{
    return this.http.get<ApiResponse<JournalEntry[]>>(`${this.API_URL}/${tripId}/entries`);
  }

  createEntry(tripId: number, payload: JournalEntryRequest): Observable<ApiResponse<JournalEntry>>{
    return this.http.post<ApiResponse<JournalEntry>>(`${this.API_URL}/${tripId}/entries`, payload);
  }

  updateEntry(entryId: number, payload: JournalEntryRequest): Observable<ApiResponse<JournalEntry>>{
    return this.http.put<ApiResponse<JournalEntry>>(`${this.API_URL}/entries/${entryId}`, payload);
  }

  deleteEntry(tripId: number): Observable<ApiResponse<void>>{
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/entries/${tripId}`);
  }
}
