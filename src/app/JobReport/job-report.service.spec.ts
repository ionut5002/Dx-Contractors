import { TestBed } from '@angular/core/testing';

import { JobReportService } from './job-report.service';

describe('JobReportService', () => {
  let service: JobReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
