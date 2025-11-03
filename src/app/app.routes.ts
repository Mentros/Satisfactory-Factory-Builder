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
    path: 'VisNetwork',
    loadComponent: () => import('./vis-network/vis-network').then(m => m.VisNetwork)
  },
  {
    path: '',
    redirectTo: 'Planner',
    pathMatch: 'full'
  }
];
