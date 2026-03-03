import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { SeatListComponent } from './seat-list/seat-list.component';

const routes: Routes = [
  { path: '', component: SeatListComponent, canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [SeatListComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class SeatsModule {}
