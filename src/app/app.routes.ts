import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'Planner',
    loadComponent: () => import('./planner/planner.page').then(m => m.PlannerPageComponent)
  },
  {
    path: '',
    redirectTo: 'Planner',
    pathMatch: 'full'
  }
];
