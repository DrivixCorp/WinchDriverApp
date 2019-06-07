import { Component } from '@angular/core';
import {NavController, LoadingController, ToastController , ActionSheetController  } from '@ionic/angular';
import {Storage} from '@ionic/storage';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import {AuthenticationService} from '../api/authentication.service';
import {ProfileService} from '../api/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
    Token = null;
    NewPhotoSelect: string;
    HasProfile = false;
    // obj data
    data = {
        phone: ' ',
        gender: ' ',
        DOB: ' ',
        location: ' ',
        job: ' ',
        name: '' ,
        token: this.Token,
        image: ''
    };
    profile_form: FormGroup;
    fb: FormBuilder;
    job: AbstractControl;
  constructor(public navCtrl: NavController , public Asheet: ActionSheetController ,public Camera: Camera , public Profile: ProfileService , public loadingController: LoadingController ,
     private storage: Storage , public Toast: ToastController , private toast: ToastController, form_builder: FormBuilder) {
          this.profile_form = form_builder.group({
            'job': [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50)])],
            'location': [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(25)])],
            'gender': [null, Validators.required],
            'phone': [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(25)])],
            'DOB': [null, Validators.required],
          }, {
            // updateOn: 'blur'
          });
  }
    // guard
    ionViewWillEnter() {
        if ( AuthenticationService.check_Auth() === false) {
            this.navCtrl.navigateForward('');
        }
        // get Token
        this.storage.get('token').then((val) => {
            if (val != null) {
                this.Token = val;
                this.getMyProfile();
            }
        });
    }
    async getMyProfile() {
         // send request to the web service here
         const loading = await this.loadingController.create({
            message: 'Loading you data ....',
        });
        loading.present();
        // Profile Service
        this.Profile.Profile(this.Token)
            .then(success => {
                console.log(success);
                // @ts-ignore
                if (!success.id) {
                    // @ts-ignore
                    this.HasProfile = false;
                } else {
                    // @ts-ignore
                    this.data.phone = success.phone;
                    // @ts-ignore
                    this.data.gender = success.gender;
                    // @ts-ignore
                    this.data.DOB = success.DOB;
                    // @ts-ignore
                    this.data.location = success.location;
                    // @ts-ignore
                    this.data.job = success.job;
                    // @ts-ignore
                    this.data.name = success.name;
                    // @ts-ignore
                    this.data.image = success.image;

                    this.HasProfile = true;
                }
                loading.dismiss();
            })
            .catch(err => {
                console.log(err);
                loading.dismiss();
            });
    }
    async UpdateMyData(action = 'profile') {
        // send request to the web service here
         const loading = await this.loadingController.create({
            message: 'Updating you data ....',
        });
        loading.present();
        let ProfileUrl = '';
        // set token
        this.data.token = this.Token;
        if (action === 'profile') {
            ProfileUrl = 'addprofile';
        } else {
            ProfileUrl = 'updateprofile/' + this.data.token;
        }
        // call add profile service
        this.Profile.UpdateProfileData(this.data, ProfileUrl)
        .then(async success => {
            // @ts-ignore
            const SuccessToast = await this.toast.create({
                message: 'Your profile updated successfully',
                duration: 2000
            });
            SuccessToast.present();
            if ( ProfileUrl === 'addprofile') {
                document.getElementById('AddProfile').style.display = 'none';
                document.getElementById('UpdateProfile').style.display = 'block';
            }
            loading.dismiss();
        })
        .catch(async err => {
            if (err.status === 503) {
                // create toast in case of success
                const Errtoast = await this.toast.create({
                    message: 'Your profile not saved',
                    duration: 2000
                });
                Errtoast.present();
            }
            loading.dismiss();
        });
    }

    async EditPhoto_options()
    {
     const actionsheet = await this.Asheet.create({
       header: "choose option to update your photo",
       buttons: [
         // take photo from camera
         {
           text: 'Take Photo',
           icon: 'camera',
           cssClass: 'camera',
           handler: () => {
             this.Camera.getPicture({
               destinationType:this.Camera.DestinationType.DATA_URL,
               sourceType:this.Camera.PictureSourceType.CAMERA,
               encodingType:this.Camera.EncodingType.JPEG,
               correctOrientation:true,
               targetHeight:300,
               targetWidth:300,
               cameraDirection:this.Camera.Direction.FRONT,
               quality:100,
               mediaType:this.Camera.MediaType.PICTURE
             })
             .then(imageData=>
             {
                this.NewPhotoSelect = imageData;
                this.updateImage();
             })
               .catch((error)=>{
                 const toast = this.Toast.create({
                   duration:2000,
                   message: 'No Image Selected',
                   closeButtonText: 'exit',
                   showCloseButton:true,
                 });
                // @ts-ignore
                 toast.present();
               })
           }
         },
         // open gallery to choose photo
         {
           text: 'choose photo',
           icon: 'images',
           cssClass: 'gallery',
           handler: () => {
             this.Camera.getPicture({
               destinationType:this.Camera.DestinationType.DATA_URL,
               sourceType:this.Camera.PictureSourceType.PHOTOLIBRARY,
               encodingType:this.Camera.EncodingType.JPEG,
               correctOrientation:true,
               targetHeight:300,
               targetWidth:300,
               cameraDirection:this.Camera.Direction.FRONT,
               quality:100,
               mediaType:this.Camera.MediaType.PICTURE
             })
               .then(imageData=>
               {
                this.NewPhotoSelect = imageData;
                this.updateImage();

            })
               .catch((error)=>{
                 const toast = this.Toast.create({
                   duration:2000,
                   message: 'No Image Selected',
                   closeButtonText: 'exit',
                   showCloseButton:true,
                 });
                  // @ts-ignore
                  toast.present();
               })
           }
         },
         // cancel button
         {
           text: 'Cancel',
           role: 'cancel',
           cssClass: 'cancel',
           icon: 'close',
         }
       ]
     });
     //@ts-ignore
     await actionsheet.present();
    }
    async updateImage() {
        // send request to the web service here
        const loading = await this.loadingController.create({
            message: 'Updating you Image ....',
        });
        loading.present();
        // set token
        this.data.token = this.Token;
        // call add profile service
        this.Profile.updateImage(this.data.token , this.NewPhotoSelect)
        .then(async success => {
            // @ts-ignore
            const SuccessToast = await this.toast.create({
                message: 'profile Image updated successfully',
                duration: 2000
            });
            SuccessToast.present();
            this.data.image = "data:image/jpeg;base64,"+ this.NewPhotoSelect;
            loading.dismiss();
        })
        .catch(async err => {
            console.log(err);
            // create toast in case of success
            const Errtoast = await this.toast.create({
                message: 'profile Image not saved',
                duration: 2000
            });
            Errtoast.present();            
            loading.dismiss();
        });
    }
    checkHasImage () {
        return (this.data.image === 'http://www.drivixcorp.com/api/storage/default.png/users');
    }
}
