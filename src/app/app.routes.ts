import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./components/cart/cart.component').then((c) => c.CartComponent),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./components/product-details/product-details.component').then(
        (c) => c.ProductDetailsComponent
      ),
  },
];
