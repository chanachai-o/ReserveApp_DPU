/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TableReservationModalComponent } from './table-reservation-modal.component';

describe('TableReservationModalComponent', () => {
  let component: TableReservationModalComponent;
  let fixture: ComponentFixture<TableReservationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableReservationModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableReservationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
