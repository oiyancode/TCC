import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Product } from '../../services/products.service';

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

  constructor(private router: Router, private cartService: CartService) {}

  goToCart(event: Event) {
    event.stopPropagation();
    
    if (!this.productId || !this.name || !this.price) {
      console.warn('Cannot add item to cart: missing required data');
      return;
    }

    const product: Partial<Product> = {
      id: this.productId,
      name: this.name,
      price: this.price,
      imageSrc: this.imageSrc,
      variant: this.variant,
      cssClass: this.cssClass
    };

    this.cartService.addItem(product);
    
    // Emit event for parent component
    this.addToCart.emit(product as Product);
  }

  goToDetails(event: Event) {
    event.stopPropagation();
    
    if (this.productId) {
      this.router.navigate(['/product', this.productId]);
      
      // Emit event for tracking/analytics
      this.productClicked.emit({
        id: this.productId,
        name: this.name,
        price: this.price,
        imageSrc: this.imageSrc,
        variant: this.variant,
        cssClass: this.cssClass
      });
    }
  }

  quickView(event: Event) {
    event.stopPropagation();
    if (this.enableQuickView) {
      // TODO: Implement quick view modal
      console.log('Quick view for product:', this.productId);
    }
  }
}
