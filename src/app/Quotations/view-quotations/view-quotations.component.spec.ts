import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuotationsComponent } from './view-quotations.component';

describe('ViewQuotationsComponent', () => {
  let component: ViewQuotationsComponent;
  let fixture: ComponentFixture<ViewQuotationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewQuotationsComponent]
    });
    fixture = TestBed.createComponent(ViewQuotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
