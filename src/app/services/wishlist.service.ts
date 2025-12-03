import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private readonly WISHLIST_KEY = 'user_wishlist';
  private wishlistSubject = new BehaviorSubject<number[]>(this.getWishlistFromStorage());

  constructor() { }

  getWishlist(): Observable<number[]> {
    return this.wishlistSubject.asObservable();
  }

  addToWishlist(productId: number): void {
    const currentWishlist = this.wishlistSubject.value;
    if (!currentWishlist.includes(productId)) {
      const updatedWishlist = [...currentWishlist, productId];
      this.updateWishlist(updatedWishlist);
    }
  }

  removeFromWishlist(productId: number): void {
    const currentWishlist = this.wishlistSubject.value;
    const updatedWishlist = currentWishlist.filter(id => id !== productId);
    this.updateWishlist(updatedWishlist);
  }

  toggleWishlist(productId: number): Observable<boolean> {
    const currentWishlist = this.wishlistSubject.value;
    const isInWishlist = currentWishlist.includes(productId);

    if (isInWishlist) {
      this.removeFromWishlist(productId);
    } else {
      this.addToWishlist(productId);
    }
    return of(!isInWishlist);
  }

  isInWishlist(productId: number): Observable<boolean> {
    return of(this.wishlistSubject.value.includes(productId));
  }

  private getWishlistFromStorage(): number[] {
    const wishlistJson = localStorage.getItem(this.WISHLIST_KEY);
    return wishlistJson ? JSON.parse(wishlistJson) : [];
  }

  private updateWishlist(wishlist: number[]): void {
    localStorage.setItem(this.WISHLIST_KEY, JSON.stringify(wishlist));
    this.wishlistSubject.next(wishlist);
  }
}
