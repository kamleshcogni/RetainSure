import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEngage } from './admin-engage';

describe('AdminEngage', () => {
  let component: AdminEngage;
  let fixture: ComponentFixture<AdminEngage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEngage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEngage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
