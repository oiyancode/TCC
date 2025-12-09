import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  ProductsService,
  Product,
  FilterOptions,
  SortOptions,
} from '../../services/products.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { LoadingComponent } from '../loading/loading.component';
import { FiltersComponent } from '../filters/filters.component'; // Importa o novo componente
import gsap from 'gsap';
import { Observable, of } from 'rxjs';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    LoadingComponent,
    FiltersComponent,
    RouterModule,
  ], // Adiciona o FiltersComponent
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  products$: Observable<Product[]> = of([]);
  loading$: Observable<boolean>;
  wishlist: Set<number> = new Set();
  initialFilterCategory: 'tenis' | 'skate' | 'basket' | undefined;

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute,
    private wishlistService: WishlistService
  ) {
    this.loading$ = this.productsService.getLoadingState();
  }

  ngOnInit() {
    // Clear cache to ensure fresh data
    this.productsService.clearCache();

    this.setupProductsSubscription();
    this.setupWishlistSubscription();
    this.setupRouteParams();
  }

  private setupProductsSubscription(): void {
    this.products$ = this.productsService.filteredProducts$;

    // Subscribe to both initial load and subsequent changes
    this.productsService.getProducts().subscribe(() => this.animateItems());
    this.products$.subscribe(() => this.animateItems());
  }

  private setupWishlistSubscription(): void {
    this.wishlistService.getWishlist().subscribe((wishlist) => {
      this.wishlist = new Set(wishlist);
    });
  }

  private setupRouteParams(): void {
    this.route.queryParams.subscribe((params) => {
      const category = params['category'];
      if (category && this.isValidCategory(category)) {
        this.initialFilterCategory = category;
      }
    });
  }

  private isValidCategory(
    category: string
  ): category is 'tenis' | 'skate' | 'basket' {
    return ['tenis', 'skate', 'basket'].includes(category);
  }

  onFiltersChange(filters: FilterOptions): void {
    this.productsService.setFilters(filters);
  }

  clearFilters(): void {
    this.productsService.setFilters({});
  }

  onSortChange(sort: SortOptions): void {
    this.productsService.setSort(sort);
  }

  private animateItems(): void {
    setTimeout(() => {
      const elements = document.querySelectorAll('.product-card');
      if (elements.length > 0) {
        gsap.fromTo(
          '.product-card',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'all',
          }
        );
      }
    }, 100);
  }

  navigateToProduct(id: number): void {
    this.router.navigate(['/product', id]);
  }

  toggleWishlist(productId: number, event: Event): void {
    event.stopPropagation();
    this.wishlistService.toggleWishlist(productId).subscribe();
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist.has(productId);
  }

  getStockStatusClass(stock: number | undefined): string {
    if (stock === undefined || stock === 0) {
      return 'stock-out';
    } else if (stock < 5) {
      return 'stock-low';
    }
    return 'stock-available';
  }

  getStockMessage(stock: number | undefined): string {
    if (stock === undefined) return '';
    if (stock === 0) return 'Esgotado';
    if (stock > 0 && stock <= 3) return `Apenas ${stock} restantes`;
    return 'Disponível';
  }
}
