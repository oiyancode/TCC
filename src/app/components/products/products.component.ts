import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsService, Product } from '../../services/products.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { LoadingComponent } from '../loading/loading.component';
import gsap from 'gsap';
import { APP_CONFIG } from '../../core/constants/app.constants';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, NavbarComponent, LoadingComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  selectedFilter: 'all' | 'tenis' | 'skate' | 'basket' = 'all';
  showFilterMenu = false;
  isLoading = true;

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.productsService.getProducts().subscribe(products => {
      this.allProducts = products;
      this.filteredProducts = products;
      this.isLoading = false;
      this.animateItems();
      
      // Check for category query param
      this.route.queryParams.subscribe(params => {
        const category = params['category'];
        if (category && ['tenis', 'skate', 'basket'].includes(category)) {
          this.applyFilter(category as 'tenis' | 'skate' | 'basket');
        }
      });
    });
  }

  toggleFilterMenu() {
    this.showFilterMenu = !this.showFilterMenu;
  }

  applyFilter(filter: 'all' | 'tenis' | 'skate' | 'basket') {
    this.selectedFilter = filter;
    
    if (filter === 'all') {
      this.filteredProducts = this.allProducts;
    } else {
      this.filteredProducts = this.allProducts.filter(p => p.variant === filter);
    }
    
    this.showFilterMenu = false;
    this.animateItems();
  }

  private animateItems() {
    setTimeout(() => {
      gsap.fromTo(
        '.product-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
          clearProps: 'all'
        }
      );
    }, 100); // Wait for DOM update
  }

  navigateToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  getFilterLabel(): string {
    const labels = {
      'all': 'Todos os Produtos',
      'tenis': 'Tênis',
      'skate': 'Skate',
      'basket': 'Basquete'
    };
    return labels[this.selectedFilter];
  }
}
