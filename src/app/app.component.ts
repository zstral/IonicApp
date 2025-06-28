import { Component, OnInit } from '@angular/core';
import { DBTaskService } from './services/dbtask.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {

  constructor(private dbTaskService: DBTaskService) {}

  ngOnInit() {

    this.dbTaskService.getDatabaseState().subscribe(ready => {
      if (ready) {
        console.log('DB lista');
      }
    });

  }
}
