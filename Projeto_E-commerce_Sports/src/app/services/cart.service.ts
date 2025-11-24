import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  size?: string;
  shoeSize?: number;
  imageSrc: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemCountSource = new BehaviorSubject<number>(0);
  cartItemCount$ = this.cartItemCountSource.asObservable();

  private cartItemsSource = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSource.asObservable();

  private readonly STORAGE_KEY = 'bluehouse_cart';

  constructor() {
    this.initializeCart();
  }

  private initializeCart() {
    this.loadCartFromStorage();
    this.updateCartCount();
  }

  private loadCartFromStorage() {
    try {
      const storedCart = localStorage.getItem(this.STORAGE_KEY);
      if (storedCart) {
        const items = JSON.parse(storedCart) as CartItem[];
        if (Array.isArray(items) && items.length >= 0) {
          this.cartItemsSource.next(items);
        }
      }
    } catch (error) {
      console.warn('Failed to load cart from storage:', error);
      this.cartItemsSource.next([]);
    }
  }

  private saveCartToStorage() {
    try {
      const items = this.cartItemsSource.value;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Failed to save cart to storage:', error);
    }
  }

  private updateCartCount() {
    const items = this.cartItemsSource.value;
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartItemCountSource.next(totalCount);
  }

  // Input validation
  private validateQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity > 0 && quantity <= 999;
  }

  addItem(product: Partial<CartItem>, quantity: number = 1) {
    // Input validation
    if (!product.id || !product.name || !this.validateQuantity(quantity)) {
      console.warn('Invalid product or quantity:', { product, quantity });
      return;
    }

    const currentItems = this.cartItemsSource.value;
    const existingItemIndex = currentItems.findIndex(
      item => 
        item.id === product.id && 
        item.size === product.size && 
        item.shoeSize === product.shoeSize
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      currentItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price || 'R$0,00',
        quantity,
        size: product.size,
        shoeSize: product.shoeSize,
        imageSrc: product.imageSrc || '',
      };
      currentItems.push(newItem);
    }

    this.cartItemsSource.next([...currentItems]);
    this.updateCartCount();
    this.saveCartToStorage();
  }

  removeItem(itemId: number, size?: string, shoeSize?: number) {
    const currentItems = this.cartItemsSource.value;
    const itemIndex = currentItems.findIndex(
      item => 
        item.id === itemId && 
        item.size === size && 
        item.shoeSize === shoeSize
    );

    if (itemIndex >= 0) {
      currentItems.splice(itemIndex, 1);
      this.cartItemsSource.next([...currentItems]);
      this.updateCartCount();
      this.saveCartToStorage();
    }
  }

  updateQuantity(itemId: number, quantity: number, size?: string, shoeSize?: number) {
    if (!this.validateQuantity(quantity)) {
      console.warn('Invalid quantity:', quantity);
      return;
    }

    const currentItems = this.cartItemsSource.value;
    const itemIndex = currentItems.findIndex(
      item => 
        item.id === itemId && 
        item.size === size && 
        item.shoeSize === shoeSize
    );

    if (itemIndex >= 0) {
      if (quantity === 0) {
        this.removeItem(itemId, size, shoeSize);
      } else {
        currentItems[itemIndex].quantity = quantity;
        this.cartItemsSource.next([...currentItems]);
        this.updateCartCount();
        this.saveCartToStorage();
      }
    }
  }

  clearCart() {
    this.cartItemsSource.next([]);
    this.updateCartCount();
    this.saveCartToStorage();
  }

  getItemCount(): number {
    return this.cartItemCountSource.value;
  }

  getItemCountFormatted(): string {
    const count = this.cartItemCountSource.value;
    // Secure formatting to prevent XSS
    return `[${count.toString().padStart(2, '0')}]`;
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSource.value;
  }

  getCartTotal(): number {
    return this.cartItemsSource.value.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
      return total + (price * item.quantity);
    }, 0);
  }

  getCartTotalFormatted(): string {
    const total = this.getCartTotal();
    return `R${total.toFixed(2).replace('.', ',')}`;
  }
}
