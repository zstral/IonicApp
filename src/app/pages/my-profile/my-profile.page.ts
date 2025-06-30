import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
  standalone: false
})
export class MyProfilePage implements OnInit, OnDestroy {

  userProfile: User | null = null;
  private userSubscription: Subscription | undefined;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.userProfile = user;
      console.log('Datos de perfil cargados en ProfilePage:', this.userProfile);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
  }

}
