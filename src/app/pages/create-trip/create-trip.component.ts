import { CommonModule } from '@angular/common';
import { TripService } from './../../core/services/trip.service';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { TranslatePipe } from '@ngx-translate/core';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-create-trip',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, NavbarComponent, ToastComponent, ClickOutsideDirective, TranslatePipe, ImageUrlPipe],
  templateUrl: './create-trip.component.html',
  styleUrl: './create-trip.component.scss'
})
export class CreateTripComponent {
  private fb = inject(FormBuilder);
  private tripService = inject(TripService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  tripForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    location: ['', [Validators.required]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    isPublic: [0, [Validators.required]],
  });

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isDragging = false;

  isSubmitting = false;
  errorMessage = '';

  showStartDatePicker = false;
  showEndDatePicker = false;
  startDateCalendarMonth: Date = new Date();
  endDateCalendarMonth: Date = new Date();

  get calendarDaysStart(): (number | null)[] {
    return this.getCalendarDays(this.startDateCalendarMonth);
  }

  get calendarDaysEnd(): (number | null)[] {
    return this.getCalendarDays(this.endDateCalendarMonth);
  }

  getCalendarDays(monthDate: Date): (number | null)[] {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }

  getMonthYearString(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  prevMonth(type: 'start' | 'end'): void {
    if (type === 'start') {
      this.startDateCalendarMonth = new Date(this.startDateCalendarMonth.getFullYear(), this.startDateCalendarMonth.getMonth() - 1, 1);
    } else {
      this.endDateCalendarMonth = new Date(this.endDateCalendarMonth.getFullYear(), this.endDateCalendarMonth.getMonth() - 1, 1);
    }
  }

  nextMonth(type: 'start' | 'end'): void {
    if (type === 'start') {
      this.startDateCalendarMonth = new Date(this.startDateCalendarMonth.getFullYear(), this.startDateCalendarMonth.getMonth() + 1, 1);
    } else {
      this.endDateCalendarMonth = new Date(this.endDateCalendarMonth.getFullYear(), this.endDateCalendarMonth.getMonth() + 1, 1);
    }
  }

  selectDate(day: number, type: 'start' | 'end'): void {
    const calendarMonth = type === 'start' ? this.startDateCalendarMonth : this.endDateCalendarMonth;
    const year = calendarMonth.getFullYear();
    const month = String(calendarMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formattedDate = `${year}-${month}-${dayStr}`;

    if (type === 'start') {
      this.tripForm.patchValue({ startDate: formattedDate });
      this.showStartDatePicker = false;
    } else {
      this.tripForm.patchValue({ endDate: formattedDate });
      this.showEndDatePicker = false;
    }
  }

  isSelectedDate(day: number, type: 'start' | 'end'): boolean {
    const value = type === 'start' ? this.tripForm.get('startDate')?.value : this.tripForm.get('endDate')?.value;
    if (!value || !day) return false;

    const calendarMonth = type === 'start' ? this.startDateCalendarMonth : this.endDateCalendarMonth;
    const selectedDate = new Date(value);
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === calendarMonth.getMonth() &&
           selectedDate.getFullYear() === calendarMonth.getFullYear();
  }

  isToday(day: number, type: 'start' | 'end'): boolean {
    const today = new Date();
    const calendarMonth = type === 'start' ? this.startDateCalendarMonth : this.endDateCalendarMonth;
    return today.getDate() === day &&
           today.getMonth() === calendarMonth.getMonth() &&
           today.getFullYear() === calendarMonth.getFullYear();
  }

  formatDisplayDate(dateStr: string): string {
    if (!dateStr) return 'Select date';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  toggleStartDatePicker(): void {
    this.showStartDatePicker = !this.showStartDatePicker;
    this.showEndDatePicker = false;
  }

  toggleEndDatePicker(): void {
    this.showEndDatePicker = !this.showEndDatePicker;
    this.showStartDatePicker = false;
  }

  closeStartDatePicker(): void {
    this.showStartDatePicker = false;
  }

  closeEndDatePicker(): void {
    this.showEndDatePicker = false;
  }

  showVisibilityDropdown = false;

  visibilityOptions = [
    { value: 0, label: 'createTrip.visibilityPrivate', icon: 'lock' },
    { value: 1, label: 'createTrip.visibilityPublic', icon: 'public' }
  ];

  toggleVisibilityDropdown(): void {
    this.showVisibilityDropdown = !this.showVisibilityDropdown;
    this.showStartDatePicker = false;
    this.showEndDatePicker = false;
  }

  closeVisibilityDropdown(): void {
    this.showVisibilityDropdown = false;
  }

  selectVisibility(value: number): void {
    this.tripForm.patchValue({ isPublic: value });
    this.showVisibilityDropdown = false;
  }

  getSelectedVisibility(): { value: number; label: string; icon: string } {
    const value = this.tripForm.get('isPublic')?.value ?? 0;
    return this.visibilityOptions.find(o => o.value === value) || this.visibilityOptions[0];
  }

  get tripFormControl() {
    return this.tripForm.controls;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.processFile(file);
    }
  }

  processFile(file: File) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit() {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = this.tripForm.value;
    this.tripService.createTrip(payload).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const newTripId = response.data.tripId;

          if (this.selectedFile) {
            this.uploadImageAndRedirect(newTripId);
          } else {
            this.toastService.success('Trip created', 'Your new journey has been added!');
            this.router.navigate(['/dashboard']);
          }
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to create trip. Please try again.';
      }
    });
  }

  uploadImageAndRedirect(tripId: number) {
    if (!this.selectedFile) return;

    this.tripService.uploadCoverImage(tripId, this.selectedFile).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Trip created', 'Your new journey has been added!');
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.toastService.info('Trip created', 'Trip saved, but image upload failed.');
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
