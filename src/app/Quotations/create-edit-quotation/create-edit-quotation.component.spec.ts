import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditQuotationComponent } from './create-edit-quotation.component';

describe('CreateEditQuotationComponent', () => {
  let component: CreateEditQuotationComponent;
  let fixture: ComponentFixture<CreateEditQuotationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditQuotationComponent]
    });
    fixture = TestBed.createComponent(CreateEditQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
