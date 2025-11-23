import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemCountSource = new BehaviorSubject<number>(0);
  cartItemCount$ = this.cartItemCountSource.asObservable();

  constructor() {
    this.initializeCartCount();
  }

  private initializeCartCount() {
    // Aqui pode ser implementada lógica para recuperar do localStorage
    // Por enquanto começa com 0
    this.cartItemCountSource.next(0);
  }

  addItem() {
    const currentCount = this.cartItemCountSource.value;
    this.cartItemCountSource.next(currentCount + 1);
  }

  removeItem() {
    const currentCount = this.cartItemCountSource.value;
    if (currentCount > 0) {
      this.cartItemCountSource.next(currentCount - 1);
    }
  }

  getItemCount(): number {
    return this.cartItemCountSource.value;
  }

  getItemCountFormatted(): string {
    const count = this.cartItemCountSource.value;
    return count < 10 ? `[0${count}]` : `[${count}]`;
  }
}
