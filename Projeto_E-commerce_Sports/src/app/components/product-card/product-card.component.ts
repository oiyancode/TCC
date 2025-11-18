import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() name = '';
  @Input() price = '';
  @Input() imageSrc = '';
  @Input() variant: 'basket' | 'tenis' | 'skate' = 'skate';
}

