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
  profilePictureUrl: string | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.userProfile = user;
      console.log('Datos de perfil cargados en ProfilePage:', this.userProfile);
    });
    this.loadProfilePicture();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadProfilePicture() {
    const storedPicture = localStorage.getItem('profilePicture');
    if (storedPicture) {
      this.profilePictureUrl = storedPicture;
      console.log('Foto de perfil cargada de LocalStorage.');
    } else {
      this.profilePictureUrl = null;
      console.log('No hay foto de perfil guardada.');
    }
  }

  logout() {
    this.authService.logout();
  }

}
