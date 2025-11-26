import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  cartItemCount = '[00]';
  isMobileMenuOpen = false;
  isSearchPopupOpen = false;
  isCartPage = false; // Detect if on cart page

  private subscription: Subscription = new Subscription();

  constructor(private router: Router, private cartService: CartService) {}

  ngOnInit() {
    this.setupCartSubscription();
    this.checkIfCartPage();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.closeSearchPopup();
  }

  toggleSearchPopup() {
    this.isSearchPopupOpen = !this.isSearchPopupOpen;
    this.closeMobileMenu();
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  closeSearchPopup() {
    this.isSearchPopupOpen = false;
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  private setupCartSubscription() {
    this.subscription.add(
      this.cartService.cartItemCount$.subscribe(
        count => this.cartItemCount = this.formatCartCount(count)
      )
    );
  }

  private formatCartCount(count: number): string {
    return `[${count.toString().padStart(2, '0')}]`;
  }

  private checkIfCartPage() {
    this.isCartPage = this.router.url.includes('/cart');
  }
}
