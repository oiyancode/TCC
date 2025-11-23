import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService, Product } from '../../services/products.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  selectedSize = 'V2'; // default size for tennis
  availableSizes: string[] = [];
  shoeSizes: number[] = [37, 38, 39, 40, 41, 42];
  selectedShoeSize: number = 39; // default shoe size

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Subscribe to route params to reload when product ID changes
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  private loadProduct(id: number) {
    this.productsService.getProductById(id).subscribe((product) => {
      if (product) {
        this.product = product;
        this.setupSizes();
      }
    });
  }

  private setupSizes() {
    if (this.product?.variant === 'tenis') {
      this.availableSizes = ['V1', 'V2'];
    } else {
      this.availableSizes = ['ÚNICO'];
    }
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  selectShoeSize(size: number) {
    this.selectedShoeSize = size;
  }

  switchProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  addToCart() {
    // Incrementa contador e navega para carrinho
    this.cartService.addItem();

    console.log(
      'Adicionando produto ao carrinho:',
      this.product?.name,
      'Tamanho:',
      this.selectedSize,
      'Tamanho tênis:',
      this.selectedShoeSize
    );

    // Navega para página do carrinho
    this.router.navigate(['/cart']);
  }
}
