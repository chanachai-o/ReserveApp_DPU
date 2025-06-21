import { Route } from '@angular/router';
import { ContentLayoutComponent } from './shared/layouts/content-layout/content-layout.component';
import { content } from './shared/routes/content.routes';
import { AuthenticationLayoutComponent } from './shared/layouts/authentication-layout/authentication-layout.component';
import { landingRoutingModule } from './components/pages/landing.routes';
import { landing } from './shared/routes/landing.routes';
import { LandingLayoutComponent } from './shared/layouts/landing-layout/landing-layout.component';
import { AuthGuard } from './shared/services/auth.guard';
import { LoginComponent } from './authentication/login/login.component';

import { LandingComponent } from './components/pages/landing/landing.component';
import { CustomerRegisterComponent } from './DPU/common/customer-register/customer-register.component';

export const App_Route: Route[] = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '', component: ContentLayoutComponent, children: content },
  {
    path: 'home',
    component: LandingComponent
  },
  {
    path: 'customer-register',
    component: CustomerRegisterComponent
  },
  {
    path: 'auth/login',
    component: LoginComponent
  }
]
