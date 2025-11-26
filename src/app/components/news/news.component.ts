import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Swiper from 'swiper';
import { Navigation, Keyboard, A11y } from 'swiper/modules';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductsService, Product } from '../../services/products.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss',
})
export class NewsComponent implements OnInit, AfterViewInit, OnDestroy {
  products: Product[] = [];

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.productsService.getProducts().subscribe((products: Product[]) => {
      this.products = products;
    });
  }

  @ViewChild('popularSwiperRef', { static: true })
  popularSwiperRef!: ElementRef<HTMLDivElement>;
  @ViewChild('prevBtnRef', { static: false })
  prevBtnRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('nextBtnRef', { static: false })
  nextBtnRef?: ElementRef<HTMLButtonElement>;

  private swiper?: Swiper;
  private resizeHandler?: () => void;
  private navVerticalOffset = 12;

  ngAfterViewInit() {
    this.swiper = new Swiper(this.popularSwiperRef.nativeElement, {
      modules: [Navigation, Keyboard, A11y],
      slidesPerView: 4,
      spaceBetween: 16,
      navigation: { prevEl: '#popular-prev', nextEl: '#popular-next' },
      keyboard: { enabled: true },
      a11y: { enabled: true },
      allowTouchMove: true,
      grabCursor: true,
      watchOverflow: true,
      loop: true,
      freeMode: true,

      breakpoints: {
        1280: { slidesPerView: 4 },
        1024: { slidesPerView: 3 },
        768: { slidesPerView: 2 },
        0: { slidesPerView: 1 },
      },
      on: {
        init: () => this.updateNavButtonsPosition(),
        slideChange: () => this.updateNavButtonsPosition(),
        resize: () => this.updateNavButtonsPosition(),
        update: () => this.updateNavButtonsPosition(),
      },
    });

    this.resizeHandler = () => this.updateNavButtonsPosition();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy() {
    if (this.resizeHandler)
      window.removeEventListener('resize', this.resizeHandler);
  }

  private updateNavButtonsPosition() {
    const container = this.popularSwiperRef?.nativeElement;
    if (!container) return;
    const canvases = container.querySelectorAll(
      '.swiper-slide.swiper-slide-visible .news__canvas'
    );
    const targetEls = canvases.length
      ? canvases
      : container.querySelectorAll('.swiper-slide.swiper-slide-visible');
    if (!targetEls.length) return;
    const cr = container.getBoundingClientRect();
    let minTop = Number.POSITIVE_INFINITY;
    let maxBottom = Number.NEGATIVE_INFINITY;
    targetEls.forEach((el) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      const top = r.top - cr.top;
      const bottom = r.bottom - cr.top;
      if (top < minTop) minTop = top;
      if (bottom > maxBottom) maxBottom = bottom;
    });
    const center =
      Math.round((minTop + maxBottom) / 2) + this.navVerticalOffset;
    const prev = document.getElementById(
      'popular-prev'
    ) as HTMLButtonElement | null;
    const next = document.getElementById(
      'popular-next'
    ) as HTMLButtonElement | null;
    const prevCol = prev?.parentElement as HTMLElement | null;
    const nextCol = next?.parentElement as HTMLElement | null;
    const prevColRect = prevCol?.getBoundingClientRect();
    const nextColRect = nextCol?.getBoundingClientRect();
    const topPrev = prevColRect ? center + cr.top - prevColRect.top : center;
    const topNext = nextColRect ? center + cr.top - nextColRect.top : center;
    if (prev) {
      prev.style.top = `${topPrev}px`;
      prev.style.transform = 'translateY(-50%)';
    }
    if (next) {
      next.style.top = `${topNext}px`;
      next.style.transform = 'translateY(-50%)';
    }
  }
}
