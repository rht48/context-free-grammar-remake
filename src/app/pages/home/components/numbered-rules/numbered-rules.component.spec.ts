import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberedRulesComponent } from './numbered-rules.component';

describe('NumberedRulesComponent', () => {
  let component: NumberedRulesComponent;
  let fixture: ComponentFixture<NumberedRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumberedRulesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberedRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
