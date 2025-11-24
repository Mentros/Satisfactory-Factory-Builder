import { Routes } from '@angular/router';

export const satisplanRoutes: Routes = [
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
    redirectTo: 'Machines',
    pathMatch: 'full'
  }
];

