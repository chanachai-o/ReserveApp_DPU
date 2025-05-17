import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationStatus } from '../../models/all.model';

export interface ReserveTableModel {
  start_time: string;
  end_time: string;
  num_people: number;
  user_id: number | undefined;
  phone: string;
  table_id: number;
  status: string;
}

@Component({
  selector: 'app-table-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './table-reservation.component.html',
})
export class TableReservationComponent {
  @Input() tableId?: number;
  @Input() userId?: number;
  @Input() status : string = 'pending'
  @Output() reserve = new EventEmitter<ReserveTableModel>();

  form = this.fb.group({
    start_time: ['', Validators.required],
    num_people: [1, [Validators.required, Validators.min(1)]],
    user_id: [0], // option: สามารถ set จาก parent
    phone: [''],
    table_id: [0, Validators.required],
    status: ['pending'],
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    if (this.tableId) {
      this.form.patchValue({ table_id: this.tableId });
    }
    if (this.userId) {
      this.form.patchValue({ user_id: this.userId });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    if (changes['tableId'].currentValue) {
      this.tableId = changes['tableId'].currentValue
      this.form = this.fb.group({
        start_time: ['', Validators.required],
        num_people: [1, [Validators.required, Validators.min(1)]],
        user_id: [0], // option: สามารถ set จาก parent
        phone: [''],
        table_id: [changes['tableId'].currentValue, Validators.required],
        status: ['pending'],
      });
      this.status = changes['status'].currentValue
    }
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

  }

  submit() {
    console.log(this.form)
    if (this.form.valid) {
      this.reserve.emit(this.form.value as ReserveTableModel);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
