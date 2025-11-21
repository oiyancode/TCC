import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/assets/products.json');
  }

  getProductById(id: number): Observable<Product | undefined> {
    return new Observable((subscriber) => {
      this.getProducts().subscribe((products) => {
        const product = products.find((p) => p.id === id);
        subscriber.next(product);
        subscriber.complete();
      });
    });
  }
}
