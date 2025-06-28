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
      this.router.navigate(['/home']);
    }
  }

  async login(form: NgForm) {
    if (form.valid) {
      const success = await this.authService.login(this.credentials.username, this.credentials.password);
      if (success) {
        this.router.navigate(['/home']);
      }
    } else {
      console.log('El formulario no es valido.');
      form.control.markAllAsTouched();
    }
  }

}
