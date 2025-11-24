import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  cartTotalFormatted = '';
  cartItemCount = 0;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCartData();
    this.subscribeToCartUpdates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCartData() {
    this.isLoading = true;
    this.cartItems = this.cartService.getCartItems();
    this.updateTotals();
    this.isLoading = false;
  }

  private subscribeToCartUpdates() {
    this.cartService.cartItemCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.cartItemCount = count;
      });

    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
        this.updateTotals();
      });
  }

  private updateTotals() {
    this.cartTotal = this.cartService.getCartTotal();
    this.cartTotalFormatted = this.cartService.getCartTotalFormatted();
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.id, item.size, item.shoeSize);
  }

  updateQuantity(item: CartItem, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(item);
    } else {
      this.cartService.updateQuantity(item.id, quantity, item.size, item.shoeSize);
    }
  }

  incrementQuantity(item: CartItem) {
    const newQuantity = item.quantity + 1;
    this.updateQuantity(item, newQuantity);
  }

  decrementQuantity(item: CartItem) {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      this.updateQuantity(item, newQuantity);
    } else {
      this.removeItem(item);
    }
  }

  clearCart() {
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
      this.cartService.clearCart();
    }
  }

  continueShopping() {
    this.router.navigate(['/']);
  }

  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      alert('Seu carrinho está vazio. Adicione produtos antes de prosseguir para o checkout.');
      return;
    }
    // TODO: Implement checkout process
    console.log('Proceeding to checkout with items:', this.cartItems);
    alert('Funcionalidade de checkout será implementada em breve!');
  }

  getCartItemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  isCartEmpty(): boolean {
    return this.cartItems.length === 0;
  }
}
