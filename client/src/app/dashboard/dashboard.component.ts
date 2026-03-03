import { Component, OnInit } from '@angular/core';
import { SeatService } from '../services/seat.service';
import { MembershipService } from '../services/membership.service';
import { InventoryService } from '../services/inventory.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold mb-0"><i class="bi bi-speedometer2 me-2 text-primary"></i>Dashboard</h4>
      <span class="badge bg-primary px-3 py-2">{{today | date:'EEE, dd MMM yyyy'}}</span>
    </div>

    <!-- Occupancy row -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card stat-card p-3">
          <div class="text-muted small">Total Seats</div>
          <div class="h3 fw-bold mb-0 text-primary">{{occ?.totalSeats ?? '—'}}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stat-card p-3">
          <div class="text-muted small">Occupied Now</div>
          <div class="h3 fw-bold mb-0 text-danger">{{occ?.occupied ?? '—'}}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stat-card p-3">
          <div class="text-muted small">Available</div>
          <div class="h3 fw-bold mb-0 text-success">{{occ?.available ?? '—'}}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stat-card p-3">
          <div class="text-muted small">Occupancy Rate</div>
          <div class="h3 fw-bold mb-0 text-warning">{{occ?.occupancyRate ?? '—'}}</div>
        </div>
      </div>
    </div>

    <!-- Revenue row (admin+) -->
    <div class="row g-3 mb-4" *ngIf="auth.hasRole('admin')">
      <div class="col-md-4">
        <div class="card stat-card p-3 border-start border-success border-3">
          <div class="text-muted small">Total Revenue (All Time)</div>
          <div class="h3 fw-bold mb-0 text-success">₹{{rev?.summary?.totalRevenue | number:'1.0-0'}}</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card stat-card p-3 border-start border-danger border-3">
          <div class="text-muted small">Total Fines Collected</div>
          <div class="h3 fw-bold mb-0 text-danger">₹{{rev?.summary?.totalFines | number:'1.0-0'}}</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card stat-card p-3 border-start border-info border-3">
          <div class="text-muted small">Total Paid Subscriptions</div>
          <div class="h3 fw-bold mb-0 text-info">{{rev?.summary?.count}}</div>
        </div>
      </div>
    </div>

    <!-- Low stock alerts -->
    <div class="card border-warning mb-4" *ngIf="auth.hasRole('staff') && lowStockItems.length">
      <div class="card-header bg-warning text-dark fw-bold">
        <i class="bi bi-exclamation-triangle me-2"></i>Low Stock Alerts ({{lowStockItems.length}} items)
      </div>
      <ul class="list-group list-group-flush">
        <li *ngFor="let item of lowStockItems" class="list-group-item d-flex justify-content-between">
          <span>{{item.name}} <span class="badge bg-secondary">{{item.category}}</span></span>
          <span class="text-danger fw-bold">{{item.availableQuantity}} left (threshold: {{item.lowStockThreshold}})</span>
        </li>
      </ul>
    </div>

    <!-- Today's bookings -->
    <div class="card stat-card p-3" *ngIf="auth.hasRole('staff')">
      <div class="fw-bold mb-1"><i class="bi bi-calendar-check me-2 text-primary"></i>Today's Bookings</div>
      <div class="h4 text-primary">{{occ?.todayBookings ?? 0}}</div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  occ: any; rev: any; lowStockItems: any[] = [];
  today = new Date();

  constructor(
    private seatSvc: SeatService,
    private memSvc: MembershipService,
    private invSvc: InventoryService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    if (this.auth.hasRole('admin')) {
      this.seatSvc.occupancy().subscribe(r => this.occ = r.data);
      this.memSvc.revenueReport().subscribe(r => this.rev = r.data);
      this.invSvc.lowStock().subscribe(r => this.lowStockItems = r.data);
    } else if (this.auth.hasRole('staff')) {
      this.seatSvc.occupancy().subscribe(r => this.occ = r.data);
      this.invSvc.lowStock().subscribe(r => this.lowStockItems = r.data);
    }
  }
}
