import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  of,
  tap,
  catchError,
  shareReplay,
  map,
  retry,
  BehaviorSubject,
  finalize,
  combineLatest,
} from 'rxjs';
import { ToastService } from './toast.service';

export interface Review {
  id: number;
  userName: string;
  rating: number; // 1-5 estrelas
  comment: string;
  date: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  imageSrc: string;
  variant: 'skate' | 'basket' | 'tenis';
  cssClass: string;
  description?: string;
  shoeSizes?: number[];
  reviews?: Review[];
  rating?: number; // Adicionado para facilitar a filtragem
}

export interface FilterOptions {
  priceRange?: { min: number; max: number };
  sizes?: number[];
  rating?: number;
  availability?: boolean;
}

export interface SortOptions {
  sortBy?: 'price' | 'popularity' | 'newest' | 'rating';
  order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private productsCache$ = new BehaviorSubject<Product[]>([]);
  private productsCacheTime?: number;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private isLoading$ = new BehaviorSubject<boolean>(false);

  private filterOptions$ = new BehaviorSubject<FilterOptions>({});
  private sortOptions$ = new BehaviorSubject<SortOptions>({
    sortBy: 'popularity',
    order: 'desc',
  });

  public filteredProducts$: Observable<Product[]>;

  constructor(private http: HttpClient, private toastService: ToastService) {
    this.filteredProducts$ = combineLatest([
      this.productsCache$,
      this.filterOptions$,
      this.sortOptions$,
    ]).pipe(
      map(([products, filters, sort]) => {
        let filtered = [...products];

        if (filters.priceRange) {
          filtered = filtered.filter((p) => {
            const price = parseFloat(
              p.price.replace('R$', '').replace(',', '.')
            );
            return (
              price >= filters.priceRange!.min &&
              price <= filters.priceRange!.max
            );
          });
        }

        if (filters.sizes && filters.sizes.length > 0) {
          filtered = filtered.filter(
            (p) =>
              p.shoeSizes &&
              p.shoeSizes.some((size) => filters.sizes!.includes(size))
          );
        }

        if (filters.rating) {
          filtered = filtered.filter((p) => {
            if (!p.reviews || p.reviews.length === 0) return false;
            // Verificar se o produto tem pelo menos um comentário com a avaliação selecionada
            return p.reviews.some(
              (review) => review.rating === filters.rating!
            );
          });
        }

        // A lógica de disponibilidade será adicionada se houver um campo correspondente nos dados

        if (sort.sortBy) {
          filtered.sort((a, b) => {
            const order = sort.order === 'asc' ? 1 : -1;
            switch (sort.sortBy) {
              case 'price':
                return (
                  (parseFloat(a.price.replace('R$', '').replace(',', '.')) -
                    parseFloat(b.price.replace('R$', '').replace(',', '.'))) *
                  order
                );
              case 'rating':
                return ((a.rating || 0) - (b.rating || 0)) * order;
              case 'popularity':
                return (a.id - b.id) * order;
              case 'newest':
                return (b.id - a.id) * order;
              default:
                return 0;
            }
          });
        }

        return filtered;
      })
    );
  }

  getProducts(): Observable<Product[]> {
    if (this.isCacheValid()) {
      return this.productsCache$.asObservable();
    }

    this.isLoading$.next(true);
    return this.http.get<Product[]>('/assets/products.json').pipe(
      tap((products) => {
        const productsWithRating = products.map((p) => ({
          ...p,
          rating:
            p.reviews && p.reviews.length > 0
              ? Math.round(
                  p.reviews.reduce((acc, review) => acc + review.rating, 0) /
                    p.reviews.length
                )
              : 0,
        }));
        this.productsCache$.next(productsWithRating);
        this.productsCacheTime = Date.now();
      }),
      retry(2),
      catchError(() => this.handleError()),
      finalize(() => this.isLoading$.next(false))
    );
  }

  setFilters(filters: FilterOptions): void {
    this.filterOptions$.next(filters);
  }

  setSort(sort: SortOptions): void {
    this.sortOptions$.next(sort);
  }

  getProductById(id: number): Observable<Product | undefined> {
    if (!this.isValidProductId(id)) {
      console.warn('Invalid product ID:', id);
      return of(undefined);
    }

    return this.getProducts().pipe(
      map((products) => products.find((p) => p.id === id)),
      catchError(() => of(undefined))
    );
  }

  getProductsByVariant(
    variant: 'skate' | 'basket' | 'tenis'
  ): Observable<Product[]> {
    return this.getProducts().pipe(
      map((products) => products.filter((p) => p.variant === variant)),
      catchError(() => of([]))
    );
  }

  getRecommendedProducts(
    currentProductId: number,
    variant: 'skate' | 'basket' | 'tenis',
    limit = 2
  ): Observable<Product[]> {
    return this.getProductsByVariant(variant).pipe(
      map(
        (products) =>
          products
            .filter((p) => p.id !== currentProductId) // Exclui o produto atual
            .slice(0, limit) // Limita a 2 recomendações
      ),
      catchError(() => of([]))
    );
  }

  addReview(
    productId: number,
    review: Review
  ): Observable<Product | undefined> {
    const products = this.productsCache$.getValue();
    const productIndex = products.findIndex((p) => p.id === productId);

    if (productIndex > -1) {
      const updatedProduct = { ...products[productIndex] };
      updatedProduct.reviews = [...(updatedProduct.reviews || []), review];

      const totalRating = updatedProduct.reviews.reduce(
        (acc, r) => acc + r.rating,
        0
      );
      updatedProduct.rating = totalRating / updatedProduct.reviews.length;

      const updatedProducts = [...products];
      updatedProducts[productIndex] = updatedProduct;

      this.productsCache$.next(updatedProducts);
      return of(updatedProduct);
    }

    return of(undefined);
  }

  searchProducts(query: string): Observable<Product[]> {
    const sanitizedQuery = this.sanitizeSearchTerm(query);
    if (!sanitizedQuery) {
      return of([]);
    }

    return this.getProducts().pipe(
      map((products) =>
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(sanitizedQuery) ||
            p.variant.toLowerCase().includes(sanitizedQuery)
        )
      ),
      catchError(() => of([]))
    );
  }

  clearCache() {
    this.productsCache$.next([]);
    this.productsCacheTime = undefined;
  }

  getLoadingState(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  private isCacheValid(): boolean {
    if (
      this.productsCache$.getValue().length === 0 ||
      !this.productsCacheTime
    ) {
      return false;
    }
    return Date.now() - this.productsCacheTime < this.CACHE_DURATION;
  }

  private isValidProductId(id: number): boolean {
    return Number.isInteger(id) && id > 0;
  }

  private handleError(): Observable<Product[]> {
    console.warn('No cached products available, returning empty array');
    this.toastService.error(
      'Erro ao carregar produtos. Verifique sua conexão.'
    );
    return this.productsCache$.getValue().length > 0
      ? of(this.productsCache$.getValue())
      : of([]);
  }

  private sanitizeSearchTerm(query: string): string {
    if (!query || typeof query !== 'string') {
      return '';
    }

    return query
      .trim()
      .replace(/<[^>]*>/g, '') // HTML tags
      .replace(/[<>"'&]/g, '') // Dangerous chars
      .replace(/javascript:/gi, '') // JS protocols
      .replace(/on\w+\s*=/gi, '') // Event handlers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 50) // Limit length
      .replace(/[^a-zA-Z0-9\s\-_]/g, '') // Only safe chars
      .toLowerCase();
  }
}
