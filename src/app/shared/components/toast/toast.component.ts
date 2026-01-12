import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html'
})
export class ToastComponent {
  toastService = inject(ToastService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  getBorderColor(type: string): string {
    switch (type) {
      case 'success': return 'border-l-primary';
      case 'error': return 'border-l-red-500';
      case 'info': return 'border-l-blue-500';
      default: return 'border-l-primary';
    }
  }

  getIconBg(type: string): string {
    switch (type) {
      case 'success': return 'bg-primary/20 text-primary';
      case 'error': return 'bg-red-100 dark:bg-red-900/30 text-red-500';
      case 'info': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-500';
      default: return 'bg-primary/20 text-primary';
    }
  }
}

