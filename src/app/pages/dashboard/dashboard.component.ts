import { Router, RouterLink } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../core/services/trip.service';
import { AuthService } from './../../core/services/auth.service';
import { Trip } from '../../core/models/interfaces';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { environment } from '../../../environments/environment';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, ToastComponent, ConfirmModalComponent, ClickOutsideDirective, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private tripService = inject(TripService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private translateService = inject(TranslateService);

  private readonly BACKEND_URL = `${environment.apiUrl}`.replace("/api", "");

  trips: Trip[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';

  showYearDropdown = false;
  showSortDropdown = false;
  selectedYear: string | null = null;
  sortBy = 'newest';

  showDeleteModal = false;
  tripToDelete: number | null = null;
  isDeleting = false;

  years = Array.from({ length: 7 }, (_, i) =>
    String(new Date().getFullYear() - i)
  );

  username: string | null = 'explorer';

  ngOnInit() {
    this.loadTrips();
    this.username = localStorage.getItem("auth_username");
  }

  loadTrips() {
    this.tripService.getTrips(this.searchQuery, this.selectedYear || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.trips = response.data;
          this.sortTrips();
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load trips.';
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.loadTrips();
  }

  onSearchChange() {
    if (this.searchQuery.length === 0) {
      this.loadTrips();
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.loadTrips();
  }

  selectYear(year: string | null) {
    this.selectedYear = this.selectedYear === year ? null : year;
    this.showYearDropdown = false;
    this.loadTrips();
  }

  selectSort(sort: string) {
    this.sortBy = sort;
    this.showSortDropdown = false;
    this.sortTrips();
  }

  closeYearDropdown(): void {
    this.showYearDropdown = false;
  }

  closeSortDropdown(): void {
    this.showSortDropdown = false;
  }

  sortTrips() {
    switch (this.sortBy) {
      case 'newest':
        this.trips.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        break;
      case 'oldest':
        this.trips.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        break;
      case 'title-asc':
        this.trips.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        this.trips.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'location':
        this.trips.sort((a, b) => a.location.localeCompare(b.location));
        break;
    }
  }

  getCoverImage(url: string | undefined): string {
    if (!url) return 'url(placeholder.png)';

    if (url.startsWith('http')) {
      return `url('${url}')`;
    }

    return `url('${this.BACKEND_URL}${url}')`;
  }

  formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  }

  confirmDeleteTrip(event: Event, tripId: number) {
    event.stopPropagation();
    this.tripToDelete = tripId;
    this.showDeleteModal = true;
  }

  deleteTrip() {
    if (!this.tripToDelete) return;

    this.isDeleting = true;
    this.tripService.deleteTrip(this.tripToDelete).subscribe({
      next: () => {
        this.trips = this.trips.filter(t => t.tripId !== this.tripToDelete);
        this.toastService.success(
          this.translateService.instant('toast.tripDeleted.title'),
          this.translateService.instant('toast.tripDeleted.message')
        );
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.tripToDelete = null;
      },
      error: () => {
        this.toastService.error(
          this.translateService.instant('toast.deleteFailed.title'),
          this.translateService.instant('toast.deleteFailed.message')
        );
        this.isDeleting = false;
        this.showDeleteModal = false;
      }
    });
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.tripToDelete = null;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
