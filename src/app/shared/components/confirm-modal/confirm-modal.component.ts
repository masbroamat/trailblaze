import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html'
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() isLoading = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    if (this.isLoading) return;
    this.confirmed.emit();
  }

  onCancel(): void {
    if (this.isLoading) return;
    this.cancelled.emit();
  }

  getIcon(): string {
    switch (this.type) {
      case 'danger': return 'delete_forever';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'delete_forever';
    }
  }

  getIconStyles(): string {
    switch (this.type) {
      case 'danger': return 'bg-red-50 dark:bg-red-900/20 text-red-500';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500';
      case 'info': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-500';
      default: return 'bg-red-50 dark:bg-red-900/20 text-red-500';
    }
  }

  getConfirmStyles(): string {
    switch (this.type) {
      case 'danger': return 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40';
      case 'warning': return 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40';
      case 'info': return 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40';
      default: return 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40';
    }
  }
}

