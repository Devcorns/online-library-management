import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToastComponent } from './toast/toast.component';

@NgModule({
  declarations: [SidebarComponent, ToastComponent],
  imports: [CommonModule, RouterModule],
  exports: [SidebarComponent, ToastComponent]
})
export class SharedModule {}
