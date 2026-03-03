import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div *ngFor="let t of toasts; let i = index"
           class="toast show align-items-center text-white border-0"
           [ngClass]="'bg-' + t.type">
        <div class="d-flex">
          <div class="toast-body">{{t.message}}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto"
                  (click)="remove(i)"></button>
        </div>
      </div>
    </div>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub!: Subscription;

  constructor(private ts: ToastService) {}

  ngOnInit() {
    this.sub = this.ts.toasts$.subscribe(t => {
      this.toasts.push(t);
      setTimeout(() => this.remove(this.toasts.indexOf(t)), 4000);
    });
  }

  remove(i: number) { this.toasts.splice(i, 1); }

  ngOnDestroy() { this.sub.unsubscribe(); }
}
