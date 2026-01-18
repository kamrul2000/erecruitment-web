import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTenantDialog } from './create-tenant-dialog';

describe('CreateTenantDialog', () => {
  let component: CreateTenantDialog;
  let fixture: ComponentFixture<CreateTenantDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTenantDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTenantDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
