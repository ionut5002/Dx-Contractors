import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewJobReportComponent } from './view-job-report.component';

describe('ViewJobReportComponent', () => {
  let component: ViewJobReportComponent;
  let fixture: ComponentFixture<ViewJobReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewJobReportComponent]
    });
    fixture = TestBed.createComponent(ViewJobReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
