import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonTerminalsComponent } from './non-terminals.component';

describe('NonTerminalsComponent', () => {
  let component: NonTerminalsComponent;
  let fixture: ComponentFixture<NonTerminalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonTerminalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NonTerminalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
