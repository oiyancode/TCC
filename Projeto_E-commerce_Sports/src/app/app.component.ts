import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroComponent } from './components/hero/hero.component';
import { NewsComponent } from './components/news/news.component';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, HeroComponent, NewsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent implements OnInit {
  title = 'ideia-tcc';

  async ngOnInit() {
    try {
      const res = await fetch('assets/design-tokens.json');
      if (res.ok) {
        const tokens = await res.json();
        const root = document.documentElement;
        Object.entries(tokens).forEach(([k, v]) => {
          root.style.setProperty(`--${k}`, String(v));
        });
      }
    } catch {}
  }
}
