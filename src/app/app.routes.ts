import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreateTripComponent } from './pages/create-trip/create-trip.component';
import { TripDetailComponent } from './pages/trip-detail/trip-detail.component';
import { AddEntryComponent } from './pages/add-entry/add-entry.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'create-trip',
    component: CreateTripComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trips/:id',
    component: TripDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trips/:tripId/add-entry',
    component: AddEntryComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
