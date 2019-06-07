import { Component, OnInit } from '@angular/core';
import {LoadingController} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {WinchRequestsService} from '../api/winch-requests.service';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {
  MyOrders: any;
  constructor(public loadingController: LoadingController,
              private storage: Storage,
              public winchService: WinchRequestsService) { }

  ngOnInit() {
    this.myOrders();
  }
  async myOrders() {
    let returnValue;
    const loading = await this.loadingController.create({
      message: 'Loading previous order ....',
    });
    loading.present();
    await this.storage.get('winchDriver_id').then(async (val) => {
      await this.winchService.MyOrders(val + '' , 'WinchDriverOrders')
          .then(async data => {
            loading.dismiss();
            console.log(data);
            this.MyOrders = data;
          })
          .catch(error => {
            console.log(error);
            loading.dismiss();
            returnValue =  false;
          });
    });
    return returnValue;
  }
  getOrderStatus( order ) {
    if (order.status) {
      if (order.status === 0) {
        return 'Not Accepted';
      }
      if (order.status === 1) {
        return 'Accepted';
      }
      if (order.status === 2) {
        return 'refused by You';
      }
      if (order.status === 2) {
        return 'Started';
      }
      if (order.status === 4) {
        return 'finished';
      }
      if (order.status === 5) {
        return 'canceled by User';
      }
    } else { return 'not mentioned'; }
  }

}
