import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Subscription,
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
} from 'rxjs';
import { CartService } from '../../services/cart.service';
import { ProductsService, Product } from '../../services/products.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

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
  isLoggedIn = false;
  buttonText = 'Entrar';

  // Search functionality
  searchQuery = '';
  searchResults: Product[] = [];
  showSearchResults = false;
  recentSearches: string[] = [];
  showRecentSearches = false;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  private subscription: Subscription = new Subscription();
  private authSubscription?: Subscription;

  constructor(
    private router: Router,
    private cartService: CartService,
    private productsService: ProductsService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.setupCartSubscription();
    this.checkIfCartPage();
    this.setupSearch();
    this.loadRecentSearches();
    this.setupAuthSubscription();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
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
        (count) => (this.cartItemCount = this.formatCartCount(count))
      )
    );
  }

  private formatCartCount(count: number): string {
    return `[${count.toString().padStart(2, '0')}]`;
  }

  userPhotoUrl: string | null = null;

  private setupAuthSubscription() {
    this.authSubscription = this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.buttonText = this.isLoggedIn ? 'Perfil' : 'Entrar';
      this.userPhotoUrl = user?.photoUrl || null;
    });
  }

  private checkIfCartPage() {
    this.isCartPage = this.router.url.includes('/cart');
  }

  get isProductsPage(): boolean {
    return this.router.url.includes('/products');
  }
  get isProductDetailsPage(): boolean {
    return this.router.url.includes('/product/');
  }

  // Search methods
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.updateSearchQuery(input.value);
  }

  navigateToLoginOrProfile() {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      // Adicionar parâmetro para indicar redirecionamento após login
      this.router.navigate(['/login'], {
        queryParams: { redirectTo: this.router.url },
      });
    }
  }

  onSearchInputMobile(event: Event) {
    const input = event.target as HTMLInputElement;
    this.updateSearchQuery(input.value);
  }

  private setupSearch() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300), // Aguarda 300ms após o usuário parar de digitar
        distinctUntilChanged(), // Só busca se o termo mudou
        switchMap((query) => {
          if (query.trim().length >= 2) {
            return this.productsService.searchProducts(query);
          } else {
            return of([]);
          }
        })
      )
      .subscribe((results) => {
        this.searchResults = results;
        this.showSearchResults =
          results.length > 0 && this.searchQuery.trim().length >= 2;
        this.showRecentSearches = this.searchQuery.trim().length === 0;
      });
  }

  private updateSearchQuery(value: string) {
    this.searchQuery = value;
    this.searchSubject.next(this.searchQuery);
  }

  private loadRecentSearches() {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      this.recentSearches = JSON.parse(saved);
    }
  }

  private saveRecentSearch(query: string) {
    if (!query.trim()) return;

    // Remove if already exists to move to top
    this.recentSearches = this.recentSearches.filter((s) => s !== query);
    this.recentSearches.unshift(query);

    // Limit to 5
    if (this.recentSearches.length > 5) {
      this.recentSearches.pop();
    }

    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  clearRecentSearches() {
    this.recentSearches = [];
    localStorage.removeItem('recentSearches');
  }

  selectRecentSearch(query: string) {
    this.searchQuery = query;
    this.searchSubject.next(query);
    // Don't close results, let them show for the selected query
    this.showRecentSearches = false;
    // Trigger search results display
    setTimeout(() => {
      this.showSearchResults = true;
    }, 100);
  }

  onSearchFocus() {
    this.showSearchResults =
      this.searchResults.length > 0 && this.searchQuery.trim().length >= 2;
    this.showRecentSearches =
      this.searchQuery.trim().length === 0 && this.recentSearches.length > 0;
  }

  onSearchBlur() {
    // Delay para permitir clique nos resultados
    setTimeout(() => {
      this.showSearchResults = false;
      this.showRecentSearches = false;
    }, 200);
  }

  selectProduct(product: Product) {
    this.saveRecentSearch(this.searchQuery);
    this.router.navigate(['/product', product.id]);
    this.closeSearchResults();
    this.closeSearchPopup();
  }

  closeSearchResults() {
    this.showSearchResults = false;
    this.showRecentSearches = false;
    // Don't clear searchQuery here - let it persist
  }

  closeSearchPopup() {
    this.isSearchPopupOpen = false;
    this.showSearchResults = false;
    this.showRecentSearches = false;
    this.searchQuery = '';
  }
}
