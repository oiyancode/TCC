import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { ProductsService, Product } from '../../services/products.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  cartItemCount = '[00]';
  isMobileMenuOpen = false;
  isSearchPopupOpen = false;
  isCartPage = false; // Detect if on cart page
  
  // Search functionality
  searchQuery = '';
  searchResults: Product[] = [];
  showSearchResults = false;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router, 
    private cartService: CartService,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    this.setupCartSubscription();
    this.checkIfCartPage();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
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

  get isProductDetailsPage(): boolean {
    return this.router.url.includes('/product/');
  }

  // Search methods
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.searchSubject.next(this.searchQuery);
  }

  onSearchInputMobile(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.searchSubject.next(this.searchQuery);
  }

  private setupSearch() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // Aguarda 300ms após o usuário parar de digitar
      distinctUntilChanged(), // Só busca se o termo mudou
      switchMap(query => {
        if (query.trim().length >= 2) {
          return this.productsService.searchProducts(query);
        } else {
          return of([]);
        }
      })
    ).subscribe(results => {
      this.searchResults = results;
      this.showSearchResults = results.length > 0 && this.searchQuery.trim().length >= 2;
    });
  }

  onSearchFocus() {
    this.showSearchResults = this.searchResults.length > 0 && this.searchQuery.trim().length >= 2;
  }

  onSearchBlur() {
    // Delay para permitir clique nos resultados
    setTimeout(() => {
      this.closeSearchResults();
    }, 200);
  }

  selectProduct(product: Product) {
    this.router.navigate(['/product', product.id]);
    this.closeSearchResults();
    this.closeSearchPopup();
  }

  closeSearchResults() {
    this.showSearchResults = false;
    this.searchQuery = '';
    // Limpar os inputs
    const desktopInput = document.querySelector('.navbar__search--desktop input') as HTMLInputElement;
    const mobileInput = document.querySelector('.navbar__search-popup-content input') as HTMLInputElement;
    if (desktopInput) desktopInput.value = '';
    if (mobileInput) mobileInput.value = '';
  }

  closeSearchPopup() {
    this.isSearchPopupOpen = false;
    this.closeSearchResults();
  }
}
