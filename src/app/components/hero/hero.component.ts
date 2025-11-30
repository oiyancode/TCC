import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeViewerComponent } from '../three-viewer/three-viewer.component';
import gsap from 'gsap';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ThreeViewerComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements AfterViewInit {
  
  ngAfterViewInit() {
    gsap.from('.hero__headline', {
      duration: 1,
      x: 0,
      scale: 0.2,
      autoAlpha: 0,
      ease: "back.out(1.7)",
      delay: 0.5 // Pequeno delay para garantir que a página carregou
    });
  }
}
