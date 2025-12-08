import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Product } from '../../services/products.service';
import { ToastService } from '../../services/toast.service';
import { ImageOptimizationService } from '../../core/services/image-optimization.service';

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
    private toastService: ToastService,
    private imageOpt: ImageOptimizationService
  ) {}

  getOptimizedImageUrl(): string {
    // Remove a extensão do arquivo, seja ela qual for
    const basePath = this.imageSrc.replace(/\.[^/.]+$/, '');
    // Usa 'webp' como fallback, já que todas as nossas imagens têm essa versão
    return this.imageOpt.getOptimizedImageUrl(basePath, 'webp');
  }

  getResponsiveSrcset(): string {
    const basePath = this.imageSrc.replace(/\.[^/.]+$/, '');
    // A extensão será webp se suportada, ou webp como fallback.
    const extension = this.imageOpt.supportsWebP() ? 'webp' : 'webp';
    return `
      ${basePath}-400w.${extension} 400w,
      ${basePath}-800w.${extension} 800w,
      ${basePath}-1200w.${extension} 1200w
    `;
  }

  handleAddToCart(event: Event): void {
    this.isAddedToCart = true;
    this.goToCart(event);
    setTimeout(() => {
      this.isAddedToCart = false;
    }, 300);
  }

  goToCart(event: Event): void {
    event.stopPropagation();

    if (!this.isValidProduct()) {
      console.warn('Cannot add item to cart: missing required data');
      return;
    }

    // Convert price to number for CartItem
    const cartItem = {
      id: this.productId,
      name: this.name,
      price: this.parsePrice(this.price),
      imageSrc: this.imageSrc,
      variant: this.variant,
      cssClass: this.cssClass,
    };

    this.cartService.addItem(cartItem);
    this.toastService.success('Produto adicionado ao carrinho!');
    this.addToCart.emit(this.getProductData() as Product);
  }

  goToDetails(event: Event): void {
    event.stopPropagation();

    if (this.productId) {
      this.router.navigate(['/product', this.productId]);
      this.productClicked.emit(this.getProductData() as Product);
    }
  }

  quickView(event: Event): void {
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
      cssClass: this.cssClass,
    };
  }

  private isValidProduct(): boolean {
    return !!(this.productId && this.name && this.price);
  }

  private parsePrice(priceString: string): number {
    // Remove currency symbol and convert comma to dot
    const cleanPrice = priceString.replace(/[^0-9,]/g, '').replace(',', '.');
    return parseFloat(cleanPrice) || 0;
  }
}
