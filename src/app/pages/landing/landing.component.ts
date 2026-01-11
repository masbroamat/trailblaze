import { Component, inject } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, FooterComponent, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

  themeService = inject(ThemeService);
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  destinations = [
    {
      image: '/kyoto-traditional.png',
      title: 'Kyoto Traditional',
      location: 'Japan',
      entries: 12,
      category: 'Architecture'
    },
    {
      image: '/santorini-blue.png',
      title: 'Santorini Blue',
      location: 'Greece',
      entries: 8,
      category: 'Scenery'
    },
    {
      image: '/melbourne-brews.png',
      title: 'Melbourne Brews',
      location: 'Australia',
      entries: 15,
      category: 'Food & Drink'
    }
  ];

  journals = [
    {
      image: 'vik-iceland.png',
      date: 'Nov 12, 2023',
      location: 'Vik, Iceland',
      title: 'Silence on the South Coast: A mossy expedition.',
      excerpt: 'The wind here speaks a different language. Standing amidst the vast green moss fields of Eldhraun, time seems to pause...'
    },
    {
      image: 'ubud-bali.png',
      date: 'Sep 14, 2023',
      location: 'Ubud, Bali',
      title: 'Green Infinite: Getting lost in Tegalalang.',
      excerpt: 'Morning mist still clung to the palm fronds as we descended into the valley. The layers of rice paddies looked like giant steps for gods...'
    }
  ];
}
