import { Component, Input, OnInit } from '@angular/core';
import { Grammar } from 'src/app/models/grammar';
import { CalcLlService } from '../../services/calc-ll.service';
import { CalcLrService } from '../../services/calc-lr.service';


@Component({
  selector: 'app-calc-grammar',
  templateUrl: './calc-grammar.component.html',
  styleUrls: ['./calc-grammar.component.scss']
})
export class CalcGrammarComponent implements OnInit {

  @Input()
  public grammar: Grammar = undefined;

  public state = 0;

  public graph = '';

  constructor(public calcLlService: CalcLlService,
              public calcLrService: CalcLrService) { }

  ngOnInit(): void {}

  public calculateLL(): void {
    this.state = 1;
    this.calcLlService.calculateLL(this.grammar);
  }

  public calculateLR(): void {
    this.state = 2;
    this.calcLlService.calculateLL(this.grammar);
    this.calcLrService.calculateLr(this.grammar);
    this.graph = this.calcLrService.getAutomatonString();
  }

}
