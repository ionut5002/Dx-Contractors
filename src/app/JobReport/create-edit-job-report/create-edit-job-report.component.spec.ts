import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditJobReportComponent } from './create-edit-job-report.component';

describe('CreateEditJobReportComponent', () => {
  let component: CreateEditJobReportComponent;
  let fixture: ComponentFixture<CreateEditJobReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditJobReportComponent]
    });
    fixture = TestBed.createComponent(CreateEditJobReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
