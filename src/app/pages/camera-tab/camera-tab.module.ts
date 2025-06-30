import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CameraTabPageRoutingModule } from './camera-tab-routing.module';

import { CameraTabPage } from './camera-tab.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CameraTabPageRoutingModule
  ],
  declarations: [CameraTabPage]
})
export class CameraTabPageModule {}
