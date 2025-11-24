import { Routes } from '@angular/router';

import { ConfigComponent } from './features/config/config.component';
import { HomeComponent } from './features/home/home.component';
import { configGuard, configPageGuard } from './core/guards/config.guard';

export const routes: Routes = [
  {
    path: 'config',
    component: ConfigComponent,
    title: 'AzureAuthViewer | Configuration',
    canActivate: [configPageGuard]
  },
  {
    path: '',
    component: HomeComponent,
    title: 'AzureAuthViewer | Home',
    canActivate: [configGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
