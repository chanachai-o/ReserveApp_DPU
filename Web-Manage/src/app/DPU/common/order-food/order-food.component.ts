import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuModel } from '../../models/menus.model';

@Component({
  selector: 'app-order-food',
  standalone: true,
  templateUrl: './order-food.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class OrderFoodComponent implements OnInit {
  @Input() userId!: number;
  @Input() reservationId!: number;
  @Input() menuList: MenuModel[] = [];
  @Output() submitOrder = new EventEmitter<any>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      status: ['pending', Validators.required],
      user_id: [this.userId, Validators.required],
      reservation_id: [this.reservationId, Validators.required],
      items: this.fb.array([this.createItem()])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    if (changes['reservationId'].currentValue) {
      this.reservationId = changes['reservationId'].currentValue
      this.form = this.fb.group({
        status: ['pending', Validators.required],
        user_id: [this.userId, Validators.required],
        reservation_id: [this.reservationId, Validators.required],
        items: this.fb.array([this.createItem()])
      });
    }
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      menu_id: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(i: number) {
    if (this.items.length > 1) {
      this.items.removeAt(i);
    }
  }

  onSubmit() {
    console.log(this.form.value)
    if (this.form.valid) {
      this.submitOrder.emit(this.form.value);
    }
  }
}
