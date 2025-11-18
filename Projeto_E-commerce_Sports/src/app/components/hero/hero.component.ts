import { Component } from '@angular/core';
import { ThreeViewerComponent } from '../three-viewer/three-viewer.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [ThreeViewerComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {

}
