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
  cartItemCount: string = '[00]';
  isMobileMenuOpen: boolean = false;
  isSearchPopupOpen: boolean = false;

  private subscription: Subscription = new Subscription();

  constructor(private router: Router, private cartService: CartService) {}

  ngOnInit() {
    this.subscription.add(
      this.cartService.cartItemCount$.subscribe((count) => {
        this.cartItemCount = count < 10 ? `[0${count}]` : `[${count}]`;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isSearchPopupOpen = false; // Close search when opening menu
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleSearchPopup() {
    this.isSearchPopupOpen = !this.isSearchPopupOpen;
    if (this.isSearchPopupOpen) {
      this.isMobileMenuOpen = false; // Close menu when opening search
    }
  }

  closeSearchPopup() {
    this.isSearchPopupOpen = false;
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
