import { Component, OnInit } from '@angular/core';
import { ArrayStrategy, NumberStrategy } from 'src/app/models/strategies/strategy';
import { CalculationsService } from '../../services/calculations.service';
import { ShowGrammarService } from '../../services/show-grammar.service';

@Component({
  selector: 'app-calc-grammar',
  templateUrl: './calc-grammar.component.html',
  styleUrls: ['./calc-grammar.component.scss']
})
export class CalcGrammarComponent implements OnInit {

  customClass='custom-accordion-style';

  constructor(public showGrammarService: ShowGrammarService,
              public calculationsService: CalculationsService) { }

  ngOnInit(): void {

  }

  getArrayStrategy() {
    return new ArrayStrategy();
  }

  getNumberStrategy() {
    return new NumberStrategy();
  }

}
