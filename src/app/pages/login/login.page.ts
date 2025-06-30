import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  credentials = {
    username: '',
    password: ''
  }

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      console.log('Ya estas logueado. Redirigiendo a Home...');
      this.router.navigate(['/main']);
    }
  }

  async login(form: NgForm) {
    if (form.valid) {
      const success = await this.authService.login(this.credentials.username, this.credentials.password);
      if (success) {
        console.log('Inicio de sesión exitoso. Redirigiendo a Home...');
        this.router.navigate(['/main']);
      }
    } else {
      console.log('El formulario no es valido.');
      form.control.markAllAsTouched();
    }
  }

}
