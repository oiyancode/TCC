import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  constructor(private router: Router) {}

  navigateToProducts(category?: 'tenis' | 'skate' | 'basket') {
    if (category) {
      this.router.navigate(['/products'], { queryParams: { category } });
    } else {
      this.router.navigate(['/products']);
    }
  }

  navigateToContact() {
    this.router.navigate(['/contact']);
  }
}


