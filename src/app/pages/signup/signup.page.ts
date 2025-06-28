import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: false
})
export class SignupPage implements OnInit {

  user = {
    username: '',
    password: ''
  }

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      let navigationExtras: NavigationExtras = {
      state: {
        user: this.user
      }
    };
    this.router.navigate(['/signup-extended'], navigationExtras);
    console.log(this.user);
    } else {
      console.log('El formulario no es valido.');
      form.control.markAllAsTouched();
    }
  }

}
