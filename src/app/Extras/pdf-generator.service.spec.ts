import { TestBed } from '@angular/core/testing';

import { PDFGeneratorService } from './pdf-generator.service';

describe('PDFGeneratorService', () => {
  let service: PDFGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PDFGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
