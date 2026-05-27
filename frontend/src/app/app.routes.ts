import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IncidentListComponent } from './incident/incident-list/incident-list.component';
import { IncidentFormComponent } from './incident/incident-form/incident-form.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'incidents', component: IncidentListComponent },
  { path: 'incidents/new', component: IncidentFormComponent },
  { path: 'incidents/edit/:id', component: IncidentFormComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

