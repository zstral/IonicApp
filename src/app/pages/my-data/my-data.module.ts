import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyDataPageRoutingModule } from './my-data-routing.module';

import { MyDataPage } from './my-data.page';

import { WorkExpComponent } from 'src/app/components/work-exp/work-exp.component';
import { CertsComponent } from 'src/app/components/certs/certs.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyDataPageRoutingModule,
    WorkExpComponent,
    CertsComponent
  ],
  declarations: [MyDataPage]
})
export class MyDataPageModule {}
