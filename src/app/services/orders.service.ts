import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs'

const baseUrl = 'http://localhost:3000/order';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private http: HttpClient) { }

  getAllOrder(filter: object): Observable<any> {
    let params = new HttpParams()
      .append('filter', JSON.stringify(filter));
    return this.http.get(baseUrl, {params});
  }

  getAnOrder(id: string): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  postAnOrder(data: any): Observable<any> {
    return this.http.post(baseUrl, data);
  }

  updateOrderById(id: string, data: any): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, data);
  }

  deleteOrderById(id: string): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  createAnOrder(data: any): Observable<any> {
    return this.http.post(`${baseUrl}/create_payment_url`, data);
  }

  getOrderResult(filter: any): Observable<any> {
    let params = new HttpParams()
      .append('vnp_Params', JSON.stringify(filter));
    return this.http.get(`${baseUrl}/vnpay_return`, {params});
  }
}
