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
