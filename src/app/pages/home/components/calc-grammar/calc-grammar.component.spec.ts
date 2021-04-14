import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalcGrammarComponent } from './calc-grammar.component';

describe('CalcGrammarComponent', () => {
  let component: CalcGrammarComponent;
  let fixture: ComponentFixture<CalcGrammarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalcGrammarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalcGrammarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
