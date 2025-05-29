import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerComponent } from './customer.component';
import { Routes } from '@angular/router';
import { ReservationListComponent } from './reservation-list/reservation-list.component';
import { ReservationDetailComponent } from './reservation-detail/reservation-detail.component';
import { OrderFoodComponent } from './order-food/order-food.component';
import { BillComponent } from './bill/bill.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationComponent } from './notification/notification.component';
import { CustomerReservationPageComponent } from './customer-reservation-page/customer-reservation-page.component';
export const customerRoutes: Routes = [
  {
    path: 'customer', children: [
      { path: 'home-customer', component: CustomerReservationPageComponent },
      { path: 'reservations', component: ReservationListComponent },
      { path: 'reservations/:id', component: ReservationDetailComponent },
      { path: 'reservations/:id/order', component: OrderFoodComponent },
      { path: 'reservations/:id/bill', component: BillComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'notifications', component: NotificationComponent }
    ]
  },

];
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CustomerComponent]
})
export class CustomerModule {
  static routes = customerRoutes;
}
