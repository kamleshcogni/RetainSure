import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRisk } from './admin-risk';

describe('AdminRisk', () => {
  let component: AdminRisk;
  let fixture: ComponentFixture<AdminRisk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRisk]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRisk);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
