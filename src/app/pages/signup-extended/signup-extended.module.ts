import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupExtendedPageRoutingModule } from './signup-extended-routing.module';

import { SignupExtendedPage } from './signup-extended.page';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupExtendedPageRoutingModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule
  ],
  declarations: [SignupExtendedPage],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-CL' }
  ]

})
export class SignupExtendedPageModule {}
