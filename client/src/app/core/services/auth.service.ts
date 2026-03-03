import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  membershipStatus: string;
  isApproved: boolean;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    const u = localStorage.getItem('lib_user');
    return u ? JSON.parse(u) : null;
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get token(): string | null { return localStorage.getItem('lib_token'); }
  get isLoggedIn(): boolean { return !!this.token; }

  hasRole(...roles: string[]): boolean {
    const roleHierarchy: Record<string, number> = { super_admin: 4, admin: 3, staff: 2, user: 1 };
    const myLevel = roleHierarchy[this.currentUser?.role || ''] || 0;
    return roles.some(r => myLevel >= (roleHierarchy[r] || 0));
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('lib_token', res.token);
        localStorage.setItem('lib_user', JSON.stringify(res.data));
        this.currentUserSubject.next(res.data);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem('lib_token');
    localStorage.removeItem('lib_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`);
  }
}
