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
      path: 'manage-member',
      loadComponent: () =>
        import('./user-management/user-setting/user-setting.component').then((m) => m.UserSettingComponent),
    },
    {
      path: 'manage-customer',
      loadComponent: () =>
        import('./customer-management/customer-management.component').then((m) => m.CustomerManagementComponent),
    },
    {
      path: 'manage-menu',
      loadComponent: () =>
        import('./menus-management/menus-management.component').then((m) => m.MenusManagementComponent),
    },
    {
      path: 'manage-room-table',
      loadComponent: () =>
        import('./room-table-management/room-table-management.component').then((m) => m.RoomTableManagementComponent),
    },

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
