import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService, Product } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { NavbarComponent } from '../navbar/navbar.component'; // Import NavbarComponent
import { LoadingComponent } from '../loading/loading.component';
import { ToastService } from '../../services/toast.service';
import { APP_CONFIG } from '../../core/constants/app.constants';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, NavbarComponent, LoadingComponent], // Add NavbarComponent to imports
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  recommendedProducts: Product[] = [];
  isVariantTenis = false;
  isAddedToCart = false;
  isLoading = true;
  selectedSize = 'V2'; // default size for tennis
  availableSizes: string[] = [];
  shoeSizes: number[] = APP_CONFIG.SHOE_SIZES;
  selectedShoeSize: number = 39; // default shoe size

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Rola para o topo da página ao inicializar
    window.scrollTo(0, 0);

    // Subscribe to route params to reload when product ID changes
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  private loadProduct(id: number) {
    this.isLoading = true;
    this.productsService.getProductById(id).subscribe((product) => {
      this.isLoading = false;
      if (product) {
        this.product = product;
        this.isVariantTenis = product.variant === 'tenis';
        this.setupSizes();
        this.loadRecommendedProducts(product.id, product.variant);
      }
    });
  }

  private loadRecommendedProducts(
    currentProductId: number,
    variant: 'skate' | 'basket' | 'tenis'
  ) {
    this.productsService
      .getRecommendedProducts(currentProductId, variant)
      .subscribe((products) => {
        this.recommendedProducts = products;
      });
  }

  private setupSizes() {
    if (this.product?.variant === 'tenis') {
      this.availableSizes = ['V1', 'V2'];
    } else {
      this.availableSizes = ['ÚNICO'];
    }
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  selectShoeSize(size: number) {
    this.selectedShoeSize = size;
  }

  switchProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  handleAddToCart() {
    this.isAddedToCart = true;
    this.addToCart();
    setTimeout(() => {
      this.isAddedToCart = false;
    }, APP_CONFIG.ANIMATION_DURATION_MS); // A animação dura 300ms
  }

  addToCart() {
    if (!this.product) {
      console.warn('Cannot add to cart: no product selected');
      return;
    }

    // Validate required data
    if (!this.product.id || !this.product.name || !this.product.price) {
      console.error('Cannot add to cart: missing product data');
      return;
    }

    // Create cart item with all necessary data
    const cartItem = {
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      imageSrc: this.product.imageSrc,
      variant: this.product.variant,
      cssClass: this.product.cssClass,
      size: this.selectedSize !== 'ÚNICO' ? this.selectedSize : undefined,
      shoeSize:
        this.selectedShoeSize !== 39 ? this.selectedShoeSize : undefined,
    };

    this.cartService.addItem(cartItem, 1);

    console.log(
      'Adicionando produto ao carrinho:',
      cartItem.name,
      'Tamanho:',
      cartItem.size || 'N/A',
      'Tamanho tênis:',
      cartItem.shoeSize || 'N/A',
      'Preço:',
      cartItem.price
    );

    // Show success feedback (could be improved with a toast notification)
    this.toastService.success(`Produto "${cartItem.name}" adicionado ao carrinho!`);

    // Navigate to cart page
    this.router.navigate(['/cart']);
  }
}
