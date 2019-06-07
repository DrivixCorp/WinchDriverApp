import { Component } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { Platform } from '@ionic/angular';
import {NavController} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {Storage} from '@ionic/storage';
import {AuthenticationService} from '../app/api/authentication.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  userName ;
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'My Orders',
      url: '/list',
      icon: 'ios-cart'
    },
    {
      title: 'Profile',
      url: '/profile',
      icon: 'ios-contact'
    }
  ];
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar ,
    private router: Router ,
    public navCtrl: NavController ,
    private storage: Storage
  ) {
    this.initializeApp();
    this.storage.get('user_name').then( val => {
      this.userName =  val;
    });
  }
  ionViewWillEnter() {
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  sign_out() {
    AuthenticationService.User = null;
    this.storage.remove('token');
    this.navCtrl.navigateRoot('');
  }
}
