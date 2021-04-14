import { Component, OnInit } from '@angular/core';
import { CalculationsService } from '../../services/calculations.service';
import { ParseService } from '../../services/parse.service';

@Component({
  selector: 'app-parse',
  templateUrl: './parse.component.html',
  styleUrls: ['./parse.component.scss']
})
export class ParseComponent implements OnInit {

  constructor(public parseService: ParseService,
              public calculationsService: CalculationsService) { }

  stack: string = '';
  steps: string = '';

  ngOnInit(): void {
    this.parse('eof');
  }

  parse(input: string) {
    this.parseService.parse(input);
  }

  verify(): void {
    this.parseService.verify(this.calculationsService.getLLTable(), this.calculationsService.getGrammar());
    this.stack = this.parseService.getStringStack();
    this.steps = this.parseService.getStringSteps();
  }

}
