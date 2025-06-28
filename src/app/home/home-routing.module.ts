import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home.module').then(m => m.HomePageModule)
      },
      {
        path: 'tasks',
        loadChildren: () => import('../pages/tasks/tasks.module').then(m => m.TasksPageModule)
      },
      {
        path: '',
        redirectTo: 'tashomeks',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
