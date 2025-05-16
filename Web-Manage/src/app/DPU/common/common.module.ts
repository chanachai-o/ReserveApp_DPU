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
      path: 'manage-store',
      loadComponent: () =>
        import('./store-management/store-management.component').then((m) => m.StoreManagementComponent),
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
      path: 'manage-table',
      loadComponent: () =>
        import('./table-management/table-management.component').then((m) => m.TableManagementComponent),
    },
    {
      path: 'manage-room',
      loadComponent: () =>
        import('./room-management/room-management.component').then((m) => m.RoomManagementComponent),
    },
    {
        path: 'walk-in',
        loadComponent: () =>
          import('./walk-in-reservation/walk-in-reservation.component').then((m) => m.WalkInReservationComponent),
      },
      {
        path: 'reserved',
        loadComponent: () =>
          import('./reserved-room-tables/reserved-room-tables.component').then((m) => m.ReservedRoomTablesComponent),
      },
      {
        path: 'takehome',
        loadComponent: () =>
          import('./take-home/take-home.component').then((m) => m.TakeHomeComponent),
      },

    ]
  },

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
