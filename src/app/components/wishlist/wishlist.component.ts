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
    combineLatest([
      this.wishlistService.getWishlist(),
      this.productsService.getProducts()
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([wishlistIds, allProducts]) => {
        this.wishlistProducts = allProducts.filter(product =>
          wishlistIds.includes(product.id)
        );
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
    this.cartService.addItem(product);
    this.toastService.success('Produto adicionado ao carrinho!');
  }

  addAllToCart(): void {
    if (this.wishlistProducts.length === 0) {
      this.toastService.info('Sua lista de desejos está vazia.');
      return;
    }

    this.wishlistProducts.forEach(product => {
      this.cartService.addItem(product);
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
