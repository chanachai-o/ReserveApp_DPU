import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonComponent } from './common.component';
import { RouterModule, Routes } from '@angular/router';
export const admin: Routes = [
  {
    path: 'admin', children: [{
      path: 'home',
      loadComponent: () =>
        import('./home-common/home-common.component').then((m) => m.HomeCommonComponent),
    },
    {
      path: 'member-manage',
      loadComponent: () =>
        import('./user-management/user-setting/user-setting.component').then((m) => m.UserSettingComponent),
    },
    {
      path: 'manage-companys',
      loadComponent: () =>
        import('./company-manage/company-manage.component').then((m) => m.CompanyManageComponent),
    },
    {
      path: 'manage-companys/:projectId',
      loadComponent: () =>
        import('./company-manage/project-detail/project-detail.component').then((m) => m.ProjectDetailComponent),
    },
    {
      path: 'admin-manage',
      loadComponent: () =>
        import('./admin-manage/admin-manage.component').then((m) => m.AdminManageComponent),
    },
    //////////////emp/////////////////
    {
      path: 'borrow-management',
      loadComponent: () =>
        import('./borrow-management/borrow-management.component').then((m) => m.BorrowManagementComponent),
    }
    ]
  }
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(admin)
  ],
  exports: [RouterModule],
  declarations: [CommonComponent]
})
export class CommonManageModule {
  static routes = admin;
}
