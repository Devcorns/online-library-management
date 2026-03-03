import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-page">
      <div class="card auth-card p-4">
        <div class="text-center mb-4">
          <i class="bi bi-book-half text-primary" style="font-size:2.5rem"></i>
          <h4 class="mt-2 fw-bold">LibMS Login</h4>
          <p class="text-muted small">Library Management System</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="admin@library.com">
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="••••••••">
          </div>
          <div class="alert alert-danger py-2 small" *ngIf="error">{{error}}</div>
          <button class="btn btn-primary w-100" type="submit" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            Sign In
          </button>
        </form>
        <p class="text-center small mt-3 mb-0">
          New user? <a routerLink="/auth/register">Register here</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService,
              private router: Router, private toast: ToastService) {}

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => { this.toast.success('Welcome back!'); this.router.navigate(['/dashboard']); },
      error: (e: any) => { this.error = e.error?.message || 'Login failed'; this.loading = false; }
    });
  }
}
