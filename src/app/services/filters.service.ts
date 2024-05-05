import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs'

const baseUrl = 'http://localhost:3000/filters';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private http: HttpClient) { }

  getAllFilter(filter: object): Observable<any> {
    let params = new HttpParams()
      .append('filter', JSON.stringify(filter));
    return this.http.get(baseUrl, {params});
  }

  getAFilter(id: string): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  postAFilter(data: any): Observable<any> {
    return this.http.post(baseUrl, data);
  }

  updateFilterById(id: string, data: any): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, data);
  }

  deleteFilterById(id: string): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }
}
