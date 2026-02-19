import { TestBed } from '@angular/core/testing';

import { Campaigns } from './campaigns';

describe('Campaigns', () => {
  let service: Campaigns;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Campaigns);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
