import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  userData: any = {};
  private _storage: Storage | null = null;

  constructor(
    private activeroute: ActivatedRoute,
    private router: Router,
    private storage: Storage
  ) {}
  
  async ngOnInit() {
    this._storage = await this.storage.create();
    let state = history.state;
    if (state && state['userExtended']) {
      this.userData = state['userExtended'];
    } else {
      this.activeroute.queryParams.subscribe(params => {
        const currentNavigation = this.router.getCurrentNavigation();
        if (currentNavigation?.extras.state?.['userExtended']) {
          this.userData = currentNavigation.extras.state['userExtended'];
        } else {
          this.router.navigate(['/login'], { replaceUrl: true });
        }
      });
    }
  }

  async logout() {
    if (this._storage) {
      await this._storage['remove']('tasks');
    }
    this.userData = null;
    this.router.navigate(['/login', { replaceUrl: true }])
  }
}