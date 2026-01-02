import { TestBed } from '@angular/core/testing';

import { AdminRiskData } from './admin-risk-data';

describe('AdminRiskData', () => {
  let service: AdminRiskData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminRiskData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
