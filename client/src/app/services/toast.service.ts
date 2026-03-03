import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast { message: string; type: 'success' | 'danger' | 'warning' | 'info'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts$ = new Subject<Toast>();
  toasts$ = this._toasts$.asObservable();

  show(message: string, type: Toast['type'] = 'success') {
    this._toasts$.next({ message, type });
  }
  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'danger');  }
  warning(msg: string) { this.show(msg, 'warning'); }
}
