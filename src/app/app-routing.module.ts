import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'list',
    loadChildren: './list/list.module#ListPageModule'
  } ,
  {
    path: 'login',
    loadChildren: './public/login/login.module#LoginPageModule'
  }  ,
  {
    path: 'profile',
    loadChildren: './profile/profile.module#ProfilePageModule'
  }  ,
  {
    path: 'winchRequest',
    loadChildren: './winch-request/winch-request.module#WinchRequestPageModule'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
