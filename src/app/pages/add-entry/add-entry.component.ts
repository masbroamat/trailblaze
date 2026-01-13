import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JournalEntryService } from '../../core/services/journal-entry.service';
import { PhotoService } from '../../core/services/photo.service';
import { TripService } from '../../core/services/trip.service';
import { CommonModule } from '@angular/common';
import { Trip, JournalEntry } from '../../core/models/interfaces';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-add-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastComponent, TranslatePipe, ImageUrlPipe],
  templateUrl: './add-entry.component.html',
  styleUrl: './add-entry.component.scss'
})
export class AddEntryComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private journalService = inject(JournalEntryService);
  private photoService = inject(PhotoService);
  private tripService = inject(TripService);
  private toastService = inject(ToastService);

  @ViewChild('contentEditor') contentEditor!: ElementRef<HTMLDivElement>;

  tripId: number;
  trip: Trip | null = null;
  existingEntries: JournalEntry[] = [];
  entryForm: FormGroup;

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  coverPhotoIndex: number | null = null;

  isSubmitting = false;
  errorMessage = '';
  isDragging = false;

  @ViewChild('timelineContainer') timelineContainer!: ElementRef<HTMLDivElement>;

  isBold = false;
  isItalic = false;
  isUnderline = false;
  isList = false;
  isQuote = false;

  constructor() {
    this.tripId = Number(this.route.snapshot.paramMap.get('tripId'));

    this.entryForm = this.fb.group({
      dayNumber: ['', [Validators.required, Validators.min(1)]],
      title: ['', Validators.required],
      locationLabel: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    document.addEventListener('selectionchange', () => this.updateFormatState());
  }

  updateFormatState(): void {
    this.isBold = document.queryCommandState('bold');
    this.isItalic = document.queryCommandState('italic');
    this.isUnderline = document.queryCommandState('underline');
    this.isList = document.queryCommandState('insertUnorderedList');
    this.isQuote = this.isInsideBlockquote();
  }

  private isInsideBlockquote(): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node: Node | null = selection.anchorNode;
    while (node && node !== this.contentEditor?.nativeElement) {
      if (node.nodeName === 'BLOCKQUOTE') return true;
      node = node.parentNode;
    }
    return false;
  }

  private getParentBlockquote(): HTMLElement | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    let node: Node | null = selection.anchorNode;
    while (node && node !== this.contentEditor?.nativeElement) {
      if (node.nodeName === 'BLOCKQUOTE') return node as HTMLElement;
      node = node.parentNode;
    }
    return null;
  }

  formatText(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.contentEditor?.nativeElement.focus();
    this.updateFormatState();
    this.onContentChange();
  }

  toggleBold(): void {
    this.formatText('bold');
  }

  toggleItalic(): void {
    this.formatText('italic');
  }

  toggleUnderline(): void {
    this.formatText('underline');
  }

  toggleBulletList(): void {
    this.formatText('insertUnorderedList');
  }

  toggleQuote(): void {
    const blockquote = this.getParentBlockquote();

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
      this.formatText('formatBlock', 'blockquote');
    }

    this.contentEditor?.nativeElement.focus();
    this.updateFormatState();
    this.onContentChange();
  }

  onContentChange(): void {
    if (this.contentEditor) {
      const content = this.contentEditor.nativeElement.innerHTML;
      this.entryForm.patchValue({ content: content });
      this.entryForm.get('content')?.markAsTouched();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      const blockquote = this.getParentBlockquote();
      if (blockquote) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const text = range.startContainer.textContent || '';

          if (text.trim() === '' || (range.startOffset === text.length && text.endsWith('\n'))) {
            event.preventDefault();

            const newDiv = document.createElement('div');
            newDiv.innerHTML = '<br>';
            blockquote.parentNode?.insertBefore(newDiv, blockquote.nextSibling);

            const newRange = document.createRange();
            newRange.setStart(newDiv, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);

            this.updateFormatState();
            this.onContentChange();
          }
        }
      }
    }

    if (event.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        if (range.startOffset === 0) {
          const blockquote = this.getParentBlockquote();
          if (blockquote) {
            const textContent = blockquote.textContent || '';
            if (textContent.trim() === '') {
              event.preventDefault();
              this.toggleQuote();
            }
          }
        }
      }
    }
  }

  ngOnInit(): void {
    this.loadTripData();
  }

  loadTripData(): void {
    this.tripService.getTripById(this.tripId).subscribe({
      next: (res) => {
        if (res.success) this.trip = res.data;
      }
    });

    this.journalService.getEntriesByTripId(this.tripId).subscribe({
      next: (res) => {
        if (res.success) {
          this.existingEntries = res.data.sort((a, b) => a.dayNumber - b.dayNumber);
          setTimeout(() => this.scrollTimelineToBottom(), 100);
        }
      }
    });
  }

  scrollTimelineToBottom(): void {
    if (this.timelineContainer) {
      this.timelineContainer.nativeElement.scrollTop = this.timelineContainer.nativeElement.scrollHeight;
    }
  }

  setCoverPhoto(index: number): void {
    if (this.coverPhotoIndex === index) {
      this.coverPhotoIndex = null;
      this.toastService.info('Cover removed', 'No cover photo selected');
    } else {
      this.coverPhotoIndex = index;
      this.toastService.success('Cover set', 'This photo will be used as cover');
    }
  }

  isCoverPhoto(index: number): boolean {
    return this.coverPhotoIndex !== null && this.coverPhotoIndex === index;
  }

  onFilesSelected(event: any) {
    if (event.target.files) {
      const files = Array.from(event.target.files) as File[];
      this.addFiles(files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      const files = Array.from(event.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
      );
      this.addFiles(files);
    }
  }

  private addFiles(files: File[]): void {
    this.selectedFiles.push(...files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);

    if (this.coverPhotoIndex !== null) {
      if (index === this.coverPhotoIndex) {
        this.coverPhotoIndex = null;
      } else if (index < this.coverPhotoIndex) {
        this.coverPhotoIndex--;
      }
    }
  }

  onSubmit() {
    if (this.entryForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const entryData = this.entryForm.value;

    this.journalService.createEntry(this.tripId, entryData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const newEntryId = response.data.entryId;

          if (this.selectedFiles.length > 0) {
            this.uploadPhotos(newEntryId);
          } else {
            this.toastService.success('Entry saved', 'Your journal entry has been added!');
            this.goBack();
          }
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to save entry.';
      }
    });
  }

  uploadPhotos(entryId: number) {
    this.photoService.uploadPhotos(entryId, this.selectedFiles).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0 && this.coverPhotoIndex !== null && this.coverPhotoIndex < res.data.length) {
          const coverPhoto = res.data[this.coverPhotoIndex];
          const photoId = coverPhoto.photoId;

          console.log('Setting cover photo:', coverPhoto);
          console.log('Photo ID:', photoId);

          if (photoId) {
            this.photoService.setCoverPhoto(photoId).subscribe({
              next: () => {
                this.toastService.success('Entry saved', 'Your journal entry and cover photo have been set!');
                this.goBack();
              },
              error: (err) => {
                console.error('Set cover photo error:', err);
                this.toastService.success('Entry saved', 'Entry saved! Cover photo setting failed.');
                this.goBack();
              }
            });
          } else {
            console.log('No photoId found on uploaded photo');
            this.toastService.success('Entry saved', 'Your journal entry and photos have been added!');
            this.goBack();
          }
        } else {
          this.toastService.success('Entry saved', 'Your journal entry and photos have been added!');
          this.goBack();
        }
      },
      error: () => {
        this.toastService.info('Entry saved', 'Entry saved, but photos failed to upload.');
        this.goBack();
      }
    });
  }

  goBack() {
    this.router.navigate(['/trips', this.tripId]);
  }

  selectDay(day: number) {
    this.entryForm.patchValue({ dayNumber: day });
  }

  isExistingDay(day: number): boolean {
    return this.existingEntries.some((e) => e.dayNumber === day);
  }

  getEntryForDay(day: number): JournalEntry | undefined {
    return this.existingEntries.find((e) => e.dayNumber === day);
  }
}
