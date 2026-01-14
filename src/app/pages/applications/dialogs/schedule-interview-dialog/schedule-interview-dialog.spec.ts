import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleInterviewDialog } from './schedule-interview-dialog';

describe('ScheduleInterviewDialog', () => {
  let component: ScheduleInterviewDialog;
  let fixture: ComponentFixture<ScheduleInterviewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleInterviewDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleInterviewDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
