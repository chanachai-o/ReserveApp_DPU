import { Component } from '@angular/core';
import { OrderFoodModalComponent } from '../../customer/order-food-modal/order-food-modal.component';
import { MenusModel, OrderItem } from '../../models/all.model';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenusService } from '../../services/menu.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-take-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './take-home.component.html',
  styleUrl: './take-home.component.scss'
})
export class TakeHomeComponent {
  userId!: number;
  reservationId!: number;
  menuList: MenusModel[] = [];
  orderItems?: OrderItem[] = []; // <-- เพิ่ม input ตรงนี้

  form!: FormGroup;

  constructor(private fb: FormBuilder, private menuService: MenusService) { }

  ngOnInit() {
    this.getMenu();
    this.initForm();
  }


  getMenu() {
    this.menuService.getLists().subscribe(result => {
      this.menuList = result
    })
  }

  initForm() {
    this.form = this.fb.group({
      status: ['pending', Validators.required],
      user_id: [this.userId, Validators.required],
      reservation_id: [this.reservationId, Validators.required],
      order_items: this.fb.array([])
    });

    // ถ้ามี orderItems เดิม preload เข้า FormArray
    // if (this.orderItems && this.orderItems.length) {
    //   this.orderItems.forEach(item => {
    //     this.items.push(this.createItem(item));
    //   });
    // } else {
    //   this.items.push(this.createItem());
    // }
  }

  get items(): FormArray {
    return this.form.get('order_items') as FormArray;
  }

  createItem(item?: OrderItem): FormGroup {
    return this.fb.group({
      menu_id: [item?.menu_id ?? null, Validators.required],
      quantity: [item?.quantity ?? 1, [Validators.required, Validators.min(1)]],
      status: [item?.status ?? 'pending', Validators.required] // เพิ่มสถานะอาหารแต่ละรายการ
    });
  }

  addItem(item?: any) {
    this.items.push(this.createItem(item));
  }

  removeItem(i: number) {
    if (this.items.length > 1) {
      this.items.removeAt(i);
    }
  }

  menuById(id: number): MenusModel | undefined {
    return this.menuList.find(m => m.id === id);
  }

  // รวมยอดเงินอัตโนมัติ
  getTotal(): number {
    return this.items.controls.reduce((sum, ctrl) => {
      const menuId = ctrl.value.menu_id;
      const qty = ctrl.value.quantity || 1;
      const menu = this.menuById(menuId);
      return sum + ((menu?.price || 0) * qty);
    }, 0);
  }

  onSubmit() {
    // if (this.form.valid) {
    //   this.submitOrder.emit(this.form.value);
    // } else {
    //   this.form.markAllAsTouched();
    // }
  }
}
