import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderService } from '../../services/order.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { LoadingComponent } from '../loading/loading.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders-history',
  standalone: true,
  imports: [CommonModule, NavbarComponent, LoadingComponent, RouterModule],
  templateUrl: './orders-history.component.html',
  styleUrls: ['./orders-history.component.scss']
})
export class OrdersHistoryComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  constructor(private orderService: OrderService, private router: Router) { }

  ngOnInit(): void {
    this.orderService.getUserOrders().subscribe(orders => {
      this.orders = orders.sort((a, b) => b.date.getTime() - a.date.getTime());
      this.isLoading = false;
    });
  }



  trackOrder(orderId: number): void {
    this.router.navigate(['/order-tracking'], { queryParams: { orderId: orderId } });
  }
}
