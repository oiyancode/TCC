import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Product } from '../../services/products.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() name = '';
  @Input() price = '';
  @Input() imageSrc = '';
  @Input() variant: 'basket' | 'tenis' | 'skate' = 'skate';
  @Input() productId = 0;
  @Input() cssClass = '';
  @Input() showAddToCart = true;
  @Input() enableQuickView = false;

  @Output() productClicked = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  isAddedToCart = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  handleAddToCart(event: Event) {
    this.isAddedToCart = true;
    this.goToCart(event);
    setTimeout(() => {
      this.isAddedToCart = false;
    }, 300);
  }

  goToCart(event: Event) {
    event.stopPropagation();
    
    const productData = this.getProductData();
    if (!this.isValidProduct(productData)) {
      console.warn('Cannot add item to cart: missing required data');
      return;
    }

    this.cartService.addItem(productData);
    this.toastService.success('Produto adicionado ao carrinho!');
    this.addToCart.emit(productData as Product);
  }

  goToDetails(event: Event) {
    event.stopPropagation();
    
    if (this.productId) {
      this.router.navigate(['/product', this.productId]);
      this.productClicked.emit(this.getProductData() as Product);
    }
  }

  quickView(event: Event) {
    event.stopPropagation();
    if (this.enableQuickView) {
      console.log('Quick view for product:', this.productId);
    }
  }

  private getProductData(): Partial<Product> {
    return {
      id: this.productId,
      name: this.name,
      price: this.price,
      imageSrc: this.imageSrc,
      variant: this.variant,
      cssClass: this.cssClass
    };
  }

  private isValidProduct(product: Partial<Product>): boolean {
    return !!(product.id && product.name && product.price);
  }
}
