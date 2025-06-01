import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenusModel, Order, OrderItem } from '../../models/all.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { MenusService } from '../../services/menu.service';

@Component({
  selector: 'app-order-food',
  standalone: true,
  templateUrl: './order-food.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule]
})
export class OrderFoodComponent implements OnInit, OnChanges {
  @Input() userId!: number;
  @Input() reservationId!: number;
  menuList: MenusModel[] = [];
  @Input() orderItems?: OrderItem[] = []; // <-- เพิ่ม input ตรงนี้
  @Output() submitOrder = new EventEmitter<any>();
  @Input() isStaff = false

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

  ngOnChanges(changes: SimpleChanges): void {
    if (this.form) {
      if (changes['reservationId'] && changes['reservationId'].currentValue !== changes['reservationId'].previousValue) {
        this.form.patchValue({ reservation_id: changes['reservationId'].currentValue });
      }
      if (changes['userId'] && changes['userId'].currentValue !== changes['userId'].previousValue) {
        this.form.patchValue({ user_id: changes['userId'].currentValue });
      }
      if (changes['menuList'] && changes['menuList'].currentValue !== changes['menuList'].previousValue) {
        this.menuList = changes['menuList'].currentValue
      }
      if (changes['orderItems'] && changes['orderItems'].currentValue !== changes['orderItems'].previousValue) {
        this.orderItems = changes['orderItems'].currentValue
      }
      if (changes['reservationId'] || changes['orderItems']) {
        this.initForm();
      }
    }
  }

  initForm() {
    this.form = this.fb.group({
      status: ['pending', Validators.required],
      user_id: [this.userId, Validators.required],
      reservation_id: [this.reservationId, Validators.required],
      items: this.fb.array([])
    });

    // ถ้ามี orderItems เดิม preload เข้า FormArray
    if (this.orderItems && this.orderItems.length) {
      this.orderItems.forEach(item => {
        this.items.push(this.createItem(item));
      });
    } else {
      this.items.push(this.createItem());
    }
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
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
    if (this.form.valid) {
      this.submitOrder.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
