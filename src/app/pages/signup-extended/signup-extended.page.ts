import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-signup-extended',
  templateUrl: './signup-extended.page.html',
  styleUrls: ['./signup-extended.page.scss'],
  standalone: false
})
export class SignupExtendedPage implements OnInit {
  
  data: any;

  userExtended = {
    nombre : '',
    apellido: '',
    nivelEducacion: '',
    fechaNacimiento: new Date().toISOString()
  };
  
  constructor(private activeroute: ActivatedRoute, private router: Router) {
    this.activeroute.queryParams.subscribe(params => {
      const currentNavigation = this.router.getCurrentNavigation();
      if (currentNavigation && currentNavigation.extras.state) {
        this.data = currentNavigation.extras.state['user'];
        this.userExtended = {...this.userExtended, ...this.data};
      } else {
        this.router.navigate(['/signup']);
      }
    })
  }

  ngOnInit() {}

  onSubmit(form: NgForm) {
    let navigationExtras: NavigationExtras = {
      state: {
        userExtended: this.userExtended
      }
    };
    this.router.navigate(['/home'], navigationExtras);
  }

}
