export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  fullName: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Trip {
  tripId: number;
  title: string;
  location: string;
  coverPhotoUrl?: string;
  startDate: string;
  endDate: string;
  isPublic: number;
  createdAt?: string;
  userId?: number;
}

export interface CreateTripRequest {
  title: string;
  location: string;
  coverPhotoUrl: string;
  startDate: string;
  endDate: string;
  isPublic: number;
}

export interface JournalEntry {
  entryId: number;
  dayNumber: number;
  title: string;
  content: string;
  locationLabel?: string;
  tripId?: number;
  photos?: Photo[];
}

export interface JournalEntryRequest {
  dayNumber: string;
  title: string;
  content: string;
  locationLabel?: string;
}

export interface Photo {
  photoId?: number;
  photoUrl: string;
  isCover: number;
  caption?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
