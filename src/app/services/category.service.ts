import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs'
import { Category } from '../models/category.model';

const baseUrl = 'http://localhost:3000/categories';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  getAllCategory(filter: object): Observable<any> {
    let params = new HttpParams()
      .append('filter', JSON.stringify(filter));
    return this.http.get(baseUrl, {params});
  }

  getACategory(id: string): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  postACategory(data: any): Observable<any> {
    return this.http.post(baseUrl, data);
  }

  updateCategoryById(id: string, data: any): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, data);
  }

  deleteCategoryById(id: string): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }
}
