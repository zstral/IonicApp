import { Component, OnInit, OnDestroy } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {

  userData: any = {};
  private userSubscription!: Subscription

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  async ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.userData = user;
    })
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      console.log('Home: currentUser$ cancelado.');
    }
  }

  async logout() {
    console.log('Cerrando sesión...');
    await this.authService.logout();
  }
}