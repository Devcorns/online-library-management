import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { PlanListComponent } from './plan-list/plan-list.component';

const routes: Routes = [
  { path: '', component: PlanListComponent, canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [PlanListComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class PlansModule {}
