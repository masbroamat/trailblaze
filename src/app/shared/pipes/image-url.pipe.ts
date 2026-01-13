import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {

  transform(url: string | null | undefined): string {
    if (!url) {
      return 'placeholder.png';
    }

    if (url.startsWith('http')) {
      try {
        url = decodeURIComponent(url);
      } catch (e) {
      }

      return url;
    }

    return url;
  }
}
