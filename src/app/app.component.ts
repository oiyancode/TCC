import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
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
    } catch (error) {
      console.error('Failed to load design tokens:', error);
    }
  }
}
