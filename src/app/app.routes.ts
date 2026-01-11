import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then(m => m.Login) },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then(m => m.ShellComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard/dashboard').then(m => m.Dashboard) },
    //   { path: 'tenants', loadComponent: () => import('./pages/tenants/tenants.component').then(m => m.TenantsComponent) },
    //   { path: 'candidates', loadComponent: () => import('./pages/candidates/candidates.component').then(m => m.CandidatesComponent) },
    //   { path: 'jobs', loadComponent: () => import('./pages/jobs/jobs.component').then(m => m.JobsComponent) },
    //   { path: 'applications', loadComponent: () => import('./pages/applications/applications.component').then(m => m.ApplicationsComponent) },
    ]
  },

  { path: '**', redirectTo: '' }
];
