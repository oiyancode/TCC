import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, shareReplay, map, retry, BehaviorSubject, finalize } from 'rxjs';
import { ToastService } from './toast.service';

export interface Product {
  id: number;
  name: string;
  price: string;
  imageSrc: string;
  variant: 'skate' | 'basket' | 'tenis';
  cssClass: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private productsCache?: Product[];
  private productsCacheTime?: number;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private toastService: ToastService) {}

  getProducts(): Observable<Product[]> {
    if (this.isCacheValid()) {
      return of(this.productsCache!);
    }

    this.isLoading$.next(true);
    return this.http.get<Product[]>('/assets/products.json').pipe(
      tap(products => {
        this.productsCache = products;
        this.productsCacheTime = Date.now();
      }),
      retry(2),
      catchError(() => this.handleError()),
      shareReplay(this.cacheConfig),
      finalize(() => this.isLoading$.next(false))
    );
  }

  getProductById(id: number): Observable<Product | undefined> {
    if (!this.isValidProductId(id)) {
      console.warn('Invalid product ID:', id);
      return of(undefined);
    }

    return this.getProducts().pipe(
      map(products => products.find(p => p.id === id)),
      catchError(() => of(undefined))
    );
  }

  getProductsByVariant(variant: 'skate' | 'basket' | 'tenis'): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.filter(p => p.variant === variant)),
      catchError(() => of([]))
    );
  }

  getRecommendedProducts(currentProductId: number, variant: 'skate' | 'basket' | 'tenis', limit = 2): Observable<Product[]> {
    return this.getProductsByVariant(variant).pipe(
      map(products => products
        .filter(p => p.id !== currentProductId) // Exclui o produto atual
        .slice(0, limit) // Limita a 2 recomendações
      ),
      catchError(() => of([]))
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    const sanitizedQuery = this.sanitizeSearchTerm(query);
    if (!sanitizedQuery) {
      return of([]);
    }

    return this.getProducts().pipe(
      map(products => products.filter(p => 
        p.name.toLowerCase().includes(sanitizedQuery) ||
        p.variant.toLowerCase().includes(sanitizedQuery)
      )),
      catchError(() => of([]))
    );
  }

  clearCache() {
    this.productsCache = undefined;
    this.productsCacheTime = undefined;
  }

  getLoadingState(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  private get cacheConfig() {
    return {
      bufferSize: 1,
      refCount: false,
      windowTime: this.CACHE_DURATION
    };
  }

  private isCacheValid(): boolean {
    if (!this.productsCache || !this.productsCacheTime) {
      return false;
    }
    return (Date.now() - this.productsCacheTime) < this.CACHE_DURATION;
  }

  private isValidProductId(id: number): boolean {
    return Number.isInteger(id) && id > 0;
  }

  private handleError(): Observable<Product[]> {
    console.warn('No cached products available, returning empty array');
    this.toastService.error('Erro ao carregar produtos. Verifique sua conexão.');
    return this.productsCache ? of(this.productsCache) : of([]);
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
