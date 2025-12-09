import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ProductsService, Product } from './products.service';
import { ToastService } from './toast.service';
import { map, switchMap, take } from 'rxjs/operators';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  shoeSize?: number;
  imageSrc: string;
  stock?: number;
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

  constructor(
    private productsService: ProductsService,
    private toastService: ToastService
  ) {
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
        if (Array.isArray(items)) {
          this.cartItemsSource.next(items);
        }
      }
    } catch (error) {
      console.warn('Failed to load cart from storage:', error);
    } finally {
      this.updateCartCount();
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

  private updateCartState() {
    this.updateCartCount();
    this.saveCartToStorage();
  }

  // Input validation
  private validateQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity > 0 && quantity <= 999;
  }

  addItem(product: Partial<CartItem>, quantity: number = 1) {
    if (!this.isValidProduct(product) || !this.validateQuantity(quantity)) {
      this.toastService.error('Produto ou quantidade inválida.');
      return;
    }

    this.productsService
      .getProductById(product.id!)
      .pipe(take(1))
      .subscribe((fullProduct) => {
        if (!fullProduct || fullProduct.stock === undefined) {
          this.toastService.error(
            'Produto não encontrado ou sem informação de estoque.'
          );
          return;
        }

        const currentItems = this.cartItemsSource.value;
        const existingItemIndex = this.findExistingItem(currentItems, product);
        const existingQuantity =
          existingItemIndex >= 0 ? currentItems[existingItemIndex].quantity : 0;
        const requestedQuantity = existingQuantity + quantity;

        if (requestedQuantity > fullProduct.stock) {
          this.toastService.error(
            `Estoque insuficiente para ${product.name}. Disponível: ${fullProduct.stock}`
          );
          return;
        }

        if (existingItemIndex >= 0) {
          currentItems[existingItemIndex].quantity = requestedQuantity;
        } else {
          currentItems.push(
            this.createCartItem(product, quantity, fullProduct.stock)
          );
        }

        this.cartItemsSource.next([...currentItems]);
        this.updateCartState();
        this.toastService.success(`🎉 ${product.name} adicionado ao carrinho!`);
      });
  }

  removeItem(itemId: number, size?: string, shoeSize?: number) {
    const currentItems = this.cartItemsSource.value;
    const itemIndex = currentItems.findIndex(
      (item) =>
        item.id === itemId && item.size === size && item.shoeSize === shoeSize
    );

    if (itemIndex >= 0) {
      currentItems.splice(itemIndex, 1);
      this.cartItemsSource.next([...currentItems]);
      this.updateCartState();
    }
  }

  updateQuantity(
    itemId: number,
    quantity: number,
    size?: string,
    shoeSize?: number
  ) {
    if (quantity === 0) {
      this.removeItem(itemId, size, shoeSize);
      return;
    }

    if (!this.validateQuantity(quantity)) {
      this.toastService.error('Quantidade inválida.');
      return;
    }

    this.productsService
      .getProductById(itemId)
      .pipe(take(1))
      .subscribe((fullProduct) => {
        if (!fullProduct || fullProduct.stock === undefined) {
          this.toastService.error(
            'Produto não encontrado ou sem informação de estoque.'
          );
          return;
        }

        if (quantity > fullProduct.stock) {
          this.toastService.error(
            `Estoque insuficiente para ${fullProduct.name}. Disponível: ${fullProduct.stock}.`
          );
          return;
        }

        const currentItems = this.cartItemsSource.value;
        const itemIndex = currentItems.findIndex(
          (item) =>
            item.id === itemId &&
            item.size === size &&
            item.shoeSize === shoeSize
        );

        if (itemIndex >= 0) {
          currentItems[itemIndex].quantity = quantity;
          this.cartItemsSource.next([...currentItems]);
          this.updateCartState();
        }
      });
  }

  clearCart() {
    this.cartItemsSource.next([]);
    this.updateCartState();
  }

  private isValidProduct(product: Partial<CartItem>): boolean {
    return !!(product.id && product.name);
  }

  private findExistingItem(
    items: CartItem[],
    product: Partial<CartItem>
  ): number {
    return items.findIndex(
      (item) =>
        item.id === product.id &&
        item.size === product.size &&
        item.shoeSize === product.shoeSize
    );
  }

  private createCartItem(
    product: Partial<CartItem>,
    quantity: number,
    stock: number
  ): CartItem {
    return {
      id: product.id!,
      name: product.name!,
      price: product.price || 0,
      quantity,
      size: product.size,
      shoeSize: product.shoeSize,
      imageSrc: product.imageSrc || '',
      stock: stock,
    };
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
    const items = this.cartItemsSource.value;
    return items.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = this.validateQuantity(item.quantity) ? item.quantity : 0;
      return total + price * quantity;
    }, 0);
  }

  private parsePrice(priceString: string): number {
    const cleanPrice = (priceString || '0')
      .replace(/[^\d,]/g, '')
      .replace(',', '.');
    const price = parseFloat(cleanPrice);
    return isNaN(price) || price < 0 ? 0 : price;
  }

  getCartTotalFormatted(): string {
    const total = Math.max(0, this.getCartTotal());
    const formattedTotal = total.toFixed(2).replace('.', ',');
    return `R$ ${formattedTotal}`;
  }
}
