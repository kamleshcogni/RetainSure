import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCampaigns } from './admin-campaigns';

describe('AdminCampaigns', () => {
  let component: AdminCampaigns;
  let fixture: ComponentFixture<AdminCampaigns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCampaigns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCampaigns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
