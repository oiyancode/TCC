import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { CartService, CartItem } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { APP_CONFIG } from '../../core/constants/app.constants';
import { OrderService, OrderData } from '../../services/order.service';

import { FormsModule } from '@angular/forms';
import { AuthService, CreditCard } from '../../services/auth.service';
import { TextOnlyDirective } from '../../directives/text-only.directive';
import { CepMaskDirective } from '../../directives/cep-mask.directive';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    FormsModule,
    TextOnlyDirective,
    CepMaskDirective,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  cartTotalFormatted = '';
  cartItemCount = 0;
  isLoading = false;
  selectedPayment: 'pix' | 'card' | null = 'pix';

  // User Data for Address Form
  userName = '';
  userZip = '';
  userAddress = '';
  userCountry = '';
  userCity = '';

  // Payment & Discount
  savedCards: CreditCard[] = [];
  selectedCard: string = '';
  discountCode: string = '';
  discountApplied: boolean = false;
  discountAmount: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService,
    private orderService: OrderService
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
    // Melhorar navegação: voltar para última página visitada ou produtos
    const lastPage = localStorage.getItem('lastVisitedPage');
    if (lastPage && lastPage !== '/cart') {
      this.router.navigate([lastPage]);
    } else {
      this.router.navigate(['/products']);
    }
  }

  proceedToCheckout() {
    if (this.isCartEmpty()) {
      this.showEmptyCartMessage();
      return;
    }
    if (!this.validateOrderData()) {
      this.toastService.error(
        'Preencha todos os campos obrigatórios para continuar.'
      );
      return;
    }

    const orderData = this.buildOrderData();
    this.orderService.createOrder(orderData).subscribe((order) => {
      this.toastService.success('Pedido realizado com sucesso!');
      this.cartService.clearCart();
      this.router.navigate(['/order-confirmation'], {
        queryParams: { orderId: order.id },
      });
    });
  }

  isCheckoutDisabled(): boolean {
    if (this.isCartEmpty()) {
      return true;
    }
    if (this.selectedPayment === 'card') {
      return !this.selectedCard;
    }
    return false;
  }

  selectPaymentMethod(method: 'pix' | 'card') {
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

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user) {
          this.userName = user.name || '';
          this.userZip = user.address?.zip || '';
          this.userAddress = user.address?.street || '';
          this.userCountry = user.address?.country || '';
          this.userCity = user.address?.city || '';
          this.savedCards = user.savedCards || [];
        }
      });
  }

  applyDiscount() {
    if (this.discountCode.toUpperCase() === 'FORD25') {
      this.discountApplied = true;
      this.updateTotals();
      this.toastService.success('🎉 25% de desconto aplicado! Parabéns!');
    } else {
      this.discountApplied = false;
      this.updateTotals();
      this.toastService.error('😕 Cupom inválido. Tente "FORD25"!');
    }
  }

  editProfile() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login'], {
        queryParams: { redirectTo: '/cart' },
      });
    }
  }

  navigateToAddCard() {
    this.router.navigate(['/profile'], { queryParams: { tab: 'payments' } });
  }

  private updateTotals() {
    const subtotal = this.cartService.getCartTotal();

    if (this.discountApplied) {
      this.discountAmount = subtotal * 0.25;
      this.cartTotal = subtotal - this.discountAmount;
    } else {
      this.discountAmount = 0;
      this.cartTotal = subtotal;
    }

    this.cartTotalFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(this.cartTotal);
  }

  private confirmClearCart(): boolean {
    return confirm('Tem certeza que deseja limpar todo o carrinho?');
  }

  private showEmptyCartMessage(): void {
    this.toastService.info(
      'Seu carrinho está vazio. Adicione produtos antes de continuar.'
    );
  }

  private showCheckoutComingSoon(): void {
    console.log('Proceeding to checkout with items:', this.cartItems);
    this.toastService.info(
      'Funcionalidade de checkout será implementada em breve!'
    );
  }

  private validateOrderData(): boolean {
    if (this.selectedPayment === 'card') {
      if (!this.selectedCard) {
        this.toastService.error('Por favor, selecione um cartão de crédito.');
        return false;
      }
    }
    return true;
  }

  private buildOrderData(): OrderData {
    return {
      items: this.cartItems,
      total: this.cartTotal,
      paymentMethod: this.selectedPayment!,
      shippingAddress: {
        name: this.userName,
        zip: this.userZip,
        address: this.userAddress,
        country: this.userCountry,
        city: this.userCity,
      },
    };
  }
}
