import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisNetwork } from './vis-network';

describe('VisNetwork', () => {
  let component: VisNetwork;
  let fixture: ComponentFixture<VisNetwork>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisNetwork]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisNetwork);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
