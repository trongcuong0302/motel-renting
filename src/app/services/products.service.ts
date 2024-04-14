import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

const baseUrl = 'http://localhost:3000/products';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) { }

  getAllProduct(filter: object): Observable<any> {
    let params = new HttpParams()
      .append('filter', JSON.stringify(filter));
    return this.http.get(baseUrl, {params});
  }

  getProductStatistics(data: any, mode: string, code: string): Observable<any> {
    let params = new HttpParams()
      .append('date', data)
      .append('mode', mode)
      .append('code', code)
    
    return this.http.get(`${baseUrl}/statistics`, {params});
  }

  getAProduct(id: string): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  postAProduct(data: any): Observable<any> {
    return this.http.post(baseUrl, data);
  }

  updateProductById(id: string, data: any): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, data);
  }

  deleteProductById(id: string): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }
}
