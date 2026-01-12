import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicJobs } from './public-jobs';

describe('PublicJobs', () => {
  let component: PublicJobs;
  let fixture: ComponentFixture<PublicJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicJobs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicJobs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
