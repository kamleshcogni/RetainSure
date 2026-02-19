import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPlolicyList } from './admin-plolicy-list';

describe('AdminPlolicyList', () => {
  let component: AdminPlolicyList;
  let fixture: ComponentFixture<AdminPlolicyList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPlolicyList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPlolicyList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
