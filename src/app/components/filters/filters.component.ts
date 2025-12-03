import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterOptions, SortOptions } from '../../services/products.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit {
  @Input() initialCategory?: 'tenis' | 'skate' | 'basket';
  @Output() filtersChange = new EventEmitter<FilterOptions>();
  @Output() sortChange = new EventEmitter<SortOptions>();

  showFilterMenu = false;

  // Filter state
  priceRange = { min: 0, max: 1000 };
  selectedSizes: number[] = [];
  selectedRating = 0;

  // Sort state
  currentSort: SortOptions = { sortBy: 'popularity', order: 'desc' };

  // Available options
  availableSizes = [37, 38, 39, 40, 41, 42];

  ngOnInit(): void {
    if (this.initialCategory) {
      // A lógica para lidar com a categoria inicial será implementada aqui
      // Por exemplo, pode-se mapear a categoria para um filtro específico
    }
  }

  toggleFilterMenu() {
    this.showFilterMenu = !this.showFilterMenu;
  }

  applyFilters(closeMenu: boolean = true) {
    const filters: FilterOptions = {
      priceRange: this.priceRange,
      sizes: this.selectedSizes,
      rating: this.selectedRating > 0 ? this.selectedRating : undefined,
    };
    this.filtersChange.emit(filters);
    if (closeMenu) {
      this.showFilterMenu = false;
    }
  }

  clearFilters() {
    this.priceRange = { min: 0, max: 1000 };
    this.selectedSizes = [];
    this.selectedRating = 0;
    this.applyFilters();
  }

  toggleSize(size: number) {
    const index = this.selectedSizes.indexOf(size);
    if (index > -1) {
      this.selectedSizes.splice(index, 1);
    } else {
      this.selectedSizes.push(size);
    }
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  setSort(sortBy: 'price' | 'popularity' | 'newest' | 'rating') {
    if (this.currentSort.sortBy === sortBy) {
      this.currentSort.order =
        this.currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.sortBy = sortBy;
      this.currentSort.order = 'desc';
    }
    this.sortChange.emit(this.currentSort);
  }
}
