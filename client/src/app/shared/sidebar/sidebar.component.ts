import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="sidebar d-flex flex-column">
      <div class="brand">
        <i class="bi bi-book-half me-2"></i>LibMS
      </div>
      <nav class="mt-2 flex-grow-1">
        <a class="nav-link d-flex align-items-center" routerLink="/dashboard" routerLinkActive="active">
          <i class="bi bi-speedometer2"></i> Dashboard
        </a>
        <a *ngIf="auth.hasRole('staff')" class="nav-link d-flex align-items-center"
           routerLink="/users" routerLinkActive="active">
          <i class="bi bi-people"></i> Users
        </a>
        <a *ngIf="auth.hasRole('staff')" class="nav-link d-flex align-items-center"
           routerLink="/membership" routerLinkActive="active">
          <i class="bi bi-credit-card"></i> Memberships
        </a>
        <a *ngIf="auth.hasRole('admin')" class="nav-link d-flex align-items-center"
           routerLink="/plans" routerLinkActive="active">
          <i class="bi bi-list-check"></i> Plans
        </a>
        <a class="nav-link d-flex align-items-center" routerLink="/seats" routerLinkActive="active">
          <i class="bi bi-grid-3x3-gap"></i> Seats
        </a>
        <a *ngIf="auth.hasRole('staff')" class="nav-link d-flex align-items-center"
           routerLink="/inventory" routerLinkActive="active">
          <i class="bi bi-box-seam"></i> Inventory
        </a>
      </nav>
      <div class="p-3 border-top border-secondary">
        <div class="small text-white mb-1">
          <i class="bi bi-person-circle me-1"></i>{{auth.currentUser?.name}}
        </div>
        <div class="small text-secondary mb-2">{{auth.currentUser?.role | titlecase}}</div>
        <button class="btn btn-sm btn-outline-light w-100" (click)="auth.logout()">
          <i class="bi bi-box-arrow-right me-1"></i>Logout
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  constructor(public auth: AuthService) {}
}
