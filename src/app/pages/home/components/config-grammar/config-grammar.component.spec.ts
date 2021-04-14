import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigGrammarComponent } from './config-grammar.component';

describe('ConfigGrammarComponent', () => {
  let component: ConfigGrammarComponent;
  let fixture: ComponentFixture<ConfigGrammarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigGrammarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigGrammarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
