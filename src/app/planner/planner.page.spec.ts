import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlannerPageComponent } from './planner.page';
import { provideHttpClient } from '@angular/common/http';

describe('PlannerPageComponent', () => {
  let component: PlannerPageComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlannerPageComponent],
      providers: [provideZonelessChangeDetection(), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(PlannerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
