import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../core/services/trip.service';
import { JournalEntryService } from '../../core/services/journal-entry.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { JournalEntry, Trip } from '../../core/models/interfaces';
import { PhotoService } from '../../core/services/photo.service';
import { forkJoin } from 'rxjs';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { environment } from '../../../environments/environment';
import { TranslationService } from '../../core/services/translation.service';
import { ThemeService } from '../../core/services/theme.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, ToastComponent, ConfirmModalComponent, TranslatePipe],
  templateUrl: './trip-detail.component.html',
  styleUrl: './trip-detail.component.scss'
})
export class TripDetailComponent implements OnInit, AfterViewChecked {
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);
  private photoService = inject(PhotoService);
  private journalService = inject(JournalEntryService);
  private sanitizer = inject(DomSanitizer);
  private toastService = inject(ToastService);
  translationService = inject(TranslationService);
  themeService = inject(ThemeService);
  private translateService = inject(TranslateService);

  private readonly BACKEND_URL = `${environment.apiUrl}`.replace('/api', '');

  @ViewChild('editContentEditor') editContentEditor!: ElementRef<HTMLDivElement>;

  trip: Trip | null = null;
  selectedImage: string | null = null;
  entries: JournalEntry[] = [];
  isLoading = true;

  showDeleteModal = false;
  entryToDelete: number | null = null;
  isDeleting = false;

  showEditModal = false;
  editingEntry: JournalEntry | null = null;
  editForm = {
    dayNumber: '',
    title: '',
    locationLabel: '',
    content: ''
  };
  isUpdating = false;
  photosToDelete: string[] = [];

  isEditBold = false;
  isEditItalic = false;
  isEditUnderline = false;
  isEditList = false;
  isEditQuote = false;
  private contentInitialized = false;

  ngOnInit(): void {
    const tripId = Number(this.route.snapshot.paramMap.get('id'));
    if (tripId) {
      this.loadData(tripId);
    }

    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => this.scrollToSection(fragment), 500);
      }
    });

    document.addEventListener('selectionchange', () => this.updateEditFormatState());
  }

  ngAfterViewChecked(): void {
    if (this.showEditModal && this.editContentEditor && !this.contentInitialized) {
      this.editContentEditor.nativeElement.innerHTML = this.editForm.content;
      this.contentInitialized = true;
    }
  }

  updateEditFormatState(): void {
    if (!this.showEditModal) return;
    this.isEditBold = document.queryCommandState('bold');
    this.isEditItalic = document.queryCommandState('italic');
    this.isEditUnderline = document.queryCommandState('underline');
    this.isEditList = document.queryCommandState('insertUnorderedList');
    this.isEditQuote = this.isInsideEditBlockquote();
  }

  private isInsideEditBlockquote(): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node: Node | null = selection.anchorNode;
    while (node && node !== this.editContentEditor?.nativeElement) {
      if (node.nodeName === 'BLOCKQUOTE') return true;
      node = node.parentNode;
    }
    return false;
  }

  private getEditParentBlockquote(): HTMLElement | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    let node: Node | null = selection.anchorNode;
    while (node && node !== this.editContentEditor?.nativeElement) {
      if (node.nodeName === 'BLOCKQUOTE') return node as HTMLElement;
      node = node.parentNode;
    }
    return null;
  }

  formatEditText(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.editContentEditor?.nativeElement.focus();
    this.updateEditFormatState();
    this.onEditContentChange();
  }

  toggleEditBold(): void {
    this.formatEditText('bold');
  }

  toggleEditItalic(): void {
    this.formatEditText('italic');
  }

  toggleEditUnderline(): void {
    this.formatEditText('underline');
  }

  toggleEditBulletList(): void {
    this.formatEditText('insertUnorderedList');
  }

  toggleEditQuote(): void {
    const blockquote = this.getEditParentBlockquote();

    if (blockquote) {
      const content = blockquote.innerHTML;
      const div = document.createElement('div');
      div.innerHTML = content;
      blockquote.parentNode?.replaceChild(div, blockquote);

      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(div);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else {
      this.formatEditText('formatBlock', 'blockquote');
    }

    this.editContentEditor?.nativeElement.focus();
    this.updateEditFormatState();
    this.onEditContentChange();
  }

  onEditContentChange(): void {
    if (this.editContentEditor) {
      this.editForm.content = this.editContentEditor.nativeElement.innerHTML;
    }
  }

  loadData(id: number) {
    this.isLoading = true;

    this.tripService.getTripById(id).subscribe({
      next: (res) => {
        if (res.success) this.trip = res.data;
      }
    });

    this.journalService.getEntriesByTripId(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.entries = res.data.sort((a, b) => a.dayNumber - b.dayNumber);
        }
        this.loadPhotosForEntries();
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  loadPhotosForEntries() {
    if (this.entries.length === 0) {
      this.isLoading = false;
      return;
    }

    const photoRequests = this.entries.map((entry) =>
      this.photoService.getPhotosByEntryId(entry.entryId)
    );

    forkJoin(photoRequests).subscribe({
      next: (responses) => {
        responses.forEach((res, index) => {
          if (res.success) {
            this.entries[index].photos = res.data;
          }
        });
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  getCoverImage(url: string | undefined): SafeStyle {
    if (!url) return this.sanitizer.bypassSecurityTrustStyle('url(placeholder.png)');

    if (url.startsWith('http')) {
      return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
    }

    const parts = url.split('/');
    const filename = parts.pop();
    const path = parts.join('/');
    const encodedFilename = encodeURIComponent(filename || '');
    const finalUrl = `${this.BACKEND_URL}${path}/${encodedFilename}`;

    return this.sanitizer.bypassSecurityTrustStyle(`url('${finalUrl}')`);
  }

  openLightbox(photoUrl: string) {
    this.selectedImage = this.formatUrl(photoUrl);
  }

  closeLightbox() {
    this.selectedImage = null;
  }

  formatUrl(url: string): string {
    if (!url) return '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    const parts = url.split('/');
    const filename = parts.pop();
    const path = parts.join('/');
    const encoded = encodeURIComponent(filename || '');
    return `${this.BACKEND_URL}${path}/${encoded}`;

  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  }

  confirmDeleteEntry(entryId: number) {
    this.entryToDelete = entryId;
    this.showDeleteModal = true;
  }

  deleteEntry() {
    if (!this.entryToDelete) return;

    this.isDeleting = true;
    this.journalService.deleteEntry(this.entryToDelete).subscribe({
      next: () => {
        this.entries = this.entries.filter((e) => e.entryId !== this.entryToDelete);
        this.toastService.success(
          this.translateService.instant('toast.entryDeleted.title'),
          this.translateService.instant('toast.entryDeleted.message')
        );
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.entryToDelete = null;
      },
      error: () => {
        this.toastService.error(
          this.translateService.instant('toast.entryDeleteFailed.title'),
          this.translateService.instant('toast.entryDeleteFailed.message')
        );
        this.isDeleting = false;
        this.showDeleteModal = false;
      }
    });
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.entryToDelete = null;
  }

  getTripDuration(): number {
    if (!this.trip) return 0;
    const start = new Date(this.trip.startDate);
    const end = new Date(this.trip.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  getTotalPhotos(): number {
    return this.entries.reduce((total, entry) => total + (entry.photos?.length || 0), 0);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  shareEntry(entry: JournalEntry): void {
    const entryIndex = this.entries.findIndex(e => e.entryId === entry.entryId);
    const url = `${window.location.origin}/trips/${this.trip?.tripId}#entry-${entryIndex}`;
    const text = `Check out Day ${entry.dayNumber}: ${entry.title} from my ${this.trip?.title} trip on TrailBlaze!`;

    if (navigator.share) {
      navigator.share({
        title: `Day ${entry.dayNumber}: ${entry.title}`,
        text: text,
        url: url
      }).catch(() => {
        this.copyToClipboard(url);
      });
    } else {
      this.copyToClipboard(url);
    }
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.success(
        this.translateService.instant('toast.linkCopied.title'),
        this.translateService.instant('toast.linkCopied.message')
      );
    }).catch(() => {
      this.toastService.error(
        this.translateService.instant('toast.copyFailed.title'),
        this.translateService.instant('toast.copyFailed.message')
      );
    });
  }

  openEditModal(entry: JournalEntry): void {
    this.editingEntry = { ...entry };
    this.editForm = {
      dayNumber: entry.dayNumber.toString(),
      title: entry.title,
      locationLabel: entry.locationLabel || '',
      content: entry.content
    };
    this.photosToDelete = [];
    this.contentInitialized = false;
    this.isEditBold = false;
    this.isEditItalic = false;
    this.isEditUnderline = false;
    this.isEditList = false;
    this.isEditQuote = false;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingEntry = null;
    this.photosToDelete = [];
    this.contentInitialized = false;
  }

  markPhotoForDeletion(photoUrl: string): void {
    if (this.photosToDelete.includes(photoUrl)) {
      this.photosToDelete = this.photosToDelete.filter(url => url !== photoUrl);
    } else {
      this.photosToDelete.push(photoUrl);
    }
  }

  isPhotoMarkedForDeletion(photoUrl: string): boolean {
    return this.photosToDelete.includes(photoUrl);
  }

  saveEntry(): void {
    if (!this.editingEntry) return;

    this.isUpdating = true;

    const photoIdsToDelete = this.editingEntry.photos
      ?.filter(p => this.photosToDelete.includes(p.photoUrl))
      .map(p => p.photoId)
      .filter((id): id is number => id !== undefined && id !== null) || [];

    console.log('Photos to delete (URLs):', this.photosToDelete);
    console.log('Photo IDs to delete:', photoIdsToDelete);
    console.log('Editing entry photos:', this.editingEntry.photos);

    const deletePhotos = (): Promise<any> => {
      if (photoIdsToDelete.length === 0) {
        console.log('No photos to delete');
        return Promise.resolve();
      }
      console.log('Deleting photos with IDs:', photoIdsToDelete);
      const deletePromises = photoIdsToDelete.map(photoId => {
        console.log('Calling delete API for photo ID:', photoId);
        return this.photoService.deletePhotos(photoId).toPromise();
      });
      return Promise.all(deletePromises);
    };

    deletePhotos().then(() => {
      console.log('Photos deleted successfully, now updating entry');
      this.journalService.updateEntry(this.editingEntry!.entryId, this.editForm).subscribe({
        next: (res) => {
          if (res.success) {
            const index = this.entries.findIndex(e => e.entryId === this.editingEntry!.entryId);
            if (index !== -1) {
              this.entries[index] = {
                ...this.entries[index],
                ...res.data,
                photos: this.entries[index].photos?.filter(p => !this.photosToDelete.includes(p.photoUrl))
              };
              this.entries.sort((a, b) => a.dayNumber - b.dayNumber);
            }
            this.toastService.success(
              this.translateService.instant('toast.entryUpdated.title'),
              this.translateService.instant('toast.entryUpdated.message')
            );
            this.closeEditModal();
          }
          this.isUpdating = false;
        },
        error: () => {
          this.toastService.error(
            this.translateService.instant('toast.entryUpdateFailed.title'),
            this.translateService.instant('toast.entryUpdateFailed.message')
          );
          this.isUpdating = false;
        }
      });
    }).catch((err) => {
      console.error('Delete photos error:', err);
      this.toastService.error(
        this.translateService.instant('toast.photoDeleteFailed.title'),
        this.translateService.instant('toast.photoDeleteFailed.message')
      );
      this.isUpdating = false;
    });
  }
}
