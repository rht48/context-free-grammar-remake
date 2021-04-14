import { TestBed } from '@angular/core/testing';

import { ShowGrammarService } from './show-grammar.service';

describe('ShowGrammarService', () => {
  let service: ShowGrammarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShowGrammarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
