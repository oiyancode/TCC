import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="currentToast" class="toast" [ngClass]="currentToast.type">
      <div class="toast-content">
        {{ currentToast.message }}
      </div>
      <button class="toast-close" (click)="close()">×</button>
    </div>
  `,
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  currentToast: Toast | null = null;
  private subscription: Subscription = new Subscription();
  private timeoutId: any;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      this.currentToast = toast;
      
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      if (toast.duration) {
        this.timeoutId = setTimeout(() => {
          this.close();
        }, toast.duration);
      }
    });
  }

  close() {
    this.currentToast = null;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
