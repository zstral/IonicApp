import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { DBTaskService } from 'src/app/services/dbtask.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup-extended',
  templateUrl: './signup-extended.page.html',
  styleUrls: ['./signup-extended.page.scss'],
  standalone: false
})
export class SignupExtendedPage implements OnInit, OnDestroy {
  
  initialUserData: any;

  userExtended = {
    nombre : '',
    apellido: '',
    nivelEducacion: '',
    fechaNacimiento: new Date().toISOString()
  };

  private dbReadySubscription!: Subscription;
  
  constructor(
    private activeroute: ActivatedRoute,
    private router: Router,
    private dbTaskService: DBTaskService,
    private authService: AuthService
  ) {
    this.activeroute.queryParams.subscribe(params => {
      const currentNavigation = this.router.getCurrentNavigation();
      if (currentNavigation && currentNavigation.extras.state) {
        this.initialUserData = currentNavigation.extras.state['user'];
      } else {
        this.router.navigate(['/signup']);
      }
    })
  }
  
  ngOnInit() {
    this.dbReadySubscription = this.dbTaskService.getDatabaseState().subscribe(ready => {
      if (ready) {
        console.log('DB lista en SignupExtended.');
      } else {
        console.log('DB no lista en SignupExtended');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.dbReadySubscription) {
      this.dbReadySubscription.unsubscribe();
      console.log('Suscripción a dbReadySubscription cancelada.');
    }
  }

  async onSubmit(form: NgForm) {
    if (form.valid) {
      if (!this.initialUserData || !this.initialUserData.username || !this.initialUserData.password) {
        console.error('No se pueden obtener los datos iniciales del usuario.');
        this.router.navigate(['/signup']);
        return;
      }

      const finalUser: User = {
        username: this.initialUserData.username,
        password: this.initialUserData.password,
        nombre: this.userExtended.nombre,
        apellido: this.userExtended.apellido,
        nivelEducacion: this.userExtended.nivelEducacion,
        fechaNacimiento: this.userExtended.fechaNacimiento
      };

      const success = await this.dbTaskService.addUser(finalUser);
      if (success) {
        console.log('Usuario registrado exitosamente.');
        this.router.navigate(['/home']);
      } else {
        console.error('Falló el registro del usuario.');
      }
    } else {
      console.log('El formulario no es válido.');
      form.control.markAllAsTouched();
    }
  }

}
