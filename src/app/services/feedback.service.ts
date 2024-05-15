import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs'

const baseUrl = 'http://localhost:3000/feedback';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private http: HttpClient) { }

  getAllFeedback(filter: object): Observable<any> {
    let params = new HttpParams()
      .append('filter', JSON.stringify(filter));
    return this.http.get(baseUrl, {params});
  }

  getAFeedback(id: string): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  postAFeedback(data: any): Observable<any> {
    return this.http.post(baseUrl, data);
  }

  updateFeedbackById(id: string, data: any): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, data);
  }

  deleteFeedbackById(id: string): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }
}
