import { TestBed } from '@angular/core/testing';

import { AdminPolicyData } from './admin-policy-data';

describe('AdminPolicyData', () => {
  let service: AdminPolicyData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminPolicyData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
