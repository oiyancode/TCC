import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../../../services/products.service';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.scss'],
})
export class ProductReviewsComponent implements OnChanges {
  @Input() reviews: Review[] = [];
  averageRating = 0;
  ratingDistribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reviews'] && this.reviews) {
      this.calculateAverageRating();
      this.calculateRatingDistribution();
    }
  }

  private calculateAverageRating(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }
    const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
  }

  private calculateRatingDistribution(): void {
    this.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.reviews.forEach(review => {
      this.ratingDistribution[review.rating]++;
    });
  }

  getRatingPercentage(rating: number): number {
    if (this.reviews.length === 0) {
      return 0;
    }
    return (this.ratingDistribution[rating] / this.reviews.length) * 100;
  }
}
