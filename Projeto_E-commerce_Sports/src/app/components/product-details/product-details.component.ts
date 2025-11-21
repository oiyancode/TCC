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
<<<<<<< HEAD
  shoeSizes: number[] = [37, 38, 39, 40, 41, 42];
  selectedShoeSize: number = 39; // default shoe size
=======
>>>>>>> 352e45723da94dd17b69b0fedc852b59c4c3f59e

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
<<<<<<< HEAD
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
=======
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productsService.getProductById(id).subscribe((product) => {
        if (product) {
          this.product = product;
          this.setupSizes();
        }
      });
    }
>>>>>>> 352e45723da94dd17b69b0fedc852b59c4c3f59e
  }

  private setupSizes() {
    if (this.product?.variant === 'tenis') {
<<<<<<< HEAD
      this.availableSizes = ['V1', 'V2'];
=======
      this.availableSizes = ['V1', 'V2', 'V3'];
>>>>>>> 352e45723da94dd17b69b0fedc852b59c4c3f59e
    } else {
      this.availableSizes = ['ÚNICO'];
    }
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

<<<<<<< HEAD
  selectShoeSize(size: number) {
    this.selectedShoeSize = size;
  }

  switchProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

=======
>>>>>>> 352e45723da94dd17b69b0fedc852b59c4c3f59e
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
