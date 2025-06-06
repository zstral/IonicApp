import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignupExtendedPage } from './signup-extended.page';

const routes: Routes = [
  {
    path: '',
    component: SignupExtendedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignupExtendedPageRoutingModule {}
