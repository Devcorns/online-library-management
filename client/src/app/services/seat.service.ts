import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeatService {
  private base = `${environment.apiUrl}/seats`;
  constructor(private http: HttpClient) {}

  getSeats(p: any = {}): Observable<any>   { return this.http.get(this.base, { params: p }); }
  createSeat(d: any): Observable<any>      { return this.http.post(this.base, d); }
  book(d: any): Observable<any>            { return this.http.post(`${this.base}/book`, d); }
  getMyBookings(): Observable<any>         { return this.http.get(`${this.base}/my-bookings`); }
  getAllBookings(p: any = {}): Observable<any> { return this.http.get(`${this.base}/bookings/all`, { params: p }); }
  checkIn(id: string): Observable<any>     { return this.http.patch(`${this.base}/bookings/${id}/check-in`, {}); }
  checkOut(id: string): Observable<any>    { return this.http.patch(`${this.base}/bookings/${id}/check-out`, {}); }
  cancel(id: string): Observable<any>      { return this.http.patch(`${this.base}/bookings/${id}/cancel`, {}); }
  occupancy(): Observable<any>             { return this.http.get(`${this.base}/dashboard/occupancy`); }
  dailyReport(p: any = {}): Observable<any>{ return this.http.get(`${this.base}/reports/daily-usage`, { params: p }); }
}
