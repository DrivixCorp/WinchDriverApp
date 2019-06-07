import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
    constructor(public http: HttpClient) {
  }
  // fields
  static User = null;
  loginUrl = 'http://www.drivixcorp.com/api/driverLogin';
    // check Auth or not
    static  check_Auth() {
     return AuthenticationService.User !== null;
    }
  // Login Function
  Login(data) {
      return new Promise((resolve, reject) => {
          this.http.post(this.loginUrl, JSON.stringify({}), {
            params: new HttpParams().set('email', data.email).append('password', data.password) ,
          })
          .subscribe(res => {
              resolve(res);
          }, (err) => {
              reject(err);
          });
      });
  }
}
