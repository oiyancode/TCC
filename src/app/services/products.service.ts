import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, shareReplay, map } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    // Check if we have a valid cache
    if (this.isCacheValid()) {
      return of(this.productsCache!);
    }

    // Fetch from server and cache the result
    return this.http.get<Product[]>('/assets/products.json').pipe(
      tap(products => {
        this.productsCache = products;
        this.productsCacheTime = Date.now();
      }),
      catchError(error => {
        console.error('Failed to load products:', error);
        // Return cached products if available, otherwise return empty array
        if (this.productsCache) {
          return of(this.productsCache);
        }
        console.warn('No cached products available, returning empty array');
        return of([]);
      }),
      shareReplay({
        bufferSize: 1,
        refCount: false,
        windowTime: this.CACHE_DURATION
      })
    );
  }

  getProductById(id: number): Observable<Product | undefined> {
    if (!id || !Number.isInteger(id) || id <= 0) {
      console.warn('Invalid product ID:', id);
      return of(undefined);
    }

    return this.getProducts().pipe(
      tap(products => console.log(`Loaded ${products.length} products for lookup`)),
      map(products => products.find(p => p.id === id)),
      catchError(error => {
        console.error('Failed to fetch products for ID lookup:', error);
        return of(undefined);
      })
    );
  }

  private isCacheValid(): boolean {
    if (!this.productsCache || !this.productsCacheTime) {
      return false;
    }
    const now = Date.now();
    return (now - this.productsCacheTime) < this.CACHE_DURATION;
  }

  clearCache() {
    this.productsCache = undefined;
    this.productsCacheTime = undefined;
  }

  // Utility method to search products by variant
  getProductsByVariant(variant: 'skate' | 'basket' | 'tenis'): Observable<Product[]> {
    return this.getProducts().pipe(
      tap(products => {
        console.log(`Filtering ${products.length} products for variant: ${variant}`);
      }),
      map(products => products.filter(p => p.variant === variant)),
      catchError(error => {
        console.error('Failed to filter products by variant:', error);
        return of([]);
      })
    );
  }

  // Utility method to search products by name
  searchProducts(query: string): Observable<Product[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    const searchTerm = query.toLowerCase().trim();
    return this.getProducts().pipe(
      tap(products => {
        console.log(`Searching ${products.length} products for: "${searchTerm}"`);
      }),
      map(products => products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.variant.toLowerCase().includes(searchTerm)
      )),
      catchError(error => {
        console.error('Failed to search products:', error);
        return of([]);
      })
    );
  }
}
