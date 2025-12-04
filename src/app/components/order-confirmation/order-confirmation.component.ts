import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Order, OrderService } from '../../services/order.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, NavbarComponent, LoadingComponent],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | undefined;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (orderId) {
      this.orderService.getOrderById(+orderId).subscribe(order => {
        if (order) {
          this.order = order;
        } else {
          this.error = 'Pedido não encontrado.';
        }
        this.isLoading = false;
      });
    } else {
      this.error = 'ID do pedido não fornecido.';
      this.isLoading = false;
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  navigateToTracking(): void {
    if (this.order) {
      this.router.navigate(['/order-tracking'], { queryParams: { orderId: this.order.id } });
    }
  }
}
