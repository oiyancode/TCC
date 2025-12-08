import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageOptimizationService {
  private _supportsWebP: boolean | undefined;

  constructor() {
    this.detectWebPSupport();
  }

  private detectWebPSupport(): void {
    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
      this._supportsWebP =
        elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } else {
      this._supportsWebP = false;
    }
  }

  supportsWebP(): boolean {
    return this._supportsWebP || false;
  }

  getOptimizedImageUrl(
    basePath: string,
    fallbackExtension: string = 'png'
  ): string {
    const extension = this.supportsWebP() ? 'webp' : fallbackExtension;
    return `${basePath}.${extension}`;
  }
}
