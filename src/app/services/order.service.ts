import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CartItem } from './cart.service';

export interface OrderData {
  items: CartItem[];
  total: number;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    zip: string;
    address: string;
    country: string;
    city: string;
  };
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  orderNumber: string;
  date: Date;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: {
    name: string;
    zip: string;
    address: string;
    country: string;
    city: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orders: Order[] = [];
  private nextOrderId = 1;

  constructor() { }

  createOrder(orderData: OrderData): Observable<Order> {
    const newOrder: Order = {
      id: this.nextOrderId++,
      orderNumber: `FORD-${new Date().getTime()}`,
      date: new Date(),
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      shippingAddress: orderData.shippingAddress
    };
    this.orders.push(newOrder);
    // In a real app, this would be an HTTP POST request to a backend
    return of(newOrder);
  }

  getUserOrders(): Observable<Order[]> {
    // In a real app, this would be an HTTP GET request
    return of(this.orders);
  }

  getOrderById(id: number): Observable<Order | undefined> {
    const order = this.orders.find(o => o.id === id);
    return of(order);
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<boolean> {
    const orderIndex = this.orders.findIndex(o => o.id === id);
    if (orderIndex > -1) {
      this.orders[orderIndex].status = status;
      return of(true);
    }
    return of(false);
  }
}
