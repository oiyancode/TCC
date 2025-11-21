import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService, Product } from '../../services/products.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productsService.getProductById(id).subscribe((product) => {
        if (product) {
          this.product = product;
          this.setupSizes();
        }
      });
    }
  }

  private setupSizes() {
    if (this.product?.variant === 'tenis') {
      this.availableSizes = ['V1', 'V2', 'V3'];
    } else {
      this.availableSizes = ['ÚNICO'];
    }
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  addToCart() {
    // TODO: Implementar lógica do carrinho
    console.log(
      'Adicionando produto ao carrinho:',
      this.product,
      'Tamanho:',
      this.selectedSize
    );
  }
}
