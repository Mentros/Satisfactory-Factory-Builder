import { Routes } from '@angular/router';
import { satisplanRoutes } from './satisplan/satisplan.routes';

export const routes: Routes = [
  ...satisplanRoutes,
  {
    path: '',
    redirectTo: 'Machines',
    pathMatch: 'full'
  }
];
