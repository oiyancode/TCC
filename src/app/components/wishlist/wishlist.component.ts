import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { WishlistService } from '../../services/wishlist.service';
import { ProductsService, Product } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, NavbarComponent, LoadingComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistProducts: Product[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private wishlistService: WishlistService,
    private productsService: ProductsService,
    private cartService: CartService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupWishlistSubscription();
  }

  private setupWishlistSubscription(): void {
    combineLatest([
      this.wishlistService.getWishlist(),
      this.productsService.getProducts()
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([wishlistIds, allProducts]) => {
        this.wishlistProducts = allProducts.filter(product => wishlistIds.includes(product.id));
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.removeFromWishlist(productId);
    this.toastService.success('Produto removido da lista de desejos!');
  }

  addToCart(product: Product): void {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      imageSrc: product.imageSrc
    } as any; // Type assertion to resolve price type mismatch
    this.cartService.addItem(cartItem);
    this.toastService.success('Produto adicionado ao carrinho!');
  }

  addAllToCart(): void {
    if (this.isWishlistEmpty()) {
      this.toastService.info('Sua lista de desejos está vazia.');
      return;
    }

    this.addAllProductsToCart();
  }

  private isWishlistEmpty(): boolean {
    return this.wishlistProducts.length === 0;
  }

  private addAllProductsToCart(): void {
    this.wishlistProducts.forEach(product => {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        imageSrc: product.imageSrc
      } as any;
      this.cartService.addItem(cartItem);
    });
    this.toastService.success(`${this.wishlistProducts.length} produtos adicionados ao carrinho!`);
  }

  goToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}
