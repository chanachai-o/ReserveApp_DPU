import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallManagementComponent } from './company-management.component';
import { RouterModule, Routes } from '@angular/router';

export const companyRoutes: Routes = [

  {
    path: 'company/home/:projectId',
    loadComponent: () =>
      import('./home-installer/home-installer.component').then((m) => m.HomeInstallerComponent),
  },




];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(companyRoutes)
  ],
  exports: [RouterModule],
  declarations: [InstallManagementComponent]
})
export class CompanyManagementModule {
  static routes = companyRoutes;
}
