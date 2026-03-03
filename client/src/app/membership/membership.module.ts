import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';

const routes: Routes = [
  { path: '', component: SubscriptionListComponent, canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [SubscriptionListComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class MembershipModule {}
