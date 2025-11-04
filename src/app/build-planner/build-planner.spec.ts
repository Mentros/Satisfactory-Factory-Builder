import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildPlanner } from './build-planner';

describe('BuildPlanner', () => {
  let component: BuildPlanner;
  let fixture: ComponentFixture<BuildPlanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildPlanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildPlanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
