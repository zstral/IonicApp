import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage,
    children: [
      {
      path: 'my-data',
      loadChildren: () => import('../my-data/my-data.module').then(m => m.MyDataPageModule)
      },
      {
        path: 'tasks',
        loadChildren: () => import('../tasks/tasks.module').then(m => m.TasksPageModule)
      },
      {
        path: 'my-profile',
        loadChildren: () => import('../my-profile/my-profile.module').then(m => m.MyProfilePageModule)
      },
      {
        path: '',
        redirectTo: '/main/my-data',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
