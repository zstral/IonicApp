import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Experience } from 'src/app/models/exp.model';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-work-exp',
  templateUrl: './work-exp.component.html',
  styleUrls: ['./work-exp.component.scss'],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    MatSlideToggleModule
  ],
})
export class WorkExpComponent  implements OnInit {

  expData: Experience = {
    id: 0,
    company: '',
    startYear: null,
    currentJob: false,
    endYear: null,
    jobPosition: ''
  };
  
    constructor() { }
  
    ngOnInit() {}
  
    onCurrentJobChange(event: MatSlideToggleChange) {
    this.expData.currentJob = event.checked;

    if (this.expData.currentJob) {
      this.expData.endYear = null;
    }
  }
  
    onSubmit(form: any) {
      if (form.valid) {
        console.log('Formulario enviado:', this.expData);
        // Enviar los datos (this.certData) a un servicio o API.
      } else {
        console.log('El formulario no es válido.');
      }
    }
}
