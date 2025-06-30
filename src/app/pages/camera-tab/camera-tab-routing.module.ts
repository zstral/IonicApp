import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CameraTabPage } from './camera-tab.page';

const routes: Routes = [
  {
    path: '',
    component: CameraTabPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CameraTabPageRoutingModule {}
