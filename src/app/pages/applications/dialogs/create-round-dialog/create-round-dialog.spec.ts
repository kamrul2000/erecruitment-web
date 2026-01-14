import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRoundDialog } from './create-round-dialog';

describe('CreateRoundDialog', () => {
  let component: CreateRoundDialog;
  let fixture: ComponentFixture<CreateRoundDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoundDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRoundDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
