import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold mb-0"><i class="bi bi-people me-2 text-primary"></i>User Management</h4>
    </div>

    <!-- Filters -->
    <div class="card p-3 mb-3">
      <div class="row g-2">
        <div class="col-md-4">
          <input class="form-control" placeholder="Search name / email..." [(ngModel)]="search"
                 (input)="load()">
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="roleFilter" (change)="load()">
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="statusFilter" (change)="load()">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card stat-card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th><th>Name</th><th>Email</th><th>Role</th>
              <th>Status</th><th>Approved</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users; let i = index">
              <td>{{i+1}}</td>
              <td>{{u.name}}</td>
              <td>{{u.email}}</td>
              <td><span class="badge bg-secondary">{{u.role}}</span></td>
              <td>
                <span class="badge"
                  [ngClass]="{
                    'badge-active': u.membershipStatus==='active',
                    'badge-expired': u.membershipStatus==='expired',
                    'badge-pending': u.membershipStatus==='pending',
                    'badge-suspended': u.membershipStatus==='suspended'
                  }">{{u.membershipStatus}}</span>
              </td>
              <td>
                <i class="bi" [ngClass]="u.isApproved ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'"></i>
              </td>
              <td>
                <button *ngIf="!u.isApproved" class="btn btn-xs btn-success btn-sm me-1"
                        (click)="approve(u._id)">Approve</button>
                <button *ngIf="auth.hasRole('admin')" class="btn btn-sm me-1"
                        [ngClass]="u.isActive ? 'btn-warning' : 'btn-outline-success'"
                        (click)="toggle(u._id)">
                  {{u.isActive ? 'Suspend' : 'Reactivate'}}
                </button>
              </td>
            </tr>
            <tr *ngIf="!users.length">
              <td colspan="7" class="text-center text-muted py-4">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  search = ''; roleFilter = ''; statusFilter = '';

  constructor(private svc: UserService, private toast: ToastService, public auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    const p: any = {};
    if (this.search) p['search'] = this.search;
    if (this.roleFilter) p['role'] = this.roleFilter;
    if (this.statusFilter) p['membershipStatus'] = this.statusFilter;
    this.svc.getAll(p).subscribe(r => this.users = r.data);
  }

  approve(id: string) {
    this.svc.approve(id).subscribe({
      next: () => { this.toast.success('User approved!'); this.load(); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }

  toggle(id: string) {
    this.svc.toggleStatus(id).subscribe({
      next: (r: any) => { this.toast.success(r.message); this.load(); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }
}
