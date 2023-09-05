import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditInvoiceComponent } from './create-edit-invoice.component';

describe('CreateEditInvoiceComponent', () => {
  let component: CreateEditInvoiceComponent;
  let fixture: ComponentFixture<CreateEditInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditInvoiceComponent]
    });
    fixture = TestBed.createComponent(CreateEditInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
