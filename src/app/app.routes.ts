import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'Planner',
    loadComponent: () => import('./planner/planner.page').then(m => m.PlannerPageComponent)
  },
  {
    path: 'Machines',
    loadComponent: () => import('./machine-catalog/machine-catalog.component').then(m => m.MachineCatalogComponent)
  },
  {
    path: '',
    redirectTo: 'Planner',
    pathMatch: 'full'
  }
];
