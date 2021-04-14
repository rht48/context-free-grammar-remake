import { TestBed } from '@angular/core/testing';

import { GrammarService } from './grammar.service';

describe('GrammarService', () => {
  let service: GrammarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrammarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
