import { Component, Input, OnInit } from '@angular/core';
import { Grammar } from 'src/app/models/grammar';


@Component({
  selector: 'app-calc-grammar',
  templateUrl: './calc-grammar.component.html',
  styleUrls: ['./calc-grammar.component.scss']
})
export class CalcGrammarComponent implements OnInit {

  @Input()
  public grammar: Grammar = undefined;

  public state = 0;

  constructor() { }

  ngOnInit(): void {}

  public calculateLL(): void {
    this.state = 1;
  }

  public calculateLR(): void {
    this.state = 2;
  }


}
