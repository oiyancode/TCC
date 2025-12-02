import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { authGuard } from './services/auth.guard';

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
  {
    path: 'products',
    loadComponent: () =>
      import('./components/products/products.component').then(
        (m) => m.ProductsComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (c) => c.LoginComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(
        (c) => c.ProfileComponent
      ),
    canActivate: [authGuard],
  },
];
