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

export type OrderStatus =
  | 'pendente'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

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
  providedIn: 'root',
})
export class OrderService {
  private orders: Order[] = [];
  private nextOrderId = 1;
  private readonly STORAGE_KEY = 'ford_orders';
  private readonly NEXT_ID_KEY = 'ford_next_order_id';
  private readonly VERSION_KEY = 'ford_orders_version';
  private readonly CURRENT_VERSION = '2.0'; // Increment this when Order structure changes

  constructor() {
    this.loadOrdersFromStorage();
  }

  private loadOrdersFromStorage(): void {
    try {
      // Check version first
      const storedVersion = localStorage.getItem(this.VERSION_KEY);
      
      if (storedVersion !== this.CURRENT_VERSION) {
        console.log(
          `[OrderService] Cache version mismatch (stored: ${storedVersion}, current: ${this.CURRENT_VERSION}). Clearing old data.`
        );
        this.clearCache();
        return;
      }

      const storedOrders = localStorage.getItem(this.STORAGE_KEY);
      const storedNextId = localStorage.getItem(this.NEXT_ID_KEY);

      if (storedOrders) {
        this.orders = JSON.parse(storedOrders).map((order: any) => ({
          ...order,
          date: new Date(order.date),
          items: order.items.map((item: any) => ({
            ...item,
            price:
              typeof item.price === 'string'
                ? parseFloat(
                    item.price.replace(/[^0-9,]/g, '').replace(',', '.')
                  ) || 0
                : item.price,
          })),
        }));
      }

      if (storedNextId) {
        this.nextOrderId = parseInt(storedNextId, 10);
      }
    } catch (error) {
      console.error(
        '[OrderService] Error loading orders from localStorage:',
        error
      );
      this.clearCache();
    }
  }

  private clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.NEXT_ID_KEY);
    localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
    this.orders = [];
    this.nextOrderId = 1;
  }

  private saveOrdersToStorage(): void {
    try {
      const cleanOrders = this.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        date: order.date,
        total: order.total,
        status: order.status,
        shippingAddress: { ...order.shippingAddress },
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          price:
            typeof item.price === 'number'
              ? item.price
              : parseFloat(String(item.price).replace(/[^0-9.-]/g, '')) || 0,
          quantity: item.quantity,
          size: item.size,
          imageSrc: item.imageSrc,
        })),
      }));

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanOrders));
      localStorage.setItem(this.NEXT_ID_KEY, this.nextOrderId.toString());
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
    } catch (error) {
      console.error(
        '[OrderService] Error saving orders to localStorage:',
        error
      );
    }
  }

  createOrder(orderData: OrderData): Observable<Order> {
    const newOrder: Order = {
      id: this.nextOrderId++,
      orderNumber: `FORD-${new Date().getTime()}`,
      date: new Date(),
      items: orderData.items,
      total: orderData.total,
      status: 'pendente',
      shippingAddress: orderData.shippingAddress,
    };
    this.orders.push(newOrder);
    this.saveOrdersToStorage();
    return of(newOrder);
  }

  getUserOrders(): Observable<Order[]> {
    return of(this.orders);
  }

  getOrderById(id: number): Observable<Order | undefined> {
    return of(this.orders.find((o) => o.id === id));
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<boolean> {
    const orderIndex = this.orders.findIndex((o) => o.id === id);
    if (orderIndex > -1) {
      this.orders[orderIndex].status = status;
      this.saveOrdersToStorage();
      return of(true);
    }
    return of(false);
  }
}
