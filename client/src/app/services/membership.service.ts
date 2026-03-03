import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private planBase = `${environment.apiUrl}/plans`;
  private subBase  = `${environment.apiUrl}/subscriptions`;
  constructor(private http: HttpClient) {}

  // Plans
  getPlans(): Observable<any>           { return this.http.get(this.planBase); }
  getPlan(id: string): Observable<any>  { return this.http.get(`${this.planBase}/${id}`); }
  createPlan(d: any): Observable<any>   { return this.http.post(this.planBase, d); }
  updatePlan(id: string, d: any): Observable<any> { return this.http.put(`${this.planBase}/${id}`, d); }
  deletePlan(id: string): Observable<any>          { return this.http.delete(`${this.planBase}/${id}`); }

  // Subscriptions
  getAll(p: any = {}): Observable<any>  { return this.http.get(this.subBase, { params: p }); }
  getOne(id: string): Observable<any>   { return this.http.get(`${this.subBase}/${id}`); }
  getUserSubs(uid: string): Observable<any> { return this.http.get(`${this.subBase}/user/${uid}`); }
  create(d: any): Observable<any>       { return this.http.post(this.subBase, d); }
  renew(d: any): Observable<any>        { return this.http.post(`${this.subBase}/renew`, d); }
  recordPayment(d: any): Observable<any>{ return this.http.post(`${this.subBase}/payment`, d); }
  revenueReport(p: any = {}): Observable<any> { return this.http.get(`${this.subBase}/revenue-report`, { params: p }); }
}
