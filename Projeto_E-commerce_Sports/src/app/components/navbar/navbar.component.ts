import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  cartItemCount: string = '[00]';

  private subscription: Subscription = new Subscription();

  constructor(private router: Router, private cartService: CartService) {}

  ngOnInit() {
    this.subscription.add(
      this.cartService.cartItemCount$.subscribe((count) => {
        this.cartItemCount = count < 10 ? `[0${count}]` : `[${count}]`;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
