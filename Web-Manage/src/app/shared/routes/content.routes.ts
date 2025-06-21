import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { admin, CommonManageModule } from '../../DPU/common/common.module';
import { CompanyManagementModule } from '../../DPU/company-management/company-management.module';
import { CustomerModule } from '../../DPU/customer/customer.module';


export const content: Routes = [

  {
    path: '', children: [
      ...CommonManageModule.routes,
      ...CustomerModule.routes,
      ...CompanyManagementModule.routes
    ]
  }


];
@NgModule({
  imports: [RouterModule.forRoot(admin)],
  exports: [RouterModule]
})
export class SaredRoutingModule { }
