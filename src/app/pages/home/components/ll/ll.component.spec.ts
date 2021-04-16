import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LlComponent } from './ll.component';

describe('LlComponent', () => {
  let component: LlComponent;
  let fixture: ComponentFixture<LlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
