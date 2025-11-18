import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swiper from 'swiper';
import { Navigation, Keyboard, A11y } from 'swiper/modules';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent implements AfterViewInit {
  slides: { name: string; price: string; imageSrc: string; variant: 'skate' | 'basket' | 'tenis' }[] = [
    { name: 'GREEN DROP', price: 'R$229,90', imageSrc: '/assets/section_news/Skate_01.png', variant: 'skate' },
    { name: 'GREEN DROP', price: 'R$229,90', imageSrc: '/assets/section_news/Skate_01.png', variant: 'skate' },
    { name: 'GREEN DROP', price: 'R$229,90', imageSrc: '/assets/section_news/Skate_01.png', variant: 'skate' },
    { name: 'GREEN DROP', price: 'R$229,90', imageSrc: '/assets/section_news/Skate_01.png', variant: 'skate' },
    { name: 'GREEN DROP', price: 'R$229,90', imageSrc: '/assets/section_news/Skate_01.png', variant: 'skate' },
    { name: 'GREEN DROP', price: 'R$229,90', imageSrc: '/assets/section_news/Skate_01.png', variant: 'skate' },
    { name: 'GREEN DROP', price: 'R$229,90', imageSrc: '/assets/section_news/Skate_01.png', variant: 'skate' },
    { name: 'GREEN DROP', price: 'R$229,90', imageSrc: '/assets/section_news/Skate_01.png', variant: 'skate' },
    { name: 'GREEN DROP', price: 'R$229,90', imageSrc: '/assets/section_news/Skate_01.png', variant: 'skate' },
  ];

  @ViewChild('popularSwiperRef', { static: true }) popularSwiperRef!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    new Swiper(this.popularSwiperRef.nativeElement, {
      modules: [Navigation, Keyboard, A11y],
      slidesPerView: 4,
      spaceBetween: 16,
      navigation: { prevEl: '#popular-prev', nextEl: '#popular-next' },
      keyboard: { enabled: true },
      a11y: { enabled: true },
      allowTouchMove: true,
      grabCursor: true,
      watchOverflow: true,
      loop: false,
      breakpoints: {
        1280: { slidesPerView: 4 },
        1024: { slidesPerView: 3 },
        768: { slidesPerView: 2 },
        0: { slidesPerView: 1 },
      },
    });
  }
}
