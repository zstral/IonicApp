import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, NgForm } from '@angular/forms';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subscription } from 'rxjs';

import { Experience } from 'src/app/models/exp.model';
import { DBTaskService } from 'src/app/services/dbtask.service';

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
export class WorkExpComponent  implements OnInit, OnDestroy {

  @ViewChild('expForm') expForm!: NgForm;

  expData: Experience = {
    company: '',
    startYear: null,
    currentJob: false,
    endYear: null,
    jobPosition: ''
  };

  experiencesList: Experience[] = [];
  private experiencesSubscription: Subscription | undefined;
  
  constructor(private dbTaskService: DBTaskService) { }

  ngOnInit() {
    this.subscribeToExperiences();
  }

  ngOnDestroy() {
    if (this.experiencesSubscription) {
      this.experiencesSubscription.unsubscribe();
    }
  }

  subscribeToExperiences() {
    this.experiencesSubscription = this.dbTaskService.getExperiencesObservable().subscribe(expList => {
      this.experiencesList = expList;
      console.log('Experiencias cargadas/actualizadas:', this.experiencesList);
    });
    this.dbTaskService.loadExperiences();
  }

  onCurrentJobChange(event: MatSlideToggleChange) {
  this.expData.currentJob = event.checked;

    if (this.expData.currentJob) {
      this.expData.endYear = null;
    }
  }

  async onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Formulario válido, enviando datos:', this.expData);
      
      const success = await this.dbTaskService.addExperience(this.expData);

      if (success) {
        this.resetForm();
      } else {
        console.error('La operación de guardado de experiencia no fue exitosa.');
      }
    } else {
      console.log('El formulario no es válido.');
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
    }
  }

  async deleteExperience(id: number | undefined) {
    if (id !== undefined) {
      if (confirm('¿Estás seguro de que quieres eliminar esta experiencia laboral?')) {
        await this.dbTaskService.deleteExperience(id);
      }
    } else {
      console.warn('Intento de eliminar experiencia sin ID.');
    }
  }

  resetForm() {
    this.expData = {
      company: '',
      startYear: null,
      currentJob: false,
      endYear: null,
      jobPosition: ''
    };
    this.expForm.resetForm();
  }
  
}