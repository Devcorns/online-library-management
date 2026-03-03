import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../services/inventory.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../core/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-inventory',
  template: `
    <h4 class="fw-bold mb-3"><i class="bi bi-box-seam me-2 text-primary"></i>Inventory Management</h4>

    <!-- Low stock alerts -->
    <div class="alert alert-warning d-flex align-items-center mb-3" *ngIf="lowStockItems.length">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <span>{{lowStockItems.length}} item(s) are low on stock!</span>
    </div>

    <!-- Add item (admin) -->
    <div class="card stat-card mb-4" *ngIf="auth.hasRole('admin')">
      <div class="card-header bg-white fw-bold">{{editId ? 'Edit Item' : 'Add Inventory Item'}}</div>
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="submit()" class="row g-2">
          <div class="col-md-3"><input class="form-control" formControlName="name" placeholder="Item name"></div>
          <div class="col-md-2">
            <select class="form-select" formControlName="category">
              <option value="magazine">Magazine</option>
              <option value="locker">Locker</option>
              <option value="device">Device</option>
              <option value="stationery">Stationery</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="col-md-2"><input type="number" class="form-control" formControlName="totalQuantity" placeholder="Total Qty"></div>
          <div class="col-md-2"><input type="number" class="form-control" formControlName="lowStockThreshold" placeholder="Low stock at"></div>
          <div class="col-md-2"><input class="form-control" formControlName="location" placeholder="Location"></div>
          <div class="col-md-1">
            <button class="btn btn-primary w-100" type="submit">{{editId ? '✓' : 'Add'}}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Items table -->
    <div class="card stat-card mb-4">
      <div class="card-header bg-white fw-bold">Items</div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Name</th><th>Category</th><th>Total</th><th>Available</th><th>Location</th><th>Low Stock</th><th *ngIf="auth.hasRole('admin')">Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items" [ngClass]="{'table-warning': item.isLowStock}">
              <td class="fw-bold">{{item.name}}</td>
              <td><span class="badge bg-secondary">{{item.category}}</span></td>
              <td>{{item.totalQuantity}}</td>
              <td>{{item.availableQuantity}}</td>
              <td class="text-muted small">{{item.location || '—'}}</td>
              <td>
                <span *ngIf="item.isLowStock" class="badge bg-warning text-dark">Low Stock</span>
                <span *ngIf="!item.isLowStock" class="badge bg-success">OK</span>
              </td>
              <td *ngIf="auth.hasRole('admin')">
                <button class="btn btn-sm btn-outline-primary me-1" (click)="edit(item)">Edit</button>
              </td>
            </tr>
            <tr *ngIf="!items.length"><td colspan="7" class="text-center text-muted py-3">No items.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Requisitions -->
    <div class="card stat-card">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <span class="fw-bold">Requisitions</span>
        <button class="btn btn-sm btn-outline-primary" (click)="showReqForm = !showReqForm">
          + New Requisition
        </button>
      </div>
      <div class="card-body" *ngIf="showReqForm">
        <form [formGroup]="reqForm" (ngSubmit)="createReq()" class="row g-2">
          <div class="col-md-3">
            <select class="form-select" formControlName="item">
              <option value="">-- Select Item --</option>
              <option *ngFor="let i of items" [value]="i._id">{{i.name}}</option>
            </select>
          </div>
          <div class="col-md-2"><input type="number" class="form-control" formControlName="requestedQuantity" placeholder="Qty"></div>
          <div class="col-md-5"><input class="form-control" formControlName="reason" placeholder="Reason for requisition"></div>
          <div class="col-md-2"><button class="btn btn-success w-100" type="submit">Submit</button></div>
        </form>
      </div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Item</th><th>Qty</th><th>Reason</th><th>Requested By</th><th>Status</th><th *ngIf="auth.hasRole('admin')">Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of requisitions">
              <td>{{r.item?.name}}</td>
              <td>{{r.requestedQuantity}}</td>
              <td>{{r.reason}}</td>
              <td>{{r.requestedBy?.name}}</td>
              <td>
                <span class="badge"
                  [ngClass]="{'bg-warning text-dark': r.status==='pending', 'bg-success': r.status==='approved'||r.status==='fulfilled',
                              'bg-danger': r.status==='rejected'}">{{r.status}}</span>
              </td>
              <td *ngIf="auth.hasRole('admin')">
                <ng-container *ngIf="r.status==='pending'">
                  <button class="btn btn-sm btn-success me-1" (click)="reviewReq(r._id,'approved')">Approve</button>
                  <button class="btn btn-sm btn-danger" (click)="reviewReq(r._id,'rejected')">Reject</button>
                </ng-container>
              </td>
            </tr>
            <tr *ngIf="!requisitions.length"><td colspan="6" class="text-center text-muted py-3">No requisitions.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class InventoryComponent implements OnInit {
  items: any[] = [];
  requisitions: any[] = [];
  lowStockItems: any[] = [];
  showReqForm = false;
  editId = '';

  form = this.fb.group({
    name: ['', Validators.required],
    category: ['other'],
    totalQuantity: [0, Validators.required],
    lowStockThreshold: [5],
    location: ['']
  });
  reqForm = this.fb.group({
    item: ['', Validators.required],
    requestedQuantity: [1, Validators.required],
    reason: ['', Validators.required]
  });

  constructor(private svc: InventoryService, private toast: ToastService,
              public auth: AuthService, private fb: FormBuilder) {}

  ngOnInit() { this.loadItems(); this.loadReqs(); }

  loadItems() {
    this.svc.getItems().subscribe(r => this.items = r.data);
    this.svc.lowStock().subscribe(r => this.lowStockItems = r.data);
  }
  loadReqs() { this.svc.getRequisitions().subscribe(r => this.requisitions = r.data); }

  submit() {
    if (this.form.invalid) return;
    const body = { ...this.form.value, availableQuantity: this.form.value.totalQuantity };
    const req = this.editId
      ? this.svc.updateItem(this.editId, this.form.value)
      : this.svc.createItem(body);
    req.subscribe({
      next: () => { this.toast.success('Saved!'); this.loadItems(); this.editId = ''; this.form.reset({ category: 'other', lowStockThreshold: 5 }); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }

  edit(item: any) { this.editId = item._id; this.form.patchValue(item); }

  createReq() {
    if (this.reqForm.invalid) return;
    this.svc.createRequisition(this.reqForm.value).subscribe({
      next: () => { this.toast.success('Requisition submitted!'); this.loadReqs(); this.showReqForm = false; this.reqForm.reset({ requestedQuantity: 1 }); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }

  reviewReq(id: string, status: string) {
    this.svc.reviewRequisition(id, { status }).subscribe({
      next: () => { this.toast.success(`Requisition ${status}!`); this.loadItems(); this.loadReqs(); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }
}
