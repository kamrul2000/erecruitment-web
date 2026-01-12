import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageDialog } from './stage-dialog';

describe('StageDialog', () => {
  let component: StageDialog;
  let fixture: ComponentFixture<StageDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StageDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
