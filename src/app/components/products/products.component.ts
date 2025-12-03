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
  imports: [CommonModule, NavbarComponent, LoadingComponent, FiltersComponent, RouterModule], // Adiciona o FiltersComponent
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
    this.products$ = this.productsService.filteredProducts$;
    this.productsService.getProducts().subscribe(() => {
      this.animateItems();
    });

    this.products$.subscribe(() => {
      this.animateItems();
    });

    this.route.queryParams.subscribe((params) => {
      const category = params['category'];
      if (category && ['tenis', 'skate', 'basket'].includes(category)) {
        // Lógica para aplicar filtro inicial via categoria será movida para o filters.component
        this.initialFilterCategory = category;
      }
    });

    this.wishlistService.getWishlist().subscribe((wishlist) => {
      this.wishlist = new Set(wishlist);
    });
  }

  onFiltersChange(filters: FilterOptions) {
    this.productsService.setFilters(filters);
  }

  onSortChange(sort: SortOptions) {
    this.productsService.setSort(sort);
  }

  private animateItems() {
    setTimeout(() => {
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
    }, 100); // Wait for DOM update
  }

  navigateToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  toggleWishlist(productId: number, event: Event) {
    event.stopPropagation();
    this.wishlistService.toggleWishlist(productId).subscribe();
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist.has(productId);
  }
}
