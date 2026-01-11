import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusDialog } from './status-dialog';

describe('StatusDialog', () => {
  let component: StatusDialog;
  let fixture: ComponentFixture<StatusDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
