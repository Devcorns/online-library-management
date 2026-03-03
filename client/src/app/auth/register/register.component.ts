import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-page">
      <div class="card auth-card p-4">
        <div class="text-center mb-3">
          <i class="bi bi-person-plus text-primary" style="font-size:2rem"></i>
          <h5 class="mt-2 fw-bold">Create Account</h5>
        </div>
        <div class="alert alert-success small py-2" *ngIf="success">
          Registration successful! Awaiting admin approval. <a routerLink="/auth/login">Login</a>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="!success">
          <div class="mb-2">
            <label class="form-label">Full Name</label>
            <input class="form-control" formControlName="name" placeholder="John Doe">
          </div>
          <div class="mb-2">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email">
          </div>
          <div class="mb-2">
            <label class="form-label">Phone</label>
            <input class="form-control" formControlName="phone">
          </div>
          <div class="mb-2">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password">
          </div>
          <div class="mb-3">
            <label class="form-label">Address</label>
            <textarea class="form-control" formControlName="address" rows="2"></textarea>
          </div>
          <div class="alert alert-danger py-2 small" *ngIf="error">{{error}}</div>
          <button class="btn btn-primary w-100" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            Register
          </button>
        </form>
        <p class="text-center small mt-3 mb-0">
          Already have account? <a routerLink="/auth/login">Login</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    address: ['']
  });
  loading = false; error = ''; success = false;

  constructor(private fb: FormBuilder, private auth: AuthService,
              private router: Router, private toast: ToastService) {}

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    this.auth.register(this.form.value).subscribe({
      next: () => { this.success = true; },
      error: (e: any) => { this.error = e.error?.message || 'Registration failed'; this.loading = false; }
    });
  }
}
