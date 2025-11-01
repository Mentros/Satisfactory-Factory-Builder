import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'Planner',
    loadComponent: () => import('./planner/planner.page').then(m => m.PlannerPageComponent)
  },
  {
    path: 'Factories',
    loadComponent: () => import('./factory/factory.component').then(m => m.FactoryComponent)
  },
  {
    path: '',
    redirectTo: 'Planner',
    pathMatch: 'full'
  }
];
