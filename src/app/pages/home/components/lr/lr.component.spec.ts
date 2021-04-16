import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LrComponent } from './lr.component';

describe('LrComponent', () => {
  let component: LrComponent;
  let fixture: ComponentFixture<LrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
