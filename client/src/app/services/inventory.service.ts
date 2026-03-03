import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private base = `${environment.apiUrl}/inventory`;
  constructor(private http: HttpClient) {}

  getItems(p: any = {}): Observable<any>   { return this.http.get(`${this.base}/items`, { params: p }); }
  getItem(id: string): Observable<any>     { return this.http.get(`${this.base}/items/${id}`); }
  createItem(d: any): Observable<any>      { return this.http.post(`${this.base}/items`, d); }
  updateItem(id: string, d: any): Observable<any> { return this.http.put(`${this.base}/items/${id}`, d); }
  deleteItem(id: string): Observable<any>  { return this.http.delete(`${this.base}/items/${id}`); }
  lowStock(): Observable<any>              { return this.http.get(`${this.base}/items/low-stock`); }

  getRequisitions(p: any = {}): Observable<any> { return this.http.get(`${this.base}/requisitions`, { params: p }); }
  createRequisition(d: any): Observable<any>    { return this.http.post(`${this.base}/requisitions`, d); }
  reviewRequisition(id: string, d: any): Observable<any> { return this.http.patch(`${this.base}/requisitions/${id}/review`, d); }
}
