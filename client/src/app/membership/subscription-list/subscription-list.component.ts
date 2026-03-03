import { Component, OnInit } from '@angular/core';
import { MembershipService } from '../../services/membership.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-subscription-list',
  template: `
    <h4 class="fw-bold mb-4"><i class="bi bi-credit-card me-2 text-primary"></i>Memberships & Subscriptions</h4>

    <!-- Create Subscription -->
    <div class="card stat-card mb-4">
      <div class="card-header bg-white fw-bold">New / Renew Subscription</div>
      <div class="card-body">
        <form [formGroup]="subForm" (ngSubmit)="createSub()" class="row g-2">
          <div class="col-md-3">
            <input class="form-control" placeholder="User ID or search email"
                   formControlName="userId">
          </div>
          <div class="col-md-3">
            <select class="form-select" formControlName="planId">
              <option value="">-- Select Plan --</option>
              <option *ngFor="let p of plans" [value]="p._id">{{p.name}} (₹{{p.fee}}/{{p.planType}})</option>
            </select>
          </div>
          <div class="col-md-3">
            <input type="date" class="form-control" formControlName="startDate">
          </div>
          <div class="col-md-3 d-flex gap-2">
            <button class="btn btn-primary flex-fill" type="submit">Create</button>
            <button class="btn btn-outline-secondary flex-fill" type="button" (click)="renewSub()">Renew</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Pay subscription -->
    <div class="card stat-card mb-4">
      <div class="card-header bg-white fw-bold">Record Payment</div>
      <div class="card-body">
        <form [formGroup]="payForm" (ngSubmit)="pay()" class="row g-2">
          <div class="col-md-3">
            <input class="form-control" formControlName="subscriptionId" placeholder="Subscription ID">
          </div>
          <div class="col-md-2">
            <input type="number" class="form-control" formControlName="amount" placeholder="Amount ₹">
          </div>
          <div class="col-md-3">
            <select class="form-select" formControlName="paymentMethod">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div class="col-md-2">
            <input class="form-control" formControlName="notes" placeholder="Notes (optional)">
          </div>
          <div class="col-md-2">
            <button class="btn btn-success w-100" type="submit">Pay & Receipt</button>
          </div>
        </form>
        <div class="alert alert-info mt-2 py-2 small" *ngIf="payResult">
          {{payResult.message}} | Receipt: <strong>{{payResult.data?.payment?.receiptNumber}}</strong>
          | Fine applied: <strong>₹{{payResult.data?.subscription?.fineAmount}}</strong>
        </div>
      </div>
    </div>

    <!-- Subscription list -->
    <div class="card stat-card">
      <div class="card-header bg-white d-flex justify-content-between">
        <span class="fw-bold">Subscriptions</span>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm" [(ngModel)]="statusFilter" (change)="loadSubs()">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <select class="form-select form-select-sm" [(ngModel)]="payFilter" (change)="loadSubs()">
            <option value="">All Payment</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>User</th><th>Plan</th><th>Start</th><th>End</th><th>Fee Due</th>
                <th>Amount</th><th>Fine</th><th>Payment</th><th>Status</th><th>Receipt</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of subscriptions">
              <td>{{s.user?.name || s.user}}</td>
              <td>{{s.plan?.name || s.plan}}</td>
              <td>{{s.startDate | date:'dd/MM/yy'}}</td>
              <td>{{s.endDate | date:'dd/MM/yy'}}</td>
              <td>{{s.feeDueDate | date:'dd/MM/yy'}}</td>
              <td>₹{{s.amountDue}}</td>
              <td class="text-danger">₹{{s.fineAmount}}</td>
              <td>
                <span class="badge"
                  [ngClass]="{'bg-success': s.paymentStatus==='paid', 'bg-danger': s.paymentStatus==='unpaid',
                              'bg-warning text-dark': s.paymentStatus==='partial', 'bg-secondary': s.paymentStatus==='overdue'}">
                  {{s.paymentStatus}}
                </span>
              </td>
              <td><span class="badge" [ngClass]="s.status==='active'?'bg-success':'bg-secondary'">{{s.status}}</span></td>
              <td class="small text-muted">{{s.receiptNumber || '—'}}</td>
            </tr>
            <tr *ngIf="!subscriptions.length">
              <td colspan="10" class="text-center text-muted py-4">No subscriptions found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SubscriptionListComponent implements OnInit {
  subscriptions: any[] = [];
  plans: any[] = [];
  statusFilter = ''; payFilter = '';
  payResult: any = null;

  subForm = this.fb.group({
    userId: ['', Validators.required],
    planId: ['', Validators.required],
    startDate: ['']
  });
  payForm = this.fb.group({
    subscriptionId: ['', Validators.required],
    amount: ['', Validators.required],
    paymentMethod: ['cash'],
    notes: ['']
  });

  constructor(private svc: MembershipService, private toast: ToastService, private fb: FormBuilder) {}

  ngOnInit() { this.loadSubs(); this.svc.getPlans().subscribe(r => this.plans = r.data); }

  loadSubs() {
    const p: any = {};
    if (this.statusFilter) p['status'] = this.statusFilter;
    if (this.payFilter) p['paymentStatus'] = this.payFilter;
    this.svc.getAll(p).subscribe(r => this.subscriptions = r.data);
  }

  createSub() {
    if (this.subForm.invalid) return;
    this.svc.create(this.subForm.value).subscribe({
      next: () => { this.toast.success('Subscription created!'); this.loadSubs(); this.subForm.reset(); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }

  renewSub() {
    const { userId, planId } = this.subForm.value;
    if (!userId || !planId) { this.toast.warning('Provide User ID and Plan'); return; }
    this.svc.renew({ userId, planId }).subscribe({
      next: () => { this.toast.success('Subscription renewed!'); this.loadSubs(); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }

  pay() {
    if (this.payForm.invalid) return;
    this.svc.recordPayment(this.payForm.value).subscribe({
      next: (r: any) => { this.payResult = r; this.toast.success(r.message); this.loadSubs(); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }
}
