import { Component } from '@angular/core';
import {AuthenticationService} from '../api/authentication.service';
import {Storage} from '@ionic/storage';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {WinchRequestsService} from '../api/winch-requests.service';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { ToastController } from '@ionic/angular';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  avilabel: any;
  roleId: any;
  token: any;
  MyLat: any;
  MyLong: any;
  winchDriverID: any;
  hasRequest = null;
  alert;
  constructor(private Auth: AuthenticationService ,
              private localNotifications: LocalNotifications ,
              public loadingController: LoadingController,
              private storage: Storage ,
              private navCtrl: NavController ,
              private winchService: WinchRequestsService,
              private geolocation: Geolocation,
              public alertController: AlertController,
              public toastController: ToastController,
              public router: Router) {
  }
    ionViewWillEnter() {
    // check if token set or not
    this.storage.get('token').then((val) => {
      if (val == null) {
        AuthenticationService.User = false;
        this.navCtrl.navigateBack('/');
      } else { this.token = val; }
    });
    this.storage.get('id').then((val) => {
        this.roleId =  val + '';
    });
    this.storage.get('winchDriver_id').then((val) => {
        this.winchDriverID =  val + '';
        this.recieveNotification(this.winchDriverID);
    });
    this.storage.get('avilability').then((val) => {
        this.avilabel =  val + '';
    });
    // call trigger me function
    this.triggerMe();
    // call previous orders
    this.previousOrder();
    }
    async changeAvilability(newStatus) {
    const loading = await this.loadingController.create({
      message: 'waiting ....',
    });
    loading.present();
    this.winchService.changeAvilability(this.token ,  this.roleId , 'changeAvaliability' , newStatus)
        .then(data => {
            this.storage.set('avilability' , newStatus);
            this.avilabel =  newStatus;
            console.log(this.avilabel);
            loading.dismiss();
        })
        .catch(error => {
            console.log(error);
            loading.dismiss();
        });
  }
    triggerMe() {
      setInterval( () => {
          if (this.avilabel === '1') {
            // trigger my location
              this.geolocation.getCurrentPosition().then((resp) => {
                  // get lat and long for current position
                  this.MyLat = resp.coords.latitude;
                  this.MyLong = resp.coords.longitude;
                  this.winchService.TriggerMe(this.MyLat ,  this.MyLong , this.token , 'updatedriver')
                      .then(data => {
                          console.log(' set trigger me successfully');
                      })
                      .catch(error => {
                          console.log(error);
                      });
              });
          }
      } , 25000);
    }
    async recieveNotification(winchDriverID) {
        // @ts-ignore
        const pusher = new Pusher('a46f1f46a398aa80561f', {
            cluster: 'eu',
            encrypted: true,
        });
        // Subscribe to the channel we specified in our Laravel Event
        const channel = pusher.subscribe('Drivix' + winchDriverID);
        channel.bind('App\\Events\\sendNotification', async data => {
            // send Notificaiton to notify user
            if (data.order.status === 0) {
                this.localNotifications.schedule({
                    text: 'User Hossam Request you for a trip',
                    led: 'FF0000',
                    sound: 'file://sound.mp3',
                });
                this.alert = await this.alertController.create({
                    subHeader: 'Accept winch Order ?',
                    message:
                        ` ` + data.message + ` `,
                    buttons: [
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: ['secondary', 'cancel'],
                            handler: (blah) => {
                                console.log('Cancel');
                                this.CancelWinchOrder(data);
                            }
                        }, {
                            text: 'Accept Order',
                            cssClass: ['secondary', 'ConfirmButton'],
                            handler: () => {
                                this.AcceptWinchOrder(data);
                            }
                        }
                    ],
                });
                this.alert.present();
            }
            if (data.order.status === -1) {
                console.log('hide alert ');
                this.router.navigate(['/home']);
                if (this.alert && !this.alert._detached) { await this.alert.dismiss(); }
            }
            if (data.order.status === 5) {
                if (WinchRequestsService.updateWinchDriverLocation) {
                    console.log('clear interval herer');
                    clearInterval(WinchRequestsService.updateWinchDriverLocation);
                }
                console.log('cancedl order by user here ');
                console.log(data);
                this.localNotifications.schedule({
                    text: 'Winch Order has Been Canceled by user',
                    led: 'FF0000',
                    sound: 'file://sound.mp3',
                });
                const toast = await this.toastController.create({
                    duration: 4000,
                    position: 'bottom',
                    message: 'Order has been Canceled by user !',
                });
                toast.present();
                WinchRequestsService.requestData = null ;
                this.router.navigate(['/home']);
            }
            if (data.order.status === 4) {
                if (WinchRequestsService.updateWinchDriverLocation) {
                    console.log('clear interval herer');
                    clearInterval(WinchRequestsService.updateWinchDriverLocation);
                }
                console.log('finised order by driver here ');
                console.log(data);
                this.localNotifications.schedule({
                    text: 'Winch Order has Been Finished :) ',
                    led: 'FF0000',
                    sound: 'file://sound.mp3',
                });
                const toast = await this.toastController.create({
                    duration: 4000,
                    position: 'bottom',
                    message: 'Order has been Finished!',
                });
                toast.present();
                WinchRequestsService.requestData = null ;
                this.router.navigate(['/home']);
            }
        });
    }
    async AcceptWinchOrder(data) {
        await this.alert.dismiss();
        const loading = await this.loadingController.create({
            message: 'Accepting request ....',
        });
        loading.present();
        WinchRequestsService.requestData = data;
        this.winchService.AcceptOrder(Number(data.order.id) , this.token , this.roleId , 'acceptorder')
            .then(async response => {
                this.avilabel =  0 + '';
                this.storage.set('avilability' , 0);
                this.router.navigate(['/winchRequest']);
                await loading.dismiss();
            })
            .catch( async error => {
                console.log(error);
                await loading.dismiss();
            });
    }
    async CancelWinchOrder(data) {
        await this.alert.dismiss();
        this.winchService.rejectOrder(Number(data.order.id) , this.token , 'rejectorder')
          .then(async response => {
              const toast = await this.toastController.create({
                  duration: 2000,
                  position: 'bottom',
                  message: 'Order Canceled Successfully !',
              });
              toast.present();
              console.log(response);
          })
          .catch( error => {
              console.log(error);
          });
    }
    async previousOrder() {
        const loading = await this.loadingController.create({
            message: 'checking previous order ....',
        });
        loading.present();
        this.storage.get('winchDriver_id').then((val) => {
            this.winchService.LoadingPreviousOrder(Number(val) , 'getLastestDriverOpenOrder')
                .then(async data => {
                    loading.dismiss();
                    const loadPrevious = await this.loadingController.create({
                        message: 'Loading previous request ....',
                    });
                    loadPrevious.present();
                    WinchRequestsService.requestData = data;
                    // @ts-ignore
                    this.avilabel =  0 + '';
                    this.storage.set('avilability' , 0);
                    this.router.navigate(['/winchRequest']);
                    await loadPrevious.dismiss();
                })
                .catch(error => {
                    console.log(error);
                    loading.dismiss();
                });
        });
    }
    checkHasReques() {
      if (WinchRequestsService.requestData) {
          return (WinchRequestsService.requestData == null);
      } else { return true; }
    }
}
