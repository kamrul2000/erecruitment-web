import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaasTenants } from './saas-tenants';

describe('SaasTenants', () => {
  let component: SaasTenants;
  let fixture: ComponentFixture<SaasTenants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaasTenants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaasTenants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
