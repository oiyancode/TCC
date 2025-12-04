import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Order, OrderService, OrderStatus } from '../../services/order.service';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { NavbarComponent } from '../navbar/navbar.component';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, NavbarComponent, LoadingComponent],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
})
export class OrderTrackingComponent implements OnInit {
  order$: Observable<Order | undefined> | undefined;
  allStatuses: OrderStatus[] = [
    'pendente',
    'processing',
    'shipped',
    'delivered',
  ];

  statusLabels: { [key in OrderStatus]: string } = {
    pendente: 'Pendente',
    processing: 'Processando',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.order$ = this.route.queryParamMap.pipe(
      switchMap((params) => {
        const orderId = params.get('orderId');
        if (orderId) {
          return this.orderService.getOrderById(+orderId);
        }
        return of(undefined);
      })
    );
  }

  getStatusIndex(status: OrderStatus): number {
    return this.allStatuses.indexOf(status);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
}
