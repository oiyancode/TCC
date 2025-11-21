import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HeroComponent } from '../hero/hero.component';
import { NewsComponent } from '../news/news.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, HeroComponent, NewsComponent],
  template: `
    <app-navbar></app-navbar>
    <app-hero></app-hero>
    <app-news></app-news>
  `,
  styles: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent {}
