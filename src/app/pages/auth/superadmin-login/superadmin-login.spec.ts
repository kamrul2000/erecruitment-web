import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperadminLogin } from './superadmin-login';

describe('SuperadminLogin', () => {
  let component: SuperadminLogin;
  let fixture: ComponentFixture<SuperadminLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperadminLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperadminLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
