import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HeroComponent } from '../hero/hero.component';
import { NewsComponent } from '../news/news.component';
import { HorizontalScrollComponent } from '../horizontal-scroll/horizontal-scroll.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, HeroComponent, NewsComponent, HorizontalScrollComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <app-hero></app-hero>
    <app-news></app-news>
    <app-horizontal-scroll></app-horizontal-scroll>
    <app-footer></app-footer>
  `,
  styles: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent {}
