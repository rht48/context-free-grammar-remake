import { AfterContentChecked, AfterContentInit, AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Grammar } from 'src/app/models/grammar';
import { CalcLrService } from '../../services/calc-lr.service';

@Component({
  selector: 'app-lr',
  templateUrl: './lr.component.html',
  styleUrls: ['./lr.component.scss']
})
export class LrComponent implements OnInit {

  @Input()
  graph = 'stateDiagram-v2;';

  @Input()
  parserTable = {};

  public inputString = Grammar.EOF;
  public input = [Grammar.EOF];
  public table = {};

  constructor(public calcLrService: CalcLrService) { }
  
 

  ngOnInit(): void {
    this.graph = this.calcLrService.getAutomatonString();
  }

  public verify(): void {
    this.table = this.calcLrService.verify(this.input);
    // this.tree = this.calcLlService.getTree(stack);
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
