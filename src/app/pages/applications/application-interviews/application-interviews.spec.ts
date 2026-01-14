import { ComponentFixture, TestBed } from '@angular/core/testing';

  import { ApplicationInterviews } from './application-interviews';

describe('ApplicationInterviews', () => {
  let component: ApplicationInterviews;
  let fixture: ComponentFixture<ApplicationInterviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationInterviews]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationInterviews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
