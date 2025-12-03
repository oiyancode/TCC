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
    path: 'wishlist',
    loadComponent: () =>
      import('./components/wishlist/wishlist.component').then(
        (c) => c.WishlistComponent
      ),
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
  {
    path: 'order-confirmation',
    loadComponent: () =>
      import(
        './components/order-confirmation/order-confirmation.component'
      ).then((c) => c.OrderConfirmationComponent),
  },
  {
    path: 'orders-history',
    loadComponent: () =>
      import('./components/orders-history/orders-history.component').then(
        (c) => c.OrdersHistoryComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'order-tracking',
    loadComponent: () =>
      import('./components/order-tracking/order-tracking.component').then(
        (c) => c.OrderTrackingComponent
      ),
    canActivate: [authGuard],
  },
];
