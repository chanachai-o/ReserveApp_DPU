import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
export class TableReservationComponent implements OnInit, OnChanges {
  @Input() tableId?: number;
  @Input() roomId?: number;
  @Input() userId?: number;
  @Input() status: string = 'pending';
  @Input() type?: string
  @Input() phone?: string;
  @Output() reserve = new EventEmitter<ReserveTableModel>();
  minDateTime: string;
  form = this.fb.group({
    start_time: [this.getCurrentLocalDateTime(), Validators.required],
    num_people: [1, [Validators.required, Validators.min(1)]],
    user_id: [0],
    phone: [''],
    table_id: [0],
    room_id: [0],
    status: ['pending'],
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.minDateTime = this.getCurrentLocalDateTime();
    // set default from @Input on load
    if (this.tableId) this.form.patchValue({ table_id: this.tableId });
    if (this.roomId) this.form.patchValue({ room_id: this.roomId });
    if (this.userId) this.form.patchValue({ user_id: this.userId });
    if (this.status) this.form.patchValue({ status: this.status });
    if (this.phone) this.form.patchValue({ phone: this.phone });
  }

  getCurrentLocalDateTime(): string {
    const now = new Date();
    // แปลงเป็น local ISO format 'YYYY-MM-DDTHH:mm'
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    // update form when @Input changes (ไม่ต้อง reset ทั้ง form)
    if (changes['tableId'] && changes['tableId'].currentValue) {
      this.form.patchValue({ table_id: changes['tableId'].currentValue });
    }
    if (changes['roomId'] && changes['roomId'].currentValue) {
      this.form.patchValue({ room_id: changes['roomId'].currentValue });
    }
    if (changes['userId'] && changes['userId'].currentValue) {
      this.form.patchValue({ user_id: changes['userId'].currentValue });
    }
    if (changes['status'] && changes['status'].currentValue) {
      this.status = changes['status'].currentValue;
      this.form.patchValue({ status: this.status });
    }
    if (changes['type'] && changes['type'].currentValue) {
      this.type = changes['type'].currentValue;
    }
    if (changes['phone'] && changes['phone'].currentValue) {
      this.form.patchValue({ phone: changes['phone'].currentValue });
    }
  }

  submit() {
    console.log(this.form.value)
    console.log(this.type)
    if (this.form.valid) {
      // ตัดค่าที่ไม่ได้เลือกออก เช่น ถ้าไม่มี table_id ก็ไม่ต้องส่ง, เอาเฉพาะ field ที่จำเป็น
      const value = { ...this.form.value };
      if (this.type == 'room') {
        delete value.table_id;
      } else {
        delete value.room_id;
      }
      this.reserve.emit(value as ReserveTableModel);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
