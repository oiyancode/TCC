import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeViewerComponent } from '../three-viewer/three-viewer.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ThreeViewerComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {}
