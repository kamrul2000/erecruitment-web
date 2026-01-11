import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateDialog } from './candidate-dialog';

describe('CandidateDialog', () => {
  let component: CandidateDialog;
  let fixture: ComponentFixture<CandidateDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
