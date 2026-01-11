import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryDialog } from './history-dialog';

describe('HistoryDialog', () => {
  let component: HistoryDialog;
  let fixture: ComponentFixture<HistoryDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
