import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {LoadingController, AlertController, ToastController} from '@ionic/angular';
import {WinchRequestsService} from '../api/winch-requests.service';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Router} from '@angular/router';
import {AuthenticationService} from '../api/authentication.service';
import {Storage} from '@ionic/storage';
import {LocalNotifications} from '@ionic-native/local-notifications/ngx';

declare var google;
@Component({
  selector: 'app-winch-request',
  templateUrl: './winch-request.page.html',
  styleUrls: ['./winch-request.page.scss'],
})
export class WinchRequestPage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  @Input() destLat: number;
  @Input() destLong: number;
  map: any;
  positionSubscription: Subscription;
  height: string;
  loader;
  currentLat;
  currentLong ;
  requestData: any;
  directionsService = new google.maps.DirectionsService();
  directionsDisplay;
  distance: number;
  startTrip = true;
  finishTrip = false;
  markersArray = [];
  constructor( private geolocation: Geolocation ,
               private localNotifications: LocalNotifications,
               public loadingController: LoadingController ,
               public alertController: AlertController,
               public winchRequest: WinchRequestsService,
               public router: Router,
               private storage: Storage,
               private toastController: ToastController) {}
  async ngOnInit() {
    this.requestData = WinchRequestsService.requestData;
    if (this.requestData === null) {
      this.router.navigate(['/home']);
    }
    if (this.requestData && this.requestData.order.status === 3 ) {
      this.startTrip = false;
      this.finishTrip = true;
    }
    if (this.requestData  && this.requestData.order.status !== 3) {
      this.startTrip = true;
      this.finishTrip = false;
    }
    this.map = null;
    this.height = (document.documentElement.clientHeight - 50) + 'px' ;
    this.loader = await this.loadingController.create({
      message: 'Loading map ...',
    });
    await this.loader.present();
    await this.showMapWithGPS();
  }
  async showMapWithGPS() {
    // set marker
    const rendererOptions = {
      suppressMarkers: true
    };
    this.directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    const mapOptions = {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false ,
      zoom: 14,
      styles: [
        {elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{color: '#c9b2a6'}]
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'geometry.stroke',
          stylers: [{color: '#dcd2be'}]
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'labels.text.fill',
          stylers: [{color: '#ae9e90'}]
        },
        {
          featureType: 'landscape.natural',
          elementType: 'geometry',
          stylers: [{color: '#dfd2ae'}]
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{color: '#dfd2ae'}]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{color: '#93817c'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry.fill',
          stylers: [{color: '#a5b076'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{color: '#447530'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#f5f1e6'}]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{color: '#fdfcf8'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#f8c967'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#e9bc62'}]
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry',
          stylers: [{color: '#e98d58'}]
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry.stroke',
          stylers: [{color: '#db8555'}]
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [{color: '#806b63'}]
        },
        {
          featureType: 'transit.line',
          elementType: 'geometry',
          stylers: [{color: '#dfd2ae'}]
        },
        {
          featureType: 'transit.line',
          elementType: 'labels.text.fill',
          stylers: [{color: '#8f7d77'}]
        },
        {
          featureType: 'transit.line',
          elementType: 'labels.text.stroke',
          stylers: [{color: '#ebe3cd'}]
        },
        {
          featureType: 'transit.station',
          elementType: 'geometry',
          stylers: [{color: '#dfd2ae'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry.fill',
          stylers: [{color: '#b9d3c2'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#92998d'}]
        }
      ]
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.map.setZoom(14);
    // get my location (enable gps)
    this.geolocation.getCurrentPosition().then(resp => {
      // get lat and long for current position
      this.currentLat = (Number) (resp.coords.latitude);
      this.currentLong = (Number) (resp.coords.longitude);
      // current location
      const latLng = new google.maps.LatLng(this.currentLat, this.currentLong);
      const  MyMarker = new google.maps.Marker({
        map: this.map,
        position: latLng,
        animation: google.maps.Animation.DROP,
        icon: '../../../assets/winch.jpg',
      });
      this.markersArray.push(MyMarker);
      // set user location on map
      const userIcon = '../../../assets/user.png';
      const userLatLong = new google.maps.LatLng(((Number)(this.requestData.order.user_lat)), ((Number)(this.requestData.order.user_long)));
      console.log(userLatLong);
      console.log(latLng);
      const  userMarker = new google.maps.Marker({
        map: this.map,
        position: userLatLong,
        animation: google.maps.Animation.DROP,
        icon: userIcon,
      });
      this.markersArray.push(userMarker);
      this.directionsDisplay.setMap(this.map);
      this.calcRoute();
      this.startTracking();
    }).catch((error) => {
      console.log('Error getting location', error);
    });
    await this.loader.dismiss();
  }
  calcRoute() {
    // clear all markers
    for (let i = 0; i < this.markersArray.length; i++ ) {
      this.markersArray[i].setMap(null);
    }
    const start = new google.maps.LatLng(this.currentLat, this.currentLong);
    const end = new google.maps.LatLng(((Number)(this.requestData.order.user_lat)), ((Number)(this.requestData.order.user_long)));
    const  MyMarker = new google.maps.Marker({
      map: this.map,
      position: start,
      icon: '../../../assets/winch.jpg',
    });
    this.markersArray.push(MyMarker);
    const  winchMarker = new google.maps.Marker({
      map: this.map,
      position: end,
      icon: '../../../assets/user.png',
    });
    this.markersArray.push(winchMarker);
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(start);
    bounds.extend(end);
    this.map.fitBounds(bounds);
    const request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING
    };
    this.directionsService.route(request, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        // this.directionsDisplay.preserveViewport = true;
        this.directionsDisplay.setMap(this.map);
        this.directionsDisplay.setDirections(response);
      } else {
        console.log( 'Directions Request from ' + start.toUrlValue(6) + ' to ' + end.toUrlValue(6) + ' failed: ' + status);
      }
    });
  }
  startTracking() {
    WinchRequestsService.updateWinchDriverLocation = setInterval(() => {
      this.geolocation.getCurrentPosition().then(resp => {
        // get lat and long for current position
        this.currentLat = (Number)(resp.coords.latitude);
        this.currentLong = (Number)(resp.coords.longitude);
        this.calcRoute();
        this.calculateDifferent(
          new google.maps.LatLng(this.currentLat, this.currentLong) ,
          new google.maps.LatLng(((Number)(this.requestData.order.user_lat)), ((Number)(this.requestData.order.user_long))));
        this.storage.get('token').then((val) => {
          this.winchRequest.UpdateRequestedDriverlocation
          (this.currentLat , this.currentLong , val , 'UpdateRequestedDriverlocation' )
              .then(data => {
                console.log('uodated driver lat and long');
              })
              .catch(error => {
                console.log('fail to update it' +  error);
              });
        });
      });
    } , 15000);
  }
  calculateDifferent(pointA , pointB) {
    this.distance = google.maps.geometry.spherical.computeDistanceBetween(pointA , pointB);
    console.log(this.distance);
  }
  checkStartTrip() {
    if (this.startTrip === true && this.distance <= 80) {
      return false;
    } else { return true; }
  }
  checkEndTrip() {
    if (this.finishTrip === true && this.distance <= 80) {
      return false;
    } else { return true; }
  }
  async startTripOrder() {
    // start trip
    this.loader = await this.loadingController.create({
      message: 'Loading  ...',
    });
    await this.loader.present();
    this.winchRequest.startOrder(this.requestData.order.id , this.requestData.order.winchdriver_id , 'startTrip')
        .then(async data => {
          this.startTrip = false;
          this.finishTrip = true;
          const toast = await this.toastController.create({
            duration: 4000,
            position: 'bottom',
            message: 'you have started a new trip , enjoy',
          });
          toast.present();
          console.log(data);
          await this.loader.dismiss();
        })
        .catch( async error => {
          console.log(error);
          await this.loader.dismiss();
        });
  }
  async FinishTripOrder() {
    // start trip
    this.loader = await this.loadingController.create({
      message: 'Loading  ...',
    });
    await this.loader.present();
    this.storage.get('token').then((val) => {
      this.winchRequest.finishOrder(this.requestData.order.id, this.requestData.order.winchdriver_id, val , 'finishTrip')
          .then(async data => {
            await this.loader.dismiss();
            this.startTrip = false;
            this.finishTrip = true;
            // Temporary because pusher not work
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
            // Temporary because pusher not work

          })
          .catch(async error => {
            console.log(error);
            await this.loader.dismiss();
          });
    });
  }

}
