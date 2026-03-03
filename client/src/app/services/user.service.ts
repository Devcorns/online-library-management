import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  getAll(params: any = {}): Observable<any> {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { if (v) p = p.set(k, String(v)); });
    return this.http.get(this.base, { params: p });
  }
  getOne(id: string): Observable<any>  { return this.http.get(`${this.base}/${id}`); }
  approve(id: string): Observable<any> { return this.http.patch(`${this.base}/${id}/approve`, {}); }
  toggleStatus(id: string): Observable<any> { return this.http.patch(`${this.base}/${id}/toggle-status`, {}); }
  updateRole(id: string, role: string): Observable<any> { return this.http.patch(`${this.base}/${id}/role`, { role }); }
  delete(id: string): Observable<any>  { return this.http.delete(`${this.base}/${id}`); }
}
