import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WinchRequestsService {
  static requestData = null;
  static updateWinchDriverLocation = null;
  URl = 'http://www.drivixcorp.com/api/';
  constructor(public http: HttpClient) { }
  changeAvilability(token , id , URL ,  avlnum) {
    return new Promise((resolve, reject) => {
      this.http.post(this.URl + URL , JSON.stringify({}), {
        params: new HttpParams()
            .set('token', token)
            .append('roleID', id)
            .append('avaliability', avlnum)
      })
          .subscribe(res => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
    });
  }
  TriggerMe(lat , long , token , URL) {
      return new Promise((resolve, reject) => {
          this.http.post(this.URl + URL , JSON.stringify({}), {
              params: new HttpParams()
                  .set('token', token)
                  .append('lat', lat)
                  .append('long', long)
          })
              .subscribe(res => {
                  resolve(res);
              }, (err) => {
                  reject(err);
              });
      });
  }
  rejectOrder(orderID , token , URL) {
        return new Promise((resolve, reject) => {
            this.http.post(this.URl + URL , JSON.stringify({}), {
                params: new HttpParams()
                    .set('token', token)
                    .append('orderID', orderID)
            })
                .subscribe(res => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
        });
    }
  AcceptOrder(orderID , token , roleID , URL) {
        return new Promise((resolve, reject) => {
            this.http.post(this.URl + URL , JSON.stringify({}), {
                params: new HttpParams()
                    .set('token', token)
                    .append('orderID', orderID)
                    .append('roleID', roleID)
            })
                .subscribe(res => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
        });
    }
  UpdateRequestedDriverlocation(lat , long , token , URL) {
        return new Promise((resolve, reject) => {
            this.http.post(this.URl + URL , JSON.stringify({}), {
                params: new HttpParams()
                    .set('token', token)
                    .append('lat', lat)
                    .append('long', long)
            })
                .subscribe(res => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
        });
    }
  LoadingPreviousOrder(dID, URl) {
      return new Promise((resolve, reject) => {
          console.log(dID);
          this.http.post(this.URl + URl , JSON.stringify({}), {
              params: new HttpParams()
                  .set('driverId', dID)
          })
              .subscribe(res => {
                  resolve(res);
              }, (err) => {
                  reject(err);
              });
      });
  }
  startOrder(orderID , winchdriverid , URL) {
        return new Promise((resolve, reject) => {
            this.http.post(this.URl + URL , JSON.stringify({}), {
                params: new HttpParams()
                    .set('orderID', orderID)
                    .append('winchdriver_id', winchdriverid)
            })
                .subscribe(res => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
        });
    }
  finishOrder(orderID , winchdriverid , token , URL) {
    return new Promise((resolve, reject) => {
        this.http.post(this.URl + URL , JSON.stringify({}), {
            params: new HttpParams()
                .set('orderID', orderID)
                .append('winchdriver_id', winchdriverid)
                .append('token', token)
        })
            .subscribe(res => {
                resolve(res);
            }, (err) => {
                reject(err);
            });
    });
    }
  MyOrders(winchID, URl) {
        return new Promise((resolve, reject) => {
            this.http.post(this.URl + URl , JSON.stringify({}), {
                params: new HttpParams()
                    .set('winchdriver_id', winchID)
            })
            .subscribe(res => {
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }

}
