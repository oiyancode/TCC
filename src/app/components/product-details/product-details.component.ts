import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ProductsService,
  Product,
  Review,
} from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { NavbarComponent } from '../navbar/navbar.component'; // Import NavbarComponent
import { LoadingComponent } from '../loading/loading.component';
import { ToastService } from '../../services/toast.service';

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
  shoeSizes: number[] = []; // Will be populated from product data
  selectedShoeSize: number = 39; // default shoe size
  productScale: number = 1; // Scale factor for product image animation

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
        // Set initial scale based on default size
        this.updateProductScale();
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
      // Use product-specific shoe sizes if available, otherwise use default
      this.shoeSizes = this.product.shoeSizes || [37, 38, 39, 40, 41, 42];
      // Set default selected size to first available or 39
      this.selectedShoeSize = this.shoeSizes.includes(39)
        ? 39
        : this.shoeSizes[0];
    } else {
      this.availableSizes = ['ÚNICO'];
      this.shoeSizes = [];
    }
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  selectShoeSize(size: number) {
    this.selectedShoeSize = size;
    this.updateProductScale();
  }

  private updateProductScale() {
    if (!this.isVariantTenis || !this.shoeSizes.length) {
      this.productScale = 1;
      return;
    }

    // Calculate scale based on shoe size
    // Smallest size = 0.85, largest size = 1.15
    const minSize = Math.min(...this.shoeSizes);
    const maxSize = Math.max(...this.shoeSizes);
    const sizeRange = maxSize - minSize;

    if (sizeRange === 0) {
      this.productScale = 1;
      return;
    }

    const normalizedSize = (this.selectedShoeSize - minSize) / sizeRange;
    this.productScale = 0.85 + normalizedSize * 0.3; // Range: 0.85 to 1.15
  }

  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  switchProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  handleAddToCart() {
    if (this.product && this.product.stock === 0) {
      this.toastService.error('Produto esgotado!');
      return;
    }
    this.isAddedToCart = true;
    this.addToCart();
    setTimeout(() => {
      this.isAddedToCart = false;
    }, 300); // Animation duration in ms
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

    // Ensure price is a number - convert if it's a formatted string
    let numericPrice: number;
    if (typeof this.product.price === 'string') {
      // Remove currency symbol and convert comma to dot
      numericPrice = parseFloat(
        this.product.price.replace(/[^0-9,]/g, '').replace(',', '.')
      );
    } else {
      numericPrice = this.product.price;
    }

    // Create cart item with all necessary data
    const cartItem = {
      id: this.product.id,
      name: this.product.name,
      price: numericPrice, // Always a number now
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

    // Show success feedback with improved message
    this.toastService.success(`🎉 ${cartItem.name} adicionado ao carrinho!`);

    // Salvar última página visitada antes de ir para o carrinho
    localStorage.setItem('lastVisitedPage', this.router.url);

    // Navigate to cart page
    this.router.navigate(['/cart']);
  }
}
