import { Component, OnInit } from '@angular/core';
import { MembershipService } from '../../services/membership.service';
import { ToastService } from '../../services/toast.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-plan-list',
  template: `
    <h4 class="fw-bold mb-4"><i class="bi bi-list-check me-2 text-primary"></i>Membership Plans</h4>

    <div class="card stat-card mb-4">
      <div class="card-header bg-white fw-bold">{{editing ? 'Edit Plan' : 'Add New Plan'}}</div>
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="submit()" class="row g-2">
          <div class="col-md-2"><input class="form-control" formControlName="name" placeholder="Plan name"></div>
          <div class="col-md-2">
            <select class="form-select" formControlName="planType">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div class="col-md-1"><input type="number" class="form-control" formControlName="durationInDays" placeholder="Days"></div>
          <div class="col-md-1"><input type="number" class="form-control" formControlName="fee" placeholder="Fee ₹"></div>
          <div class="col-md-2"><input type="number" class="form-control" formControlName="gracePeriodDays" placeholder="Grace days"></div>
          <div class="col-md-1"><input type="number" class="form-control" formControlName="finePerDay" placeholder="Fine/day ₹"></div>
          <div class="col-md-3">
            <input class="form-control" formControlName="description" placeholder="Description (optional)">
          </div>
          <div class="col-12 d-flex gap-2 mt-1">
            <button class="btn btn-primary" type="submit">{{editing ? 'Update Plan' : 'Add Plan'}}</button>
            <button *ngIf="editing" class="btn btn-secondary" type="button" (click)="cancelEdit()">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card stat-card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Name</th><th>Type</th><th>Duration</th><th>Fee</th><th>Grace Period</th><th>Fine/Day</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of plans">
              <td class="fw-bold">{{p.name}}</td>
              <td><span class="badge bg-info text-dark">{{p.planType}}</span></td>
              <td>{{p.durationInDays}} days</td>
              <td>₹{{p.fee}}</td>
              <td>{{p.gracePeriodDays}} days</td>
              <td>₹{{p.finePerDay}}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="edit(p)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" (click)="deletePlan(p._id)">Remove</button>
              </td>
            </tr>
            <tr *ngIf="!plans.length">
              <td colspan="7" class="text-center text-muted py-4">No plans configured yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PlanListComponent implements OnInit {
  plans: any[] = [];
  editing = false;
  editId = '';

  form = this.fb.group({
    name: ['', Validators.required],
    planType: ['monthly', Validators.required],
    durationInDays: [30, Validators.required],
    fee: [0, Validators.required],
    gracePeriodDays: [5],
    finePerDay: [10],
    description: ['']
  });

  constructor(private svc: MembershipService, private toast: ToastService, private fb: FormBuilder) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getPlans().subscribe(r => this.plans = r.data); }

  submit() {
    if (this.form.invalid) return;
    const req = this.editing
      ? this.svc.updatePlan(this.editId, this.form.value)
      : this.svc.createPlan(this.form.value);
    req.subscribe({
      next: () => { this.toast.success(`Plan ${this.editing ? 'updated' : 'created'}!`); this.load(); this.cancelEdit(); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }

  edit(p: any) { this.editing = true; this.editId = p._id; this.form.patchValue(p); }
  cancelEdit() {
    this.editing = false; this.editId = '';
    this.form.reset({ planType: 'monthly', durationInDays: 30, gracePeriodDays: 5, finePerDay: 10, fee: 0 });
  }
  deletePlan(id: string) {
    this.svc.deletePlan(id).subscribe({
      next: () => { this.toast.success('Plan removed.'); this.load(); },
      error: (e: any) => this.toast.error(e.error?.message)
    });
  }
}
