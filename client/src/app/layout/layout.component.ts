import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  template: `
    <app-sidebar></app-sidebar>
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
    <app-toast></app-toast>
  `
})
export class LayoutComponent {}
