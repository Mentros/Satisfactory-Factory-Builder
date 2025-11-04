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
    path: 'BuildPlanner',
    loadComponent: () => import('./build-planner/build-planner').then(m => m.BuildPlanner)
  },
  {
    path: '',
    redirectTo: 'Planner',
    pathMatch: 'full'
  }
];
