import { TestBed } from '@angular/core/testing';

import { CutomerDetailsService } from './cutomer-details-service';

describe('CutomerDetailsService', () => {
  let service: CutomerDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CutomerDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
