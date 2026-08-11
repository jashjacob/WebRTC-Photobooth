import { Routes } from '@angular/router';
import { PhotoboothComponent } from './photobooth/photobooth.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: PhotoboothComponent, pathMatch: 'full' },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' }
];
