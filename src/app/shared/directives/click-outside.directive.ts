import { Directive, ElementRef, EventEmitter, HostListener, inject, Output } from '@angular/core';

@Directive({
  selector: '[clickOutside]'
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  private elementRef = inject(ElementRef)

  constructor() {}

  @HostListener('document:click', ['$event.target'])
  onClick(target: EventTarget | null): void {
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
