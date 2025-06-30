import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapTabPageRoutingModule } from './map-tab-routing.module';

import { MapTabPage } from './map-tab.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapTabPageRoutingModule
  ],
  declarations: [MapTabPage]
})
export class MapTabPageModule {}
