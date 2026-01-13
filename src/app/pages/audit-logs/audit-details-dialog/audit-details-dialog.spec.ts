import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditDetailsDialog } from './audit-details-dialog';

describe('AuditDetailsDialog', () => {
  let component: AuditDetailsDialog;
  let fixture: ComponentFixture<AuditDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditDetailsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditDetailsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
