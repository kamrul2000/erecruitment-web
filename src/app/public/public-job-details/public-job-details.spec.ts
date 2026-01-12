import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicJobDetails } from './public-job-details';

describe('PublicJobDetails', () => {
  let component: PublicJobDetails;
  let fixture: ComponentFixture<PublicJobDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicJobDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicJobDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
