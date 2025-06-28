import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, NgModel, NgForm } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';

import { Certs } from 'src/app/models/certs.model';

@Component({
  selector: 'app-certs',
  templateUrl: './certs.component.html',
  styleUrls: ['./certs.component.scss'],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
  ]
})
export class CertsComponent  implements OnInit {

  certData: Certs = {
    id: 0,
    name: '',
    acquiredDate: null,
    expirationDate: null
  };

  hasExpiration: boolean = false;

  constructor() { }

  ngOnInit() {}

  onToggleExpirationChange(event: MatSlideToggleChange) {
    this.hasExpiration = event.checked;
    if (!this.hasExpiration) {
      this.certData.expirationDate = null;
    }
  }

  onDateSelected(modelField: NgModel): void {
    modelField.control?.markAsDirty();
    modelField.control?.markAsTouched();
  }

  onSubmit(form: any) {
    if (form.valid) {
      console.log('Formulario enviado:', this.certData);
      // Enviar los datos (this.certData) a un servicio o API.
    } else {
      console.log('El formulario no es válido.');
    }
  }

}
