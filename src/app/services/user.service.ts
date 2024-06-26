import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs'
import { User } from '../models/user.model';

const baseUrl = 'http://localhost:3000/users';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: any = {};
  auth: BehaviorSubject<any>;

  constructor(private http: HttpClient) {
    this.auth = new BehaviorSubject(this.user)
  }

  nextUser(user: any) {
    this.auth.next(user);
  }

  login(user: object): Observable<any>  {
    return this.http.post(`${baseUrl}/login`, user, { withCredentials: true });
  }

  register(user: object): Observable<any>  {
    return this.http.post(`${baseUrl}/register`, user, { withCredentials: true });
  }

  getUser(): Observable<any> {
    return this.http.get(`${baseUrl}/user`, { withCredentials: true });
  }

  logOut(): Observable<any> {
    return this.http.post(`${baseUrl}/logout`, {}, { withCredentials: true });
  }

  sendMailResetPassword(objEmail: object): Observable<any> {
    return this.http.post(`${baseUrl}/send-email`, objEmail);
  }

  resetPassword(resetObj: object): Observable<any> {
    return this.http.post(`${baseUrl}/reset-password`, resetObj);
  }

  verifyEmail(changeObj: object): Observable<any> {
    return this.http.post(`${baseUrl}/verify-email`, changeObj);
  }

  changePassword(changeObj: object): Observable<any> {
    return this.http.post(`${baseUrl}/change-password`, changeObj);
  }

  updateUserProfile(id: string, data: any): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, data);
  }

  getUserProfile(id: string): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  getAllUser(filter: object): Observable<any> {
    let params = new HttpParams()
      .append('filter', JSON.stringify(filter));
    return this.http.get(baseUrl, {params});
  }

  deleteUserById(id: string): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  postAnUser(data: any): Observable<any> {
    return this.http.post(baseUrl, data);
  }

}
