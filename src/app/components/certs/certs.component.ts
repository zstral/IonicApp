import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, NgModel, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';

import { Certs } from 'src/app/models/certs.model';
import { DBTaskService } from 'src/app/services/dbtask.service';

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
export class CertsComponent  implements OnInit, OnDestroy {

  @ViewChild('certForm') certForm!: NgForm;

  certData: Certs = {
    name: '',
    acquiredDate: null,
    expirationDate: null
  };

  hasExpiration: boolean = false;
  certsList: Certs[] = [];
  private certsSubscription: Subscription | undefined;

  constructor(private dbTaskService: DBTaskService) { }

  ngOnInit() {
    this.subscribeToCerts();
  }

  ngOnDestroy() {
    if (this.certsSubscription) {
      this.certsSubscription.unsubscribe();
    }
  }

  subscribeToCerts() {
    this.certsSubscription = this.dbTaskService.getCertsObservable().subscribe(certs => {
      this.certsList = certs;
      console.log('Certificados cargados/actualizados:', this.certsList);
    });
    this.dbTaskService.loadCerts();
  }

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

 async onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Formulario enviado:', this.certData);
      const certToSave: Certs = { ...this.certData };
      if (certToSave.acquiredDate instanceof Date) {
        certToSave.acquiredDate = certToSave.acquiredDate.toISOString();
      } else if (typeof certToSave.acquiredDate === 'string' && certToSave.acquiredDate) {
      } else {
         certToSave.acquiredDate = null;
      }

      if (certToSave.expirationDate instanceof Date) {
        certToSave.expirationDate = certToSave.expirationDate.toISOString();
      } else if (typeof certToSave.expirationDate === 'string' && certToSave.expirationDate) {
      } else {
        certToSave.expirationDate = null;
      }

      const success = await this.dbTaskService.addCert(certToSave);
      if (success) {
        this.resetForm();
      } else {
        console.error('La operación de guardado de certificado no fue exitosa.');
      }
    } else {
      console.log('El formulario no es válido.');
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
    }
  }

  resetForm() {
    this.certData = {
      name: '',
      acquiredDate: null,
      expirationDate: null
    };
    this.hasExpiration = false;
    this.certForm.resetForm();
  }

  async deleteCert(id: number | undefined) {
    if (id !== undefined) {
      if (confirm('¿Estás seguro de que quieres eliminar esta certificación?')) {
        await this.dbTaskService.deleteCert(id);
      }
    } else {
      console.warn('Intento de eliminar certificado sin ID.');
    }
  }

}
