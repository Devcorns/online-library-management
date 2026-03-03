import { Component, OnInit } from '@angular/core';
import { SeatService } from '../../services/seat.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-seat-list',
  template: `
    <h4 class="fw-bold mb-3"><i class="bi bi-grid-3x3-gap me-2 text-primary"></i>Seat Management</h4>

    <!-- Occupancy summary -->
    <div class="row g-3 mb-4" *ngIf="occupancy">
      <div class="col-auto"><div class="card stat-card p-3 text-center">
        <div class="text-muted small">Total</div><div class="h4 mb-0">{{occupancy.totalSeats}}</div>
      </div></div>
      <div class="col-auto"><div class="card stat-card p-3 text-center">
        <div class="text-muted small">Occupied</div><div class="h4 mb-0 text-danger">{{occupancy.occupied}}</div>
      </div></div>
      <div class="col-auto"><div class="card stat-card p-3 text-center">
        <div class="text-muted small">Available</div><div class="h4 mb-0 text-success">{{occupancy.available}}</div>
      </div></div>
      <div class="col-auto"><div class="card stat-card p-3 text-center">
        <div class="text-muted small">Rate</div><div class="h4 mb-0 text-warning">{{occupancy.occupancyRate}}</div>
      </div></div>
    </div>

    <!-- Add seat (admin) -->
    <div class="card stat-card mb-4" *ngIf="auth.hasRole('admin')">
      <div class="card-header bg-white fw-bold">Add Seat</div>
      <div class="card-body">
        <form [formGroup]="seatForm" (ngSubmit)="addSeat()" class="row g-2">
          <div class="col-md-3"><input class="form-control" formControlName="seatNumber" placeholder="Seat No. e.g. A-01"></div>
          <div class="col-md-3"><input class="form-control" formControlName="section" placeholder="Section e.g. Ground Floor"></div>
          <div class="col-md-4"><input class="form-control" formControlName="features" placeholder="Features (comma-separated)"></div>
          <div class="col-md-2"><button class="btn btn-primary w-100" type="submit">Add Seat</button></div>
        </form>
      </div>
    </div>

    <!-- Book a seat form -->
    <div class="card stat-card mb-4">
      <div class="card-header bg-white fw-bold">Book a Seat</div>
      <div class="card-body">
        <form [formGroup]="bookForm" (ngSubmit)="book()" class="row g-2">
          <div class="col-md-3">
            <select class="form-select" formControlName="seatId">
              <option value="">-- Select Seat --</option>
              <option *ngFor="let s of seats" [value]="s._id" [disabled]="!s.isAvailable">
                {{s.seatNumber}} ({{s.section}}) {{s.isAvailable ? '✓' : '✗ Occupied'}}
              </option>
            </select>
          </div>
          <div class="col-md-2"><input type="date" class="form-control" formControlName="date"></div>
          <div class="col-md-2"><input type="time" class="form-control" formControlName="startTime" placeholder="Start"></div>
          <div class="col-md-2"><input type="time" class="form-control" formControlName="endTime" placeholder="End"></div>
          <div class="col-md-3"><button class="btn btn-success w-100" type="submit">Book Seat</button></div>
        </form>
      </div>
    </div>

    <!-- Seats grid -->
    <h6 class="fw-bold mt-4 mb-2">All Seats</h6>
    <div class="row g-2 mb-4">
      <div class="col-6 col-md-2" *ngFor="let s of seats">
        <div class="card text-center p-2" [ngClass]="s.isAvailable ? 'border-success' : 'border-danger'">
          <div class="fw-bold">{{s.seatNumber}}</div>
          <div class="small text-muted">{{s.section}}</div>
          <span class="badge mt-1" [ngClass]="s.isAvailable ? 'bg-success' : 'bg-danger'">
            {{s.isAvailable ? 'Free' : 'Occupied'}}
          </span>
        </div>
      </div>
    </div>

    <!-- All bookings (staff+) -->
    <div *ngIf="auth.hasRole('staff')">
      <h6 class="fw-bold mb-2">All Bookings</h6>
      <div class="card stat-card">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Seat</th><th>User</th><th>Date</th><th>Slot</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of bookings">
                <td>{{b.seat?.seatNumber}}</td>
                <td>{{b.user?.name}}</td>
                <td>{{b.date | date:'dd/MM/yy'}}</td>
                <td>{{b.timeSlot?.start}} – {{b.timeSlot?.end}}</td>
                <td><span class="badge"
                  [ngClass]="{'bg-primary': b.status==='booked', 'bg-success': b.status==='checked_in',
                              'bg-secondary': b.status==='checked_out', 'bg-danger': b.status==='cancelled'}">
                  {{b.status}}</span>
                </td>
                <td>
                  <button *ngIf="b.status==='booked'" class="btn btn-sm btn-primary me-1" (click)="checkIn(b._id)">Check In</button>
                  <button *ngIf="b.status==='checked_in'" class="btn btn-sm btn-warning me-1" (click)="checkOut(b._id)">Check Out</button>
                  <button *ngIf="b.status==='booked'" class="btn btn-sm btn-outline-danger" (click)="cancel(b._id)">Cancel</button>
                </td>
              </tr>
              <tr *ngIf="!bookings.length"><td colspan="6" class="text-center text-muted py-3">No bookings.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SeatListComponent implements OnInit {
  seats: any[] = [];
  bookings: any[] = [];
  occupancy: any;

  seatForm = this.fb.group({
    seatNumber: ['', Validators.required],
    section: ['General'],
    features: ['']
  });
  bookForm = this.fb.group({
    seatId: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    startTime: ['09:00', Validators.required],
    endTime: ['13:00', Validators.required]
  });

  constructor(private svc: SeatService, private toast: ToastService, public auth: AuthService, private fb: FormBuilder) {}

  ngOnInit() {
    this.loadSeats();
    if (this.auth.hasRole('admin')) this.svc.occupancy().subscribe(r => this.occupancy = r.data);
    if (this.auth.hasRole('staff')) this.svc.getAllBookings().subscribe(r => this.bookings = r.data);
  }

  loadSeats() { this.svc.getSeats().subscribe(r => this.seats = r.data); }

  addSeat() {
    if (this.seatForm.invalid) return;
    const val = this.seatForm.value;
    const body = { ...val, features: val.features ? String(val.features).split(',').map((s: string) => s.trim()) : [] };
    this.svc.createSeat(body).subscribe({
      next: () => { this.toast.success('Seat added!'); this.loadSeats(); this.seatForm.reset({ section: 'General' }); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }

  book() {
    if (this.bookForm.invalid) return;
    this.svc.book(this.bookForm.value).subscribe({
      next: () => { this.toast.success('Seat booked!'); this.loadSeats(); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }

  checkIn(id: string) { this.svc.checkIn(id).subscribe({ next: () => { this.toast.success('Checked in!'); this.refreshBookings(); }, error: (e: any) => this.toast.error(e.error?.message) }); }
  checkOut(id: string) { this.svc.checkOut(id).subscribe({ next: () => { this.toast.success('Checked out!'); this.refreshBookings(); this.loadSeats(); }, error: (e: any) => this.toast.error(e.error?.message) }); }
  cancel(id: string) { this.svc.cancel(id).subscribe({ next: () => { this.toast.success('Cancelled!'); this.refreshBookings(); }, error: (e: any) => this.toast.error(e.error?.message) }); }

  refreshBookings() { this.svc.getAllBookings().subscribe(r => this.bookings = r.data); }
}
