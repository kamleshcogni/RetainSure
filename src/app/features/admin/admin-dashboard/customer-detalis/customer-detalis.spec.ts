import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDetalis } from './customer-detalis';

describe('CustomerDetalis', () => {
  let component: CustomerDetalis;
  let fixture: ComponentFixture<CustomerDetalis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDetalis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDetalis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
