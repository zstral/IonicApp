import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CertsComponent } from '../certs/certs.component';
import { WorkExpComponent } from '../work-exp/work-exp.component';

@Component({
  selector: 'app-my-data',
  templateUrl: './my-data.component.html',
  styleUrls: ['./my-data.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    CertsComponent,
    WorkExpComponent
  ]
})
export class MyDataComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
