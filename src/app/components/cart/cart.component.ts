import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { CartService, CartItem } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { APP_CONFIG } from '../../core/constants/app.constants';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  cartTotalFormatted = '';
  cartItemCount = 0;
  isLoading = false;
  selectedPayment: 'pix' | 'visa' | 'mastercard' | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.setupCartSubscriptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.id, item.size, item.shoeSize);
  }

  updateQuantity(item: CartItem, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(item);
    } else {
      this.cartService.updateQuantity(
        item.id,
        quantity,
        item.size,
        item.shoeSize
      );
    }
  }

  incrementQuantity(item: CartItem) {
    this.updateQuantity(item, item.quantity + 1);
  }

  decrementQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.updateQuantity(item, item.quantity - 1);
    } else {
      this.removeItem(item);
    }
  }

  clearCart() {
    if (this.confirmClearCart()) {
      this.cartService.clearCart();
    }
  }

  continueShopping() {
    this.router.navigate(['/']);
  }

  proceedToCheckout() {
    if (this.isCartEmpty()) {
      this.showEmptyCartMessage();
      return;
    }

    this.showCheckoutComingSoon();
  }

  selectPaymentMethod(method: 'pix' | 'visa' | 'mastercard') {
    this.selectedPayment = method;
  }

  isCartEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  getCartItemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  private setupCartSubscriptions() {
    this.cartService.cartItemCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => (this.cartItemCount = count));

    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.cartItems = items;
        this.updateTotals();
      });
  }

  private updateTotals() {
    this.cartTotal = this.cartService.getCartTotal();
    this.cartTotalFormatted = this.cartService.getCartTotalFormatted();
  }

  private confirmClearCart(): boolean {
    return confirm('Tem certeza que deseja limpar todo o carrinho?');
  }

  private showEmptyCartMessage(): void {
    this.toastService.info(
      'Seu carrinho está vazio. Adicione produtos antes de prosseguir para o checkout.'
    );
  }

  private showCheckoutComingSoon(): void {
    console.log('Proceeding to checkout with items:', this.cartItems);
    this.toastService.info('Funcionalidade de checkout será implementada em breve!');
  }
}
