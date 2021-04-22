import { Component, OnInit } from '@angular/core';
import { Grammar } from 'src/app/models/grammar';
import { ArrayStrategy, NumberArrayStrategy, NumberStrategy } from 'src/app/models/strategies/strategy';
import { CalcLlService } from '../../services/calc-ll.service';

@Component({
  selector: 'app-ll',
  templateUrl: './ll.component.html',
  styleUrls: ['./ll.component.scss']
})
export class LlComponent implements OnInit {

  public inputString = Grammar.EOF;
  public input = [Grammar.EOF];

  public resetTree = 'graph TB;'
  public tree = this.resetTree;

  constructor(public calcLlService: CalcLlService) { }

  ngOnInit(): void {
  }

  public getArrayStrategy() {
    return new ArrayStrategy();
  }

  public getNumberStrategy() {
    return new NumberStrategy();
  }

  public getNumberArrayStrategy() {
    return new NumberArrayStrategy();
  }

  public verify(): void {
    const stack = this.calcLlService.getGraph(this.input);
    this.tree = this.calcLlService.getTree(stack);
  }

  public parse(text: string): void {
    const split = text.split(" ");
    this.input = split;
    if(this.input.indexOf(Grammar.EOF) < 0) {
      this.input.push(Grammar.EOF);
    }

    this.input = this.input.filter(elt => elt !== Grammar.EPSILON);
    this.inputString = this.input.join(" ");
  }

}
